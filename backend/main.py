"""
Earthquake Aftershock Monitor - FastAPI Backend
Main API server for serving predictions and earthquake data
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import json
import pickle
from pathlib import Path
import logging
import requests
from functools import lru_cache
import numpy as np
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Aftershock Monitor API",
    description="Earthquake aftershock probability prediction API",
    version="1.0.0"
)

# CORS configuration
allowed = os.getenv("ALLOWED_ORIGINS", "*")
allow_list = allowed.split(",") if allowed != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    MODELS_DIR = Path(os.getenv("MODELS_DIR", "../models/regional_models"))
    USGS_API_URL = os.getenv("USGS_API_URL", "https://earthquake.usgs.gov/fdsnws/event/1/query")
    CACHE_DURATION = int(os.getenv("CACHE_DURATION", "300"))  # seconds
    
Config.MODELS_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================================
# DATA MODELS
# ============================================================================

class PredictionRequest(BaseModel):
    magnitude: float = Field(..., ge=3.0, le=10.0, description="Mainshock magnitude")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude")
    tectonic_setting: Optional[str] = Field(None, description="Tectonic setting")

class EarthquakeEvent(BaseModel):
    id: str
    magnitude: float
    latitude: float
    longitude: float
    depth: float
    time: str
    place: str
    updated: str
    url: str
    detail_url: str

# ============================================================================
# MODEL QUERY SYSTEM
# ============================================================================

class AftershockModelQuery:
    """Query system for loading and using trained models"""
    
    def __init__(self, models_dir: Path):
        self.models_dir = Path(models_dir)
        self.regional_models: Dict[str, Any] = {}
        self.global_model: Optional[Any] = None
        self.grid_size = 5.0
        self._load_all_models()
    
    def _load_all_models(self):
        """Load all available models"""
        logger.info(f"Loading models from {self.models_dir}")
        
        # Load regional models
        json_files = list(self.models_dir.glob("region_*.json"))
        logger.info(f"Found {len(json_files)} regional model files")
        
        for json_path in json_files:
            try:
                with open(json_path, 'r') as f:
                    model_data = json.load(f)
                    region_id = model_data['region_id']
                    self.regional_models[region_id] = model_data
            except Exception as e:
                logger.error(f"Error loading {json_path}: {e}")
        
        # Load global fallback model
        global_path = self.models_dir / "global_fallback.json"
        if global_path.exists():
            try:
                with open(global_path, 'r') as f:
                    self.global_model = json.load(f)
                    logger.info("Global fallback model loaded")
            except Exception as e:
                logger.error(f"Error loading global model: {e}")
        
        logger.info(f"Loaded {len(self.regional_models)} regional models")
    
    def find_region_for_location(self, lat: float, lon: float) -> Optional[str]:
        """Find region ID for given location"""
        lat_idx = int((lat + 85) // self.grid_size)
        lon_idx = int((lon + 180) // self.grid_size)
        
        # Search nearby regions
        for model_id, model in self.regional_models.items():
            bounds = model['bounds']
            if (bounds['lat'][0] <= lat <= bounds['lat'][1] and
                bounds['lon'][0] <= lon <= bounds['lon'][1]):
                return model_id
        return None
    
    def get_model_for_earthquake(
        self,
        lat: float,
        lon: float,
        tectonic_setting: Optional[str] = None
    ) -> tuple[Dict, str]:
        """Get appropriate model for earthquake location"""
        
        # Try exact regional match
        region_id = self.find_region_for_location(lat, lon)
        if region_id and region_id in self.regional_models:
            return self.regional_models[region_id], 'regional'
        
        # Use global fallback
        if self.global_model:
            return self.global_model, 'global_fallback'
        
        raise ValueError("No models available")
    
    def predict_aftershocks(
        self,
        mainshock_magnitude: float,
        lat: float,
        lon: float,
        forecast_days: List[int] = [1, 7, 30, 365],
        tectonic_setting: Optional[str] = None
    ) -> Dict:
        """Predict aftershocks for a new earthquake"""
        
        # Get appropriate model
        model, source = self.get_model_for_earthquake(lat, lon, tectonic_setting)
        
        omori = model['omori']
        gr = model['gr']
        
        predictions = {
            'mainshock': {
                'magnitude': mainshock_magnitude,
                'latitude': lat,
                'longitude': lon
            },
            'model_info': {
                'region_id': model['region_id'],
                'source': source,
                'quality': model.get('data_quality', 'unknown'),
                'tectonic_setting': model.get('tectonic_setting', 'unknown'),
                'training_sequences': model.get('n_sequences', 0),
                'training_aftershocks': model.get('n_total_aftershocks', 0),
                'omori_r_squared': model.get('omori_r_squared', 0),
                'gr_r_squared': model.get('gr_r_squared', 0)
            },
            'forecasts': {},
            'magnitude_probabilities': {},
            'risk_assessment': {}
        }
        
        # Omori predictions (temporal decay)
        p, c, K = omori['p'], omori['c'], omori['K']
        
        for days in forecast_days:
            rate = K / (days + c) ** p
            
            # Cumulative expected aftershocks
            if p != 1:
                cumulative = K * ((days + c)**(1-p) - c**(1-p)) / (1-p)
            else:
                cumulative = K * np.log((days + c)/c)
            
            predictions['forecasts'][f'day_{days}'] = {
                'days': days,
                'rate_per_day': float(rate),
                'expected_aftershocks': float(rate),
                'cumulative_expected': float(cumulative)
            }
        
        # G-R magnitude predictions
        b_value = gr['b_value']
        a_value = gr['a_value']
        
        magnitude_thresholds = [3.0, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5]
        
        for mag_threshold in magnitude_thresholds:
            if mag_threshold < mainshock_magnitude:
                # Expected number of aftershocks >= mag_threshold
                N = 10 ** (a_value - b_value * mag_threshold)
                probability = float(1 - np.exp(-N))
                
                predictions['magnitude_probabilities'][f'M{mag_threshold}'] = {
                    'magnitude': mag_threshold,
                    'expected_count': float(N),
                    'probability': probability,
                    'percentage': probability * 100
                }
        
        # Risk assessment
        predictions['risk_assessment'] = self._assess_risk(
            mainshock_magnitude,
            predictions['forecasts']['day_1']['rate_per_day'],
            predictions['magnitude_probabilities']
        )
        
        return predictions
    
    def _assess_risk(
        self,
        mainshock_mag: float,
        day1_rate: float,
        mag_probs: Dict
    ) -> Dict:
        """Assess overall risk level"""
        
        # Risk factors
        risk_score = 0
        factors = []
        
        # Factor 1: Mainshock magnitude
        if mainshock_mag >= 7.0:
            risk_score += 40
            factors.append("Very large mainshock (M≥7.0)")
        elif mainshock_mag >= 6.0:
            risk_score += 25
            factors.append("Large mainshock (M≥6.0)")
        elif mainshock_mag >= 5.0:
            risk_score += 15
            factors.append("Moderate mainshock (M≥5.0)")
        
        # Factor 2: Expected aftershock rate
        if day1_rate > 50:
            risk_score += 30
            factors.append("Very high aftershock rate expected")
        elif day1_rate > 20:
            risk_score += 20
            factors.append("High aftershock rate expected")
        elif day1_rate > 5:
            risk_score += 10
            factors.append("Moderate aftershock rate expected")
        
        # Factor 3: Probability of strong aftershocks
        if 'M5.0' in mag_probs and mag_probs['M5.0']['probability'] > 0.5:
            risk_score += 20
            factors.append("High probability of M≥5.0 aftershocks")
        
        if 'M6.0' in mag_probs and mag_probs['M6.0']['probability'] > 0.2:
            risk_score += 10
            factors.append("Significant probability of M≥6.0 aftershocks")
        
        # Determine risk level
        if risk_score >= 70:
            level = "CRITICAL"
            color = "#dc2626"
            description = "Extremely high risk of damaging aftershocks"
            recommendations = [
                "Evacuate damaged buildings immediately",
                "Prepare for multiple strong aftershocks",
                "Keep emergency supplies readily accessible",
                "Follow official evacuation orders",
                "Stay away from damaged infrastructure"
            ]
        elif risk_score >= 50:
            level = "HIGH"
            color = "#f59e0b"
            description = "High risk of significant aftershocks"
            recommendations = [
                "Avoid damaged or weakened structures",
                "Keep emergency kit prepared",
                "Monitor official updates frequently",
                "Have evacuation plan ready",
                "Check on vulnerable neighbors"
            ]
        elif risk_score >= 30:
            level = "ELEVATED"
            color = "#fbbf24"
            description = "Elevated risk of aftershocks"
            recommendations = [
                "Stay alert for aftershocks",
                "Inspect buildings for damage",
                "Prepare emergency supplies",
                "Stay informed via local authorities",
                "Plan safe locations in your area"
            ]
        else:
            level = "MODERATE"
            color = "#10b981"
            description = "Moderate aftershock activity expected"
            recommendations = [
                "Be aware of aftershock possibility",
                "Check for any minor damage",
                "Keep emergency contacts handy",
                "Follow standard earthquake safety",
                "Monitor for updates"
            ]
        
        return {
            'level': level,
            'score': risk_score,
            'color': color,
            'description': description,
            'factors': factors,
            'recommendations': recommendations
        }

# Initialize query system
query_system = None

def get_query_system():
    """Get or initialize query system"""
    global query_system
    if query_system is None:
        query_system = AftershockModelQuery(Config.MODELS_DIR)
    return query_system

# ============================================================================
# USGS DATA FETCHING
# ============================================================================

@lru_cache(maxsize=10)
def fetch_recent_earthquakes(
    days: int = 7,
    min_magnitude: float = 4.0,
    max_results: int = 100
) -> List[Dict]:
    """Fetch recent earthquakes from USGS"""
    
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(days=days)
    
    params = {
        'format': 'geojson',
        'starttime': start_time.strftime('%Y-%m-%d'),
        'endtime': end_time.strftime('%Y-%m-%d'),
        'minmagnitude': min_magnitude,
        'orderby': 'time',
        'limit': max_results
    }
    
    try:
        logger.info(f"Fetching earthquakes from USGS (days={days}, min_mag={min_magnitude})")
        response = requests.get(Config.USGS_API_URL, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        features = data.get('features', [])
        
        earthquakes = []
        for feature in features:
            props = feature['properties']
            coords = feature['geometry']['coordinates']
            
            earthquakes.append({
                'id': feature['id'],
                'magnitude': props['mag'],
                'latitude': coords[1],
                'longitude': coords[0],
                'depth': coords[2],
                'time': datetime.fromtimestamp(props['time'] / 1000).isoformat(),
                'place': props['place'],
                'updated': datetime.fromtimestamp(props['updated'] / 1000).isoformat(),
                'url': props['url'],
                'detail_url': feature['properties']['detail']
            })
        
        # Sort earthquakes by magnitude (descending). Treat missing magnitudes as very small so they appear last.
        earthquakes.sort(key=lambda e: e.get('magnitude') if e.get('magnitude') is not None else -999, reverse=True)

        logger.info(f"Fetched {len(earthquakes)} earthquakes")
        return earthquakes
        
    except Exception as e:
        logger.error(f"Error fetching earthquakes: {e}")
        return []

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "Aftershock Monitor API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "earthquakes": "/api/earthquakes",
            "predict": "/api/predict",
            "models": "/api/models",
            "health": "/api/health"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    qs = get_query_system()
    return {
        "status": "healthy",
        "models_loaded": len(qs.regional_models),
        "has_global_model": qs.global_model is not None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/earthquakes")
async def get_earthquakes(
    days: int = Query(7, ge=1, le=365, description="Number of days to fetch"),
    min_magnitude: float = Query(4.0, ge=2.5, le=10.0, description="Minimum magnitude")
):
    """Get recent earthquakes from USGS"""
    
    try:
        earthquakes = fetch_recent_earthquakes(days, min_magnitude)
        return {
            "count": len(earthquakes),
            "earthquakes": earthquakes,
            "filters": {
                "days": days,
                "min_magnitude": min_magnitude
            },
            "fetched_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error in get_earthquakes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
async def predict_aftershocks(request: PredictionRequest):
    """Predict aftershocks for an earthquake"""
    
    try:
        qs = get_query_system()
        
        predictions = qs.predict_aftershocks(
            mainshock_magnitude=request.magnitude,
            lat=request.latitude,
            lon=request.longitude,
            tectonic_setting=request.tectonic_setting
        )
        
        return {
            "success": True,
            "predictions": predictions,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in predict_aftershocks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/coverage")
async def get_model_coverage():
    """Get global model coverage information"""
    
    try:
        qs = get_query_system()
        
        coverage = []
        for region_id, model in qs.regional_models.items():
            coverage.append({
                'region_id': region_id,
                'center': model['center'],
                'bounds': model['bounds'],
                'quality': model.get('data_quality', 'unknown'),
                'sequences': model.get('n_sequences', 0),
                'aftershocks': model.get('n_total_aftershocks', 0),
                'tectonic_setting': model.get('tectonic_setting', 'unknown')
            })
        
        return {
            "total_models": len(coverage),
            "has_global_fallback": qs.global_model is not None,
            "coverage": coverage
        }
        
    except Exception as e:
        logger.error(f"Error in get_model_coverage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/{region_id}")
async def get_model_details(region_id: str):
    """Get detailed information about a specific model"""
    
    try:
        qs = get_query_system()
        
        if region_id not in qs.regional_models:
            raise HTTPException(status_code=404, detail="Model not found")
        
        model = qs.regional_models[region_id]
        
        return {
            "model": model,
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_model_details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)