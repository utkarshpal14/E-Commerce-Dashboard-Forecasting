# Backend Setup Guide

## Quick Start

### Option 1: Using the Script (Windows)
1. Double-click `start_backend.bat` in the `api` folder

### Option 2: Manual Setup

1. **Install Python dependencies:**
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Verify data file exists:**
   - Check that `../data/processed/Amazon_Sales_Cleaned.csv` exists
   - The backend will print an error if the file is missing

3. **Run the backend:**
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

4. **Verify it's running:**
   - Open your browser and go to: `http://localhost:8000`
   - You should see a JSON response with API information
   - API docs available at: `http://localhost:8000/docs`

## Troubleshooting

### Error: "Data file not found"
- Make sure you're running from the `api` directory
- Verify the file exists at: `data/processed/Amazon_Sales_Cleaned.csv` (relative to project root)

### Error: "Module not found"
- Make sure you've installed all dependencies: `pip install -r requirements.txt`
- Check that you're using Python 3.10 or higher

### Port 8000 already in use
- Change the port: `uvicorn main:app --reload --port 8001`
- Update the frontend API URL in `ui-web/src/lib/api.ts` to match

## Environment Variables (Optional)

If you need to configure email for the contact form, create a `.env` file in the `api` folder:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO=recipient@example.com
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /filters` - Get available filter options
- `GET /kpis` - Get key performance indicators
- `GET /timeseries` - Get time series data
- `GET /categories` - Get revenue by category
- `GET /regions` - Get revenue by region
- `GET /forecast` - Get forecast data
- `POST /contact` - Send contact form email

Full API documentation: `http://localhost:8000/docs`

