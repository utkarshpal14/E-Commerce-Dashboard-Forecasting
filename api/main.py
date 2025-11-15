from functools import lru_cache
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import pandas as pd
import numpy as np
import os
import aiosmtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from pathlib import Path

# Load .env deterministically from this api folder
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

app = FastAPI(title="E-Commerce Analytics API", version="0.1.0")

# CORS for local dev (adjust allowed origins for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://e-commerce-dashboard-forecasting.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.getenv("DATA_PATH", "../data/processed/Amazon_Sales_Cleaned.csv")

@lru_cache(maxsize=1)
def load_data_cached() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH, low_memory=False)
    if 'Date' not in df.columns:
        raise RuntimeError("Processed CSV must contain a 'Date' column")
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    df = df.dropna(subset=['Date']).copy()
    # Ensure expected columns exist
    for col in ['Total_Amount','Qty','Category','ship-city','ship-state']:
        if col not in df.columns:
            df[col] = np.nan
    df['MonthStart'] = df['Date'].dt.to_period('M').dt.to_timestamp()
    return df


def apply_filters(df: pd.DataFrame,
                  categories: Optional[List[str]] = None,
                  cities: Optional[List[str]] = None,
                  states: Optional[List[str]] = None,
                  start_date: Optional[str] = None,
                  end_date: Optional[str] = None) -> pd.DataFrame:
    out = df
    if categories:
        out = out[out['Category'].astype(str).isin(categories)]
    if cities:
        out = out[out['ship-city'].astype(str).isin(cities)]
    if states:
        out = out[out['ship-state'].astype(str).isin(states)]
    if start_date:
        sd = pd.to_datetime(start_date, errors='coerce')
        out = out[out['Date'] >= sd]
    if end_date:
        ed = pd.to_datetime(end_date, errors='coerce')
        out = out[out['Date'] <= ed]
    return out.copy()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/filters")
def get_filters():
    df = load_data_cached()
    categories = sorted(df['Category'].dropna().astype(str).unique().tolist())
    cities = sorted(df['ship-city'].dropna().astype(str).unique().tolist())
    states = sorted(df['ship-state'].dropna().astype(str).unique().tolist())
    # Map each state to its unique set of cities for dependent dropdowns on the UI
    cities_by_state = (
        df.dropna(subset=['ship-state'])
          .assign(**{
              'ship-state': df['ship-state'].astype(str),
              'ship-city': df['ship-city'].astype(str)
          })
          .groupby('ship-state')['ship-city']
          .apply(lambda s: sorted(s.dropna().astype(str).unique().tolist()))
          .to_dict()
    )
    date_min = df['Date'].min().date().isoformat()
    date_max = df['Date'].max().date().isoformat()
    return {
        "categories": categories,
        "cities": cities,
        "states": states,
        "cities_by_state": cities_by_state,
        "date_min": date_min,
        "date_max": date_max,
    }


