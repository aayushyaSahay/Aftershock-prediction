import Header from '@/components/UI/Header';
import { BookOpen, Target, Users, Database, AlertTriangle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Aftershock Monitor
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Real-time earthquake aftershock probability prediction using advanced statistical seismology
          </p>
        </div>
        
        {/* Objective */}
        <section className="bg-bg-card border border-white/10 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Project Objective</h2>
          </div>
          
          <p className="text-text-secondary leading-relaxed">
            To design a data-driven, probabilistic forecasting model that predicts the occurrence and 
            magnitude probability of aftershocks using established statistical laws of seismology, aiding 
            in disaster preparedness and mitigation. Our system provides short- and medium-term forecasts 
            to assist emergency response teams, government agencies, and affected communities.
          </p>
        </section>
        
        {/* How It Works */}
        <section className="bg-bg-card border border-white/10 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">How It Works</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">1. Data Collection</h3>
              <p className="text-text-secondary leading-relaxed">
                We gather comprehensive seismic event data from authoritative sources including USGS and IRIS, 
                spanning 35 years (1990-2025) of global earthquake activity. Our database includes mainshock 
                events M≥3.8 and their associated aftershocks M≥2.5.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">2. Statistical Modeling</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                We apply two fundamental laws of statistical seismology:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-bg-dark border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-500 mb-2">Omori's Law</h4>
                  <p className="text-sm text-text-secondary mb-2">
                    Models the temporal decay of aftershock rates over time:
                  </p>
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">
                    n(t) = K / (t + c)^p
                  </code>
                  <p className="text-xs text-text-secondary mt-2">
                    where K, c, and p are fitted parameters specific to each region
                  </p>
                </div>
                
                <div className="bg-bg-dark border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-500 mb-2">Gutenberg-Richter Law</h4>
                  <p className="text-sm text-text-secondary mb-2">
                    Describes the magnitude-frequency distribution:
                  </p>
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">
                    log₁₀(N) = a - bM
                  </code>
                  <p className="text-xs text-text-secondary mt-2">
                    predicting the probability of aftershocks of different magnitudes
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">3. Regional Modeling</h3>
              <p className="text-text-secondary leading-relaxed">
                The Earth is divided into a 5°×5° grid, with statistical models trained independently for 
                each region containing sufficient seismic data. This regional approach accounts for tectonic 
                variations and local seismic characteristics. For areas without sufficient data, we use 
                tectonic-matched fallbacks or a global average model.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">4. Real-Time Prediction</h3>
              <p className="text-text-secondary leading-relaxed">
                When a new earthquake occurs, our system automatically fetches the event data from USGS, 
                identifies the appropriate regional model, and generates probabilistic forecasts for:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-text-secondary">
                <li>Expected number of aftershocks over time (1 day, 7 days, 30 days, 1 year)</li>
                <li>Probability of aftershocks exceeding specific magnitudes</li>
                <li>Risk assessment and safety recommendations</li>
                <li>Temporal decay curves showing how aftershock activity decreases</li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Real-World Applications */}
        <section className="bg-bg-card border border-white/10 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Real-World Applications</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold">Emergency Response</h3>
              </div>
              <p className="text-sm text-text-secondary pl-4">
                Helps response teams plan evacuation routes, resource allocation, and relief efforts 
                based on expected aftershock patterns
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold">Public Safety</h3>
              </div>
              <p className="text-sm text-text-secondary pl-4">
                Guides government agencies in issuing timely safety alerts and evacuation orders 
                for high-risk areas
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold">Infrastructure Safety</h3>
              </div>
              <p className="text-sm text-text-secondary pl-4">
                Assists construction teams in scheduling safety inspections and temporary 
                reinforcement of critical infrastructure
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold">Risk Assessment</h3>
              </div>
              <p className="text-sm text-text-secondary pl-4">
                Supports insurance companies and risk analysts in post-disaster assessment 
                and resource planning
              </p>
            </div>
          </div>
        </section>
        
        {/* Data Sources */}
        <section className="bg-bg-card border border-white/10 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Data Sources</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">USGS Earthquake Catalog</h3>
                <p className="text-sm text-text-secondary">
                  Primary source for real-time earthquake data and historical records
                </p>
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:text-orange-400 transition-colors"
                >
                  earthquake.usgs.gov →
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">IRIS Data Services</h3>
                <p className="text-sm text-text-secondary">
                  Comprehensive seismological data for model training and validation
                </p>
                <a
                  href="https://www.iris.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:text-orange-400 transition-colors"
                >
                  iris.edu →
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Important Disclaimer */}
        <section className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-8">
          <div className="flex items-start space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-yellow-500 mb-4">Important Disclaimer</h2>
              
              <div className="space-y-4 text-yellow-100">
                <p>
                  <strong>These predictions are probabilistic forecasts</strong> based on historical seismic 
                  patterns and statistical models. While our models are trained on 35 years of data and 
                  validated using rigorous methods, earthquake prediction remains an inherently uncertain science.
                </p>
                
                <div className="bg-yellow-500/10 rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-semibold">Limitations to consider:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Predictions represent statistical probabilities, not certainties</li>
                    <li>Model accuracy varies by region based on available training data</li>
                    <li>Unusual seismic sequences may deviate from historical patterns</li>
                    <li>Local geological factors may affect actual aftershock behavior</li>
                  </ul>
                </div>
                
                <p>
                  <strong>Always follow official guidance</strong> from local authorities, emergency management 
                  agencies, and seismological institutions. This tool should be used as supplementary information 
                  for disaster preparedness, not as a replacement for official warnings and evacuation orders.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Technical Details */}
        <section className="bg-bg-card border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
          
          <div className="space-y-4 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-orange-500 mb-2">Training Data</h3>
                <ul className="space-y-1 text-text-secondary">
                  <li>• Period: 1990-2025 (35 years)</li>
                  <li>• Mainshock threshold: M ≥ 3.8</li>
                  <li>• Aftershock threshold: M ≥ 2.5</li>
                  <li>• Depth limit: ≤ 70 km</li>
                  <li>• Temporal window: 365 days</li>
                  <li>• Spatial window: 100 km radius</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-orange-500 mb-2">Model Requirements</h3>
                <ul className="space-y-1 text-text-secondary">
                  <li>• Minimum sequences: 3 per region</li>
                  <li>• Minimum aftershocks: 30 per region</li>
                  <li>• Grid size: 5° × 5°</li>
                  <li>• Validation method: R² score</li>
                  <li>• Declustering: Gardner-Knopoff</li>
                  <li>• Fallback: Global average model</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <div className="text-center text-text-secondary text-sm pt-8 border-t border-white/10">
          <p>
            Built with Python, FastAPI, React, Next.js, and Leaflet.js
          </p>
          <p className="mt-2">
            Data sources: USGS • IRIS • Academic seismology research
          </p>
        </div>
      </div>
    </div>
  );
}