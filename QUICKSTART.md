# 🚀 Quick Start Guide

Get the Aftershock Monitor up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Trained model files (.json) ready

## Step-by-Step Setup

### 1️⃣ Prepare Your Models

```bash
# Create models directory
mkdir -p models/regional_models

# Copy your trained model files
# Place region_*.json files in models/regional_models/
# Place global_fallback.json in models/regional_models/
```

Example model files you should have:
- `region_0001.json`
- `region_0002.json`
- ...
- `global_fallback.json`

### 2️⃣ Setup Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

✅ Backend should be running at: `http://localhost:8000`

**Test it:**
```bash
curl http://localhost:8000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "models_loaded": 500,
  "has_global_model": true
}
```

### 3️⃣ Setup Frontend (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

✅ Frontend should be running at: `http://localhost:3000`

### 4️⃣ Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 🎯 What You Should See

1. **Live Monitor** (Home Page)
   - Interactive dark-themed world map
   - Recent earthquakes listed in sidebar
   - Click any earthquake to see predictions

2. **Models Page**
   - Statistics about trained models
   - Quality distribution
   - Regional coverage table

3. **About Page**
   - Methodology explanation
   - Technical details
   - Disclaimers

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError`
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Problem**: `No models available`
```bash
# Check if models directory exists and has JSON files
ls -la models/regional_models/
# Should show region_*.json files
```

**Problem**: `Port 8000 already in use`
```bash
# Kill the process using port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend Issues

**Problem**: `Cannot find module`
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Problem**: `Port 3000 already in use`
```bash
# Next.js will automatically try port 3001
# Or kill the process:
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

**Problem**: Map not loading
- Check browser console for errors
- Ensure backend is running
- Clear browser cache

### API Connection Issues

**Problem**: Frontend can't reach backend
1. Check `.env.local` has correct API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
2. Restart frontend dev server
3. Check backend is running: `curl http://localhost:8000/api/health`

## 📱 Features to Try

### Live Monitor
1. Click "Use Location" to center map on your location
2. Filter by time period (Week/Month/Year)
3. Click any earthquake marker to see predictions
4. View detailed aftershock forecasts

### Predictions
1. Select an earthquake
2. View risk assessment
3. See decay curves
4. Check magnitude probabilities
5. Read safety recommendations

### Model Explorer
1. View total models trained
2. Check quality distribution
3. Browse regional model details
4. Read methodology

## 🚀 Next Steps

1. **Customize**: Edit colors, text, or add features
2. **Deploy**: Follow deployment guides for production
3. **Update Models**: Retrain with new data periodically
4. **Monitor**: Check API logs for issues

## 💡 Tips

- Keep backend running in one terminal
- Keep frontend running in another terminal
- Use browser dev tools (F12) to debug
- Check API responses at `http://localhost:8000/docs`
- Models are cached - restart backend after updating models

## 📚 Additional Resources

- FastAPI Docs: https://fastapi.tiangolo.com
- Next.js Docs: https://nextjs.org/docs
- Leaflet.js Docs: https://leafletjs.com
- USGS API: https://earthquake.usgs.gov/fdsnws/event/1/

## 🆘 Still Having Issues?

1. Check the main README.md for detailed documentation
2. Review error messages in terminal/browser console
3. Verify all prerequisites are installed correctly
4. Ensure model files are in the correct location
5. Check that ports 3000 and 8000 are not blocked by firewall

---

**Need Help?** Open an issue on GitHub with:
- Error messages
- System info (OS, Python version, Node version)
- Steps you've tried