@app.get("/kpis")
def kpis(
    categories: Optional[List[str]] = Query(default=None),
    cities: Optional[List[str]] = Query(default=None),
    states: Optional[List[str]] = Query(default=None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    df = load_data_cached()
    f = apply_filters(df, categories, cities, states, start_date, end_date)
    total_revenue = float(f['Total_Amount'].sum()) if 'Total_Amount' in f else 0.0
    total_orders = int(f.shape[0])
    avg_order_value = float(f['Total_Amount'].mean()) if total_orders else 0.0
    total_quantity = int(f['Qty'].sum()) if 'Qty' in f else 0

    monthly = f.groupby('MonthStart')['Total_Amount'].sum().sort_index()
    last_val = float(monthly.iloc[-1]) if len(monthly) else 0.0
    prev_val = float(monthly.iloc[-2]) if len(monthly) >= 2 else 0.0
    delta = last_val - prev_val
    delta_pct = (delta / prev_val * 100.0) if prev_val else None

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "avg_order_value": avg_order_value,
        "total_quantity": total_quantity,
        "last_month_revenue": last_val,
        "mom_delta": delta,
        "mom_delta_pct": delta_pct,
    }


@app.get("/timeseries")
def timeseries(
    granularity: str = "month",
    categories: Optional[List[str]] = Query(default=None),
    cities: Optional[List[str]] = Query(default=None),
    states: Optional[List[str]] = Query(default=None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    df = load_data_cached()
    f = apply_filters(df, categories, cities, states, start_date, end_date)
    if granularity == 'day':
        ts = f.groupby(f['Date'].dt.date)['Total_Amount'].sum().reset_index()
        ts['Date'] = ts['Date'].astype(str)
        return {"points": ts.rename(columns={'Date':'date','Total_Amount':'value'}).to_dict(orient='records')}
    ts = f.groupby('MonthStart')['Total_Amount'].sum().reset_index()
    ts['MonthStart'] = ts['MonthStart'].dt.date.astype(str)
    return {"points": ts.rename(columns={'MonthStart':'date','Total_Amount':'value'}).to_dict(orient='records')}


@app.get("/categories")
def by_category(
    categories: Optional[List[str]] = Query(default=None),
    cities: Optional[List[str]] = Query(default=None),
    states: Optional[List[str]] = Query(default=None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    df = load_data_cached()
    f = apply_filters(df, categories, cities, states, start_date, end_date)
    agg = f.groupby('Category')['Total_Amount'].sum().sort_values(ascending=False).reset_index()
    agg['Category'] = agg['Category'].astype(str)
    return {"items": agg.rename(columns={'Total_Amount':'value'}).to_dict(orient='records')}


@app.get("/regions")
def by_region(
    level: str = "state",
    categories: Optional[List[str]] = Query(default=None),
    cities: Optional[List[str]] = Query(default=None),
    states: Optional[List[str]] = Query(default=None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    df = load_data_cached()
    f = apply_filters(df, categories, cities, states, start_date, end_date)
    col = 'ship-state' if level == 'state' else 'ship-city'
    agg = f.groupby(col)['Total_Amount'].sum().sort_values(ascending=False).reset_index()
    agg[col] = agg[col].astype(str)
    return {"items": agg.rename(columns={col:'name','Total_Amount':'value'}).to_dict(orient='records')}


@app.get("/forecast")
def forecast(
    h: int = 3,
    model: str = "linear",
    categories: Optional[List[str]] = Query(default=None),
    cities: Optional[List[str]] = Query(default=None),
    states: Optional[List[str]] = Query(default=None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    df = load_data_cached()
    f = apply_filters(df, categories, cities, states, start_date, end_date)
    monthly = f.groupby('MonthStart')['Total_Amount'].sum().sort_index()
    if len(monthly) == 0:
        return {"history": [], "forecast": []}
    # Simple linear regression using numpy.polyfit (avoid heavy deps)
    x = np.arange(len(monthly))
    y = monthly.values.astype(float)
    a, b = np.polyfit(x, y, deg=1)  # y = a*x + b
    future_idx = np.arange(len(monthly), len(monthly) + h)
    yhat = a * future_idx + b

    last_month = monthly.index[-1]
    future_dates = pd.date_range(last_month + pd.offsets.MonthBegin(1), periods=h, freq='MS')
    history = pd.DataFrame({"date": monthly.index.date.astype(str), "value": monthly.values}).to_dict(orient='records')
    forecast_points = pd.DataFrame({"date": future_dates.date.astype(str), "value": yhat}).to_dict(orient='records')
    return {"history": history, "forecast": forecast_points}


# ---------------------- Contact Endpoint (Email) ----------------------
class Contact(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str


def _build_email(payload: Contact) -> EmailMessage:
    msg = EmailMessage()
    from_addr = os.getenv("SMTP_USER", "no-reply@example.com")
    to_addr = os.getenv("CONTACT_TO")
    if not to_addr:
        raise RuntimeError("CONTACT_TO env var is not set")
    msg["From"] = from_addr
    msg["To"] = to_addr
    # Ensure replies go to the user's email
    msg["Reply-To"] = str(payload.email)
    subj = payload.subject or f"New contact message from {payload.name}"
    msg["Subject"] = subj
    text = f"From: {payload.name} <{payload.email}>\n\n{payload.message}"
    html = f"<p><b>From:</b> {payload.name} &lt;{payload.email}&gt;</p><p>{payload.message.replace(chr(10), '<br/>')}</p>"
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    return msg


@app.post("/contact")
async def send_contact(payload: Contact):
    try:
        msg = _build_email(payload)
        host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        port = int(os.getenv("SMTP_PORT", "587"))
        username = os.getenv("SMTP_USER")
        password = os.getenv("SMTP_PASS")
        if not (username and password):
            raise RuntimeError("SMTP_USER/SMTP_PASS not configured")
        await aiosmtplib.send(
            msg,
            hostname=host,
            port=port,
            start_tls=True,
            username=username,
            password=password,
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
