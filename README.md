# E-Commerce Dashboard & Forecasting

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

## 📋 Overview

E-Commerce Dashboard & Forecasting is a comprehensive analytics platform designed to help businesses track sales performance, analyze customer behavior, and predict future trends. This full-stack application combines the power of React for the frontend and FastAPI for the backend, providing real-time insights through interactive visualizations.

### Key Features

- **Real-time Analytics**: Monitor sales performance with up-to-the-minute data
- **Interactive Visualizations**: Explore data through intuitive charts and graphs
- **Sales Forecasting**: Leverage predictive analytics to anticipate market trends
- **Multi-dimensional Analysis**: Slice data by categories, regions, and time periods
- **Responsive Design**: Access your dashboard from any device
- **Secure Authentication**: Protected user accounts with role-based access
- **Data Export**: Download reports in multiple formats for further analysis

Built with modern web technologies, this dashboard helps businesses make data-driven decisions by transforming raw sales data into actionable insights.





## 📊 Dashboard Preview

<div align="center">
  <!-- Main Dashboard -->
  <!-- <img src="screenshots/dashboard-main.png" alt="Main Dashboard View" width="80%">
   -->
<img width=80%  alt="Screenshot 2025-11-14 015633" src="https://github.com/user-attachments/assets/44afc7cd-20f3-416a-a6f7-b8e60e574f25" />
<img width=80%  alt="Screenshot 2025-11-14 015953" src="https://github.com/user-attachments/assets/1d60f549-a988-4947-ade0-465a733ce4e7" />
</div>

## 📊 Sales Analysis 
<div align="center">
  <!-- Sales Analytics -->
  <div style="display: flex; justify-content: space-between; margin: 10px 0;">
    <!-- <img src="screenshots/sales-metrics.png" alt="Sales Metrics" width="48%"> -->
    <img width=70% alt="Screenshot 2025-11-14 020023" src="https://github.com/user-attachments/assets/9f754786-39c1-4328-9d6e-ea046f5b5c6e" />
    
   
  </div>
  
  <!-- Regional Analysis -->
  <div style="display: flex; justify-content: space-between; margin: 10px 0;">
    <!-- <img width=48% src="screenshots/regional-sales.png"  width="48%"> -->
    <img width=70% alt="Screenshot 2025-11-14 020051" src="https://github.com/user-attachments/assets/325b726a-c226-4ddd-9b95-85e53695f058" />

  </div>
</div>

## 🔐 Login Page

<div align="center">
  <!-- Login Page -->
  <!-- <img src="screenshots/login-page.png" alt="Login Page" width="50%" style="border: 1px solid #e1e4e8; border-radius: 8px;"> -->
  <img  alt="Screenshot 2025-11-14 015823" src="https://github.com/user-attachments/assets/dfecb655-596b-4340-b4c8-c2aa7a781930" style="border: 1px solid #e1e4e8; border-radius: 8px;/>


  <p><em>Secure login page with email and password authentication</em></p>
</div>

## 🚀 Features

- **Interactive Dashboard**: Real-time visualization of sales metrics and trends
- **Sales Forecasting**: Predictive analytics for future sales trends
- **Data Filtering**: Filter by category, region, and time period
- **Responsive Design**: Works on all devices
- **Contact Form**: Built-in contact functionality

## Project Structure

