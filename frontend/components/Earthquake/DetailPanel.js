import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, TrendingDown, BarChart3, Download, Info } from 'lucide-react';
import { predictAftershocks } from '@/utils/api';
import {
  formatMagnitude,
  formatTimeAgo,
  formatFullDate,
  formatCoordinates,
  formatDepth,
  formatProbability,
  formatNumber,
  getRiskLevelColor,
  truncatePlace,
} from '@/utils/formatters';
import { generateAftershockPDF } from '@/utils/pdfExport';
import LoadingSpinner from '../UI/LoadingSpinner';
import DecayCurveChart from '../Forecast/DecayCurveChart';
import ProbabilityChart from '../Forecast/ProbabilityChart';

export default function DetailPanel({ earthquake, onClose }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  useEffect(() => {
    if (earthquake) {
      fetchPredictions();
    }
  }, [earthquake]);
  
  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await predictAftershocks(
        earthquake.magnitude,
        earthquake.latitude,
        earthquake.longitude
      );
      setPredictions(response.predictions);
    } catch (err) {
      setError('Failed to load predictions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!predictions || !earthquake) return;
    
    setExporting(true);
    try {
      generateAftershockPDF(earthquake, predictions);
      // Show success message briefly
      setTimeout(() => setExporting(false), 1000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
      setExporting(false);
    }
  };
  
  if (!earthquake) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] lg:w-[600px] bg-bg-dark border-l border-white/10 overflow-y-auto z-50 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-bg-card border-b border-white/10 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">Aftershock Forecast</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Earthquake Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1" style={{ color: getRiskLevelColor('HIGH') }}>
                  {formatMagnitude(earthquake.magnitude)} Earthquake
                </h3>
                <p className="text-text-secondary text-sm">
                  {truncatePlace(earthquake.place, 60)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-text-secondary">Time</div>
                <div className="font-medium">{formatTimeAgo(earthquake.time)}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {formatFullDate(earthquake.time)}
                </div>
              </div>
              
              <div>
                <div className="text-text-secondary">Location</div>
                <div className="font-medium">
                  {formatCoordinates(earthquake.latitude, earthquake.longitude)}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Depth: {formatDepth(earthquake.depth)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && <LoadingSpinner message="Calculating aftershock probabilities..." />}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}
          
          {/* Predictions */}
          {predictions && !loading && (
            <>
              {/* Risk Assessment */}
              <div
                className="rounded-xl p-6 border-2"
                style={{
                  backgroundColor: `${predictions.risk_assessment.color}15`,
                  borderColor: predictions.risk_assessment.color,
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-8 h-8" style={{ color: predictions.risk_assessment.color }} />
                  <div>
                    <div className="text-2xl font-bold" style={{ color: predictions.risk_assessment.color }}>
                      {predictions.risk_assessment.level} RISK
                    </div>
                    <div className="text-sm text-text-secondary">
                      {predictions.risk_assessment.description}
                    </div>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold">⚠️ Recommended Actions:</div>
                  <ul className="space-y-1 text-sm">
                    {predictions.risk_assessment.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-text-secondary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Time Windows Forecast */}
              <div className="bg-bg-card rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Expected Aftershocks</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(predictions.forecasts).map(([key, forecast]) => (
                    <div
                      key={key}
                      className="bg-bg-dark rounded-lg p-4 border border-white/10"
                    >
                      <div className="text-text-secondary text-xs mb-1">
                        {forecast.days === 1 ? 'Next 24 Hours' : `Day ${forecast.days}`}
                      </div>
                      <div className="text-2xl font-bold text-orange-500">
                        {formatNumber(forecast.expected_aftershocks)}
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        per day
                      </div>
                      <div className="text-xs text-text-secondary mt-2 pt-2 border-t border-white/10">
                        Total: {formatNumber(forecast.cumulative_expected)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decay Curve Chart */}
              <div className="bg-bg-card rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Aftershock Rate Over Time</h3>
                <DecayCurveChart forecasts={predictions.forecasts} />
              </div>
              
              {/* Magnitude Probabilities */}
              <div className="bg-bg-card rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Magnitude Probabilities</h3>
                </div>
                
                <ProbabilityChart probabilities={predictions.magnitude_probabilities} />
                
                <div className="space-y-2 mt-4">
                  {Object.entries(predictions.magnitude_probabilities).map(([key, prob]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{key} or larger:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${prob.percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-orange-500 w-12 text-right">
                          {formatProbability(prob.probability)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Model Information */}
              <div className="bg-bg-card rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Model Information</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Region:</span>
                    <span className="font-medium">{predictions.model_info.region_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Model Source:</span>
                    <span className="font-medium capitalize">
                      {predictions.model_info.source.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Data Quality:</span>
                    <span className="font-medium capitalize">{predictions.model_info.quality}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Training Data:</span>
                    <span className="font-medium">
                      {predictions.model_info.training_sequences} sequences, {' '}
                      {predictions.model_info.training_aftershocks} aftershocks
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Model Accuracy:</span>
                    <span className="font-medium">
                      R² = {predictions.model_info.omori_r_squared.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Export Button */}
              <button 
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Export Report (PDF)</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
