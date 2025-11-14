import argparse
import math
import os
from datetime import date, datetime, timedelta

import numpy as np
import pandas as pd

# Columns expected in the cleaned CSV
REQUIRED_COLS = [
    "Date",
    "Total_Amount",
    "Qty",
    "Category",
    "ship-city",
    "ship-state",
]


def _month_start(d: date) -> date:
    return d.replace(day=1)


def _random_date_in_month(year: int, month: int, rng: np.random.Generator) -> datetime:
    start = datetime(year, month, 1)
    end = datetime(year + (month // 12), (month % 12) + 1, 1)
    span_days = (end - start).days
    return start + timedelta(days=int(rng.integers(0, span_days)))


def main():
    ap = argparse.ArgumentParser(description="Augment Amazon Sales CSV with last N months of synthetic data")
    ap.add_argument(
        "--input",
        default=os.path.join("..", "data", "processed", "Amazon_Sales_Cleaned.csv"),
        help="Path to input cleaned CSV",
    )
    ap.add_argument(
        "--output",
        default=os.path.join("..", "data", "processed", "Amazon_Sales_Cleaned_augmented.csv"),
        help="Output CSV path",
    )
    ap.add_argument("--months", type=int, default=12, help="How many recent months to synthesize")
    ap.add_argument("--scale", type=float, default=1.0, help="Multiply baseline per-month orders by this factor (e.g., 0.5, 1.0, 2.0)")
    ap.add_argument("--max-per-month", type=int, default=None, help="Optional hard cap on synthetic orders per month")
    ap.add_argument("--seed", type=int, default=42, help="Random seed")
    args = ap.parse_args()

    rng = np.random.default_rng(args.seed)

    # Load
    df = pd.read_csv(args.input, low_memory=False)
    if "Date" not in df.columns:
        raise SystemExit("Input CSV must contain a 'Date' column")

    # Basic cleanup
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"]).copy()

    # Ensure required columns exist
    for c in REQUIRED_COLS:
        if c not in df.columns:
            df[c] = np.nan

    # Numeric coercions
    df["Total_Amount"] = pd.to_numeric(df["Total_Amount"], errors="coerce")
    df["Qty"] = (
        pd.to_numeric(df["Qty"], errors="coerce").fillna(1).clip(lower=1).astype(int)
    )

    # Derive unit price for realism
    unit_price = (df["Total_Amount"] / df["Qty"].clip(lower=1)).replace([np.inf, -np.inf], np.nan)
    unit_price = unit_price.fillna(unit_price.median())
    unit_price = unit_price.clip(lower=1)
    df["__unit_price"] = unit_price

    # Empirical distributions
    categories = df["Category"].astype(str).fillna("Unknown").values
    cities = df["ship-city"].astype(str).fillna("Unknown").values
    states = df["ship-state"].astype(str).fillna("Unknown").values

    # Monthly order count baseline from historical data
    hist_month = df.groupby(df["Date"].dt.to_period("M")).size()
    monthly_baseline = int(hist_month.median()) if len(hist_month) else max(100, len(df) // 12)
    monthly_baseline = max(50, monthly_baseline)  # floor

    # Sampling pool
    pool_idx = df.index.values

    today = date.today()
    start_month = _month_start(today)

    month_frames = []
    other_cols = [c for c in df.columns if c not in ["Date", "Total_Amount", "Qty", "__unit_price"]]

    for m in range(args.months):
        # target month = current month - m
        target_ts = pd.Timestamp(start_month) - pd.offsets.MonthBegin(m)
        year, month = target_ts.year, target_ts.month

        # growth & seasonality
        growth = 1.0 + 0.01 * m  # gentle drift
        season = 1.0 + 0.10 * math.sin((month - 1) / 12 * 2 * math.pi)
        mean_n = monthly_baseline * args.scale * season * growth
        n_orders = int(rng.normal(loc=mean_n, scale=max(10, 0.15 * mean_n)))
        n_orders = max(20, n_orders)
        if args.max_per_month:
            n_orders = min(n_orders, args.max_per_month)

        # Vectorized sampling
        sampled_idx = rng.choice(pool_idx, size=n_orders, replace=True)
        rows = df.loc[sampled_idx]

        # Dates vector
        start_dt = datetime(year, month, 1)
        next_month = datetime(year + (month // 12), (month % 12) + 1, 1)
        span_days = (next_month - start_dt).days
        day_offsets = rng.integers(0, span_days, size=n_orders)
        dates = [start_dt + timedelta(days=int(d)) for d in day_offsets]

        # Quantity vector (Poisson around original qty)
        lam = rows["Qty"].astype(float).clip(lower=1).to_numpy()
        qty = np.clip(rng.poisson(lam=lam), 1, 100).astype(int)

        # Unit price vector (lognormal noise)
        base_price = rows["__unit_price"].to_numpy()
        base_price = np.where(np.isnan(base_price), np.nanmedian(df["__unit_price"].to_numpy()), base_price)
        price_mult = rng.lognormal(mean=0.0, sigma=0.25, size=n_orders)
        unit = np.maximum(1.0, base_price * price_mult)
        amount = np.round(unit * qty, 2)

        # Build month frame
        month_df = rows[other_cols].reset_index(drop=True).copy()
        month_df["Date"] = dates
        month_df["Qty"] = qty
        month_df["Total_Amount"] = amount
        month_frames.append(month_df)

    synth_df = pd.concat(month_frames, ignore_index=True) if month_frames else pd.DataFrame(columns=df.columns)

    # Align columns to input order (drop helper)
    out_cols = [c for c in df.columns if c != "__unit_price"]
    combined = pd.concat([df[out_cols], synth_df[out_cols]], ignore_index=True)
    combined = combined.sort_values("Date")

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    combined.to_csv(args.output, index=False)
    print(f"Wrote augmented dataset: {args.output}  (rows: {len(combined)})")


if __name__ == "__main__":
    main()