- `data/raw/Amazon Sale Report.csv` – Original raw dataset
- `data/processed/Amazon_Sales_Cleaned.csv` – Cleaned dataset used by API & notebooks
- `data/processed/sales.db` – SQLite DB used for SQL queries
- [api/](cci:7://file:///c:/Users/Utkarsh%20Pal/OneDrive/%E6%96%87%E6%A1%A3/E-Commerce%20-%20Copy/api:0:0-0:0) – FastAPI backend
- [ui-web/](cci:7://file:///c:/Users/Utkarsh%20Pal/OneDrive/%E6%96%87%E6%A1%A3/E-Commerce%20-%20Copy/ui-web:0:0-0:0) – React + TypeScript + Vite dashboard
- [notebooks/](cci:7://file:///c:/Users/Utkarsh%20Pal/OneDrive/%E6%96%87%E6%A1%A3/E-Commerce%20-%20Copy/notebooks:0:0-0:0) – Data cleaning, EDA, and forecasting notebooks
- [scripts/](cci:7://file:///c:/Users/Utkarsh%20Pal/OneDrive/%E6%96%87%E6%A1%A3/E-Commerce%20-%20Copy/scripts:0:0-0:0) – Python utility scripts



End-to-end analytics project built on an Amazon-style e-commerce dataset. It covers:

- **Data cleaning & feature engineering** (Python scripts + Jupyter notebooks)
- **FastAPI backend** serving aggregated metrics and forecasts
- **React + TypeScript + Vite dashboard** (in `ui-web/`)
- **SQL exploration** over a SQLite database

The repository includes the core datasets so it can run locally right after cloning.

---

## 1. Project structure

- `data/raw/Amazon Sale Report.csv` – original raw dataset
- `data/processed/Amazon_Sales_Cleaned.csv` – cleaned dataset used by API & notebooks
- `data/processed/sales.db` – SQLite DB used for SQL queries notebook
- `data/processed/agg_*.csv`, `forecast_*.csv`, `sql_*.csv` – aggregated / derived outputs
- `api/` – FastAPI backend
- `ui-web/` – React + TypeScript + Vite dashboard
- `notebooks/` – data cleaning, EDA, forecasting, and SQL demo notebooks
- `scripts/` – Python scripts mirroring notebook logic

> Note: Very large **augmented** CSVs are intentionally kept out of git.
> You can regenerate them locally with `api/augment_data.py` if needed.

---

## 2. Requirements

### Backend + notebooks

- Python 3.10+
- Recommended: virtual environment (e.g. `venv`)

### Frontend

- Node.js 18+ and npm

---

## 3. Set up Python environment (API + notebooks)

From the project root:

```bash
cd ui
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# POSIX
# source .venv/bin/activate

pip install -r requirements.txt
```

This installs dependencies for:

- FastAPI API (`api/` imported from `ui/utils.py` & `ui/app.py`)
- Data processing / forecasting / plotting

If you already have an environment, you can install packages there using `ui/requirements.txt` as a reference.

---

## 4. Run the FastAPI backend

From the project root, with the Python environment activated:

```bash
cd api
uvicorn main:app --reload --port 8000
```

- API base URL: `http://127.0.0.1:8000`
- By default, the API loads data from `../data/processed/Amazon_Sales_Cleaned.csv`.

If you move the data, set the `DATA_PATH` environment variable before starting Uvicorn:

```bash
set DATA_PATH=../data/processed/Amazon_Sales_Cleaned.csv  # Windows CMD
$env:DATA_PATH="../data/processed/Amazon_Sales_Cleaned.csv" # PowerShell
```

---

## 5. Run the React dashboard (ui-web)

In a separate terminal, from the project root:

```bash
cd ui-web
npm install
npm run dev
```

By default Vite serves the app on `http://localhost:5173`.

The `ui-web/src/lib/api.ts` file points to the FastAPI backend at `http://localhost:8000` (adjust if needed).

---

## 6. Working with the data & notebooks

### Cleaning & SQLite export

The main cleaning logic is in:

- `notebooks/02_cleaning.ipynb`
- `scripts/clean_data.py`

They read from:

- `data/raw/Amazon Sale Report.csv`

and generate:

- `data/processed/Amazon_Sales_Cleaned.csv`
- `data/processed/sales.db` (SQLite DB with `sales` table)

Re-run the notebook or script if you want to tweak or extend the cleaning logic.

### Forecasting

Use:

- `notebooks/05_forecast.ipynb`
- `scripts/forecasting.py`

These consume the cleaned CSV and output:

- `data/processed/final_forecast_next_months.csv`
- Additional aggregated CSVs under `data/processed/`.

### SQL queries

Use `notebooks/06_sql_queries.ipynb` with `data/processed/sales.db` to run:

- Example SELECT queries
- Aggregations that feed dashboard visuals

---

## 7. Augmented datasets (large synthetic data)

To generate large synthetic / augmented datasets (not tracked in git):

```bash
cd api
python augment_data.py \
  --input ../data/processed/Amazon_Sales_Cleaned.csv \
  --output ../data/processed/Amazon_Sales_Cleaned_augmented.csv \
  --months 12 \
  --scale 1.0
```

- Outputs are **not committed** to git to avoid exceeding GitHub size limits.
- You can adjust `--months`, `--scale`, and `--max-per-month` for different scenarios.

---

## 8. Typical workflow after cloning

1. Clone the repo:
   ```bash
   git clone https://github.com/utkarshpal14/E-Commerce-Dashboard-Forecasting.git
   cd E-Commerce-Dashboard-Forecasting
   ```
2. Verify that `data/raw/` and `data/processed/` contain the core CSV/DB files.
3. Set up and activate the Python environment (section 3).
4. Start the FastAPI backend (section 4).
5. Start the React dashboard (section 5).
6. Optionally open and run notebooks in `notebooks/` for exploration.

You now have a fully working local environment that mirrors the original project setup.
