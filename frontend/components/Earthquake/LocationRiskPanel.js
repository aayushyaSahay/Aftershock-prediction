import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, TrendingUp, BarChart3, Info, Activity, Shield } from 'lucide-react';
import { predictAftershocks } from '@/utils/api';
import {
  formatCoordinates,
  formatNumber,
  getRiskLevelColor,
} from '@/utils/formatters';
import LoadingSpinner from '../UI/LoadingSpinner';

export default function LocationRiskPanel({ location, onClose }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (location) {
      fetchLocationRisk();
    }
  }, [location]);
  
  const fetchLocationRisk = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch risk data for different mainshock scenarios
      const scenarios = [
        { mag: 4.0, label: 'M4.0 (Light)' },
        { mag: 5.0, label: 'M5.0 (Moderate)' },
        { mag: 6.0, label: 'M6.0 (Strong)' },
        { mag: 7.0, label: 'M7.0 (Major)' },
      ];
      
      const scenarioResults = await Promise.all(
        scenarios.map(async (scenario) => {
          try {
            const response = await predictAftershocks(
              scenario.mag,
              location.latitude,
              location.longitude
            );
            return {
              magnitude: scenario.mag,
              label: scenario.label,
              predictions: response.predictions,
            };
          } catch (err) {
            console.error(`Error fetching scenario ${scenario.mag}:`, err);
            return null;
          }
        })
      );
      
      // Filter out failed scenarios
      const validScenarios = scenarioResults.filter(s => s !== null);
      
      if (validScenarios.length > 0) {
        setRiskData({
          location,
          scenarios: validScenarios,
          modelInfo: validScenarios[0].predictions.model_info,
        });
      } else {
        setError('Unable to calculate risk for this location');
      }
    } catch (err) {
      setError('Failed to load risk data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!location) return null;
  
  const getTectonicColor = (setting) => {
    const colors = {
      subduction: '#dc2626',
      transform: '#f59e0b',
      divergent: '#10b981',
      intraplate: '#3b82f6',
      unknown: '#6b7280',
    };
    return colors[setting?.toLowerCase()] || colors.unknown;
  };
  
  const getQualityBadge = (quality) => {
    const badges = {
      high: { color: '#10b981', label: 'High Quality' },
      medium: { color: '#f59e0b', label: 'Medium Quality' },
      low: { color: '#dc2626', label: 'Low Quality' },
      unknown: { color: '#6b7280', label: 'Limited Data' },
    };
    return badges[quality?.toLowerCase()] || badges.unknown;
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] lg:w-[520px] bg-white shadow-2xl overflow-y-auto z-50 rounded-l-3xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-5 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Location Risk Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Location Info */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {location.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCoordinates(location.latitude, location.longitude)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && <LoadingSpinner message="Analyzing seismic risk..." />}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}
          
          {/* Risk Data */}
          {riskData && !loading && (
            <>
              {/* Regional Model Info */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Regional Model</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Region ID</span>
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {riskData.modelInfo.region_id}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Quality</span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: `${getQualityBadge(riskData.modelInfo.quality).color}20`,
                        color: getQualityBadge(riskData.modelInfo.quality).color,
                      }}
                    >
                      {getQualityBadge(riskData.modelInfo.quality).label}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tectonic Setting</span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-lg capitalize"
                      style={{
                        backgroundColor: `${getTectonicColor(riskData.modelInfo.tectonic_setting)}20`,
                        color: getTectonicColor(riskData.modelInfo.tectonic_setting),
                      }}
                    >
                      {riskData.modelInfo.tectonic_setting.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Training Data</span>
                    <span className="text-sm font-medium text-gray-900">
                      {riskData.modelInfo.training_sequences} sequences
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Seismic Hazard Scenarios */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Aftershock Scenarios</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Expected aftershock activity if an earthquake occurs at this location:
                </p>
                
                <div className="space-y-3">
                  {riskData.scenarios.map((scenario) => (
                    <div
                      key={scenario.magnitude}
                      className="bg-white rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">{scenario.label}</span>
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{
                            backgroundColor: `${scenario.predictions.risk_assessment.color}20`,
                            color: scenario.predictions.risk_assessment.color,
                          }}
                        >
                          {scenario.predictions.risk_assessment.level} RISK
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-gray-500">First 24 Hours</div>
                          <div className="text-lg font-bold text-orange-500">
                            {formatNumber(scenario.predictions.forecasts.day_1.expected_aftershocks)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">First Week</div>
                          <div className="text-lg font-bold text-orange-500">
                            {formatNumber(scenario.predictions.forecasts.day_7.cumulative_expected)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Magnitude Probability Chart */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Aftershock Magnitude Risk</h3>
                </div>
                
                <p className="text-xs text-gray-600 mb-4">
                  Probability of aftershocks ≥ magnitude after a M6.0 earthquake:
                </p>
                
                {riskData.scenarios.find(s => s.magnitude === 6.0) && (
                  <div className="space-y-2">
                    {Object.entries(
                      riskData.scenarios.find(s => s.magnitude === 6.0).predictions.magnitude_probabilities
                    ).map(([key, prob]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{key} or larger:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${prob.percentage}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-orange-500 w-12 text-right">
                            {prob.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Risk Level Indicators */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border-2 border-orange-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Seismic Risk Level</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Risk meter based on tectonic setting */}
                  <div>
                    <div className="text-sm text-gray-700 mb-2">Regional Hazard Index</div>
                    <div className="flex items-center space-x-2">
                      {['Low', 'Moderate', 'Elevated', 'High', 'Critical'].map((level, idx) => {
                        const isActive = idx <= (
                          riskData.modelInfo.tectonic_setting === 'subduction' ? 4 :
                          riskData.modelInfo.tectonic_setting === 'transform' ? 3 :
                          riskData.modelInfo.tectonic_setting === 'divergent' ? 2 : 1
                        );
                        return (
                          <div
                            key={level}
                            className={`flex-1 h-3 rounded-full transition-all ${
                              isActive ? 'opacity-100' : 'opacity-20'
                            }`}
                            style={{
                              backgroundColor: [
                                '#10b981', '#fbbf24', '#f59e0b', '#dc2626', '#7f1d1d'
                              ][idx]
                            }}
                            title={level}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Low</span>
                      <span>Critical</span>
                    </div>
                  </div>
                  
                  {/* Tectonic info */}
                  <div className="bg-white/60 rounded-lg p-3 text-xs text-gray-700">
                    <strong>Note:</strong> This location is in a{' '}
                    <span className="font-semibold">{riskData.modelInfo.tectonic_setting.replace('_', ' ')}</span>
                    {' '}tectonic zone. Historical data shows{' '}
                    <span className="font-semibold">{riskData.modelInfo.training_aftershocks}</span>
                    {' '}recorded aftershocks from{' '}
                    <span className="font-semibold">{riskData.modelInfo.training_sequences}</span>
                    {' '}earthquake sequences.
                  </div>
                </div>
              </div>
              
              {/* Preparedness Recommendations */}
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Preparedness Tips</h3>
                </div>
                
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>Keep emergency supplies (water, food, flashlight, radio)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>Identify safe spots in each room (under desks, doorways)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>Create a family emergency communication plan</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>Secure heavy furniture and objects that could fall</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>Practice "Drop, Cover, and Hold On" drills regularly</span>
                  </li>
                </ul>
              </div>
              
              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-900">
                <strong>⚠️ Important:</strong> This is a statistical risk assessment based on historical data. 
                Actual earthquake occurrence and aftershock patterns may vary. Always follow guidance from local 
                seismological authorities and emergency management agencies.
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}