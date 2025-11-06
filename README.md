# 🌍 Aftershock Monitor - Earthquake Aftershock Probability Prediction System

A comprehensive real-time earthquake aftershock monitoring and prediction system using statistical seismology and machine learning.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## 🎯 Overview

The Aftershock Monitor is a data-driven probabilistic forecasting system that predicts the occurrence and magnitude probability of aftershocks using established statistical laws of seismology. It provides short- and medium-term forecasts to assist in disaster preparedness and mitigation.

### Real-World Applications

- **Emergency Response**: Plan evacuation and relief efforts
- **Construction Safety**: Guide safety inspections in affected regions
- **Public Safety**: Issue timely alerts to communities
- **Risk Assessment**: Support insurance and risk analysis

## ✨ Features

### Live Monitor
- 🗺️ Interactive world map with real-time earthquake data
- 📍 Location-aware with user positioning
- 🔴 Pulsing earthquake markers (magnitude-based)
- 📊 Detailed aftershock predictions
- ⏱️ Time filters (Week/Month/Year)
- 📈 Decay curves and probability charts

### Model Explorer
- 🌐 Global coverage map with 500+ regional models
- 📊 Model quality dashboard
- 📈 Training statistics and validation metrics
- 🔬 Scientific methodology explanation

### Predictions
- ⏰ Temporal forecasts (24h, 7d, 30d, 1y)
- 📏 Magnitude probability distributions
- 🚨 Risk level assessment
- 💡 Safety recommendations
- 📄 Exportable reports

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js + React + Tailwind CSS + Leaflet.js   │
│                                                  │
│  • Live Monitor                                 │
│  • Model Explorer                               │
│  • About/Methodology                            │
└───────────────────┬─────────────────────────────┘
                    │ REST API
┌───────────────────▼─────────────────────────────┐
│              Backend API                         │
│           FastAPI + Python                       │
│                                                  │
│  • Earthquake data fetching (USGS)              │
│  • Model loading & queries                      │
│  • Aftershock predictions                       │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│            Trained Models                        │
│    Regional Models (JSON) + Global Fallback     │
│                                                  │
│  • 500+ regional 5°×5° grid models             │
│  • Omori parameters (p, c, K)                   │
│  • Gutenberg-Richter parameters (a, b)          │
└─────────────────────────────────────────────────┘
```

## 📦 Prerequisites

### Backend
- Python 3.8 or higher
- pip (Python package manager)

### Frontend
- Node.js 16.x or higher
- npm or yarn package manager

### Models
- Trained regional model files (.json)
- Place them in `models/regional_models/` directory

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd aftershock-monitor
```

### 2. Setup Models

Copy your trained model files to the models directory:

```bash
mkdir -p models/regional_models
# Copy your region_*.json files to models/regional_models/
# Copy global_fallback.json to models/regional_models/
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local if needed (default uses localhost:8000)
```

## 🎮 Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The backend API will start at: `http://localhost:8000`

**Verify backend:**
```bash
curl http://localhost:8000/api/health
```

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
# or
yarn dev
```

The frontend will start at: `http://localhost:3000`

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
aftershock-monitor/
│
├── backend/                    # FastAPI backend
│   ├── main.py                # Main API server
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # Next.js frontend
│   ├── components/            # React components
│   │   ├── Map/              # Map components
│   │   ├── Earthquake/       # Earthquake display
│   │   ├── Forecast/         # Prediction charts
│   │   └── UI/               # UI components
│   ├── pages/                # Next.js pages
│   │   ├── index.js          # Live Monitor
│   │   ├── models.js         # Model Explorer
│   │   └── about.js          # About page
│   ├── styles/               # CSS styles
│   ├── utils/                # Utility functions
│   └── package.json          # Node dependencies
│
├── models/                    # Trained models
│   └── regional_models/
│       ├── region_*.json     # Regional models
│       └── global_fallback.json
│
└── README.md                 # This file
```

## 🔌 API Documentation

### Endpoints

#### Health Check
```
GET /api/health
```

#### Get Recent Earthquakes
```
GET /api/earthquakes?days=7&min_magnitude=4.0
```

#### Predict Aftershocks
```
POST /api/predict
Body: {
  "magnitude": 5.5,
  "latitude": 35.7,
  "longitude": 139.7,
  "tectonic_setting": "ring_of_fire"  // optional
}
```

#### Get Model Coverage
```
GET /api/models/coverage
```

#### Get Model Details
```
GET /api/models/{region_id}
```

### API Response Example

```json
{
  "success": true,
  "predictions": {
    "mainshock": {
      "magnitude": 5.5,
      "latitude": 35.7,
      "longitude": 139.7
    },
    "model_info": {
      "region_id": "region_0234",
      "source": "regional",
      "quality": "medium"
    },
    "forecasts": {
      "day_1": {
        "rate_per_day": 42.5,
        "cumulative_expected": 42.5
      }
    },
    "magnitude_probabilities": {
      "M5.0": {
        "probability": 0.35,
        "percentage": 35.0
      }
    },
    "risk_assessment": {
      "level": "HIGH",
      "color": "#f59e0b",
      "description": "High risk of significant aftershocks",
      "recommendations": [...]
    }
  }
}
```

## 🛠️ Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **NumPy** - Numerical computations
- **Requests** - HTTP client for USGS API
- **Pydantic** - Data validation

### Frontend
- **Next.js 14** - React framework with SSR
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS
- **Leaflet.js** - Interactive maps
- **Chart.js** - Data visualization
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Data Sources
- **USGS Earthquake API** - Real-time earthquake data
- **IRIS** - Seismological data (training)

## 🔧 Configuration

### Backend Configuration

Edit `backend/main.py` to configure:
- Model directory path
- USGS API settings
- Cache duration
- CORS origins

### Frontend Configuration

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Model Training

The system uses pre-trained models based on:

- **Training Period**: 1990-2025 (35 years)
- **Mainshock Threshold**: M ≥ 3.8
- **Aftershock Threshold**: M ≥ 2.5
- **Regional Grid**: 5° × 5°
- **Minimum Data**: 3 sequences, 30 aftershocks per region

### Statistical Models

1. **Omori's Law** (temporal decay)
   ```
   n(t) = K / (t + c)^p
   ```

2. **Gutenberg-Richter Law** (magnitude distribution)
   ```
   log₁₀(N) = a - bM
   ```

## 🚢 Deployment

### Backend Deployment
- Railway

### Frontend Deployment
- Netlify

Update the API URL in production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## ⚠️ Important Disclaimer

These predictions are **probabilistic forecasts** based on historical seismic patterns and statistical models. While trained on 35 years of data and validated using rigorous methods, earthquake prediction remains an inherently uncertain science.

**Always follow official guidance** from local authorities and seismological institutions. This tool should be used as supplementary information, not as a replacement for official warnings.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Python, FastAPI, React, and Next.js**
