import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertCircle, Clock, Download, Share2 } from 'lucide-react';
import DecayCurveChart from '../Forecast/DecayCurveChart';
import ProbabilityChart from '../Forecast/ProbabilityChart';
import EarthquakeActivityCard from './EarthquakeActivityCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import { predictAftershocks } from '@/utils/api';
import { generateAftershockPDF } from '@/utils/pdfExport';
import {
  formatMagnitude,
  formatFullDate,
  formatTimeAgo,
  formatCoordinates,
  formatDepth,
  getMagnitudeColor,
  getRiskLevelColor,
  formatNumber,
} from '@/utils/formatters';

export default function DetailPanel({ earthquake, onClose, allEarthquakes }) {
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
      setError('Failed to load aftershock predictions');
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
      setTimeout(() => setExporting(false), 1000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!earthquake) return;

    const shareData = {
      title: `${formatMagnitude(earthquake.magnitude)} Earthquake`,
      text: `${earthquake.place} - ${formatTimeAgo(earthquake.time)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  if (!earthquake) return null;

  const magColor = getMagnitudeColor(earthquake.magnitude);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] lg:w-[520px] bg-white shadow-2xl z-50 rounded-l-3xl flex flex-col"
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">
              {formatMagnitude(earthquake.magnitude)}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{earthquake.place}</span>
            </div>

            <div className="flex items-center space-x-2 text-white/90">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {formatTimeAgo(earthquake.time)} · {formatFullDate(earthquake.time)}
              </span>
            </div>

            <div className="text-xs text-white/80">
              {formatCoordinates(earthquake.latitude, earthquake.longitude)} · 
              Depth: {formatDepth(earthquake.depth)}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Real-Time Activity Card - Always on top */}
          {allEarthquakes && allEarthquakes.length > 0 && (
            <EarthquakeActivityCard
              earthquake={earthquake}
              allEarthquakes={allEarthquakes}
            />
          )}

          {/* Aftershock Forecast Section */}
          <div className="p-6 space-y-5">
            {/* Loading State */}
            {loading && (
              <LoadingSpinner message="Calculating aftershock probabilities..." />
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Predictions */}
            {predictions && !loading && (
              <>
                {/* Risk Assessment */}
                <div
                  className="rounded-2xl p-5 border-2"
                  style={{
                    backgroundColor: `${predictions.risk_assessment.color}10`,
                    borderColor: predictions.risk_assessment.color,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Risk Assessment</h3>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: predictions.risk_assessment.color,
                        color: 'white',
                      }}
                    >
                      {predictions.risk_assessment.level}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    {predictions.risk_assessment.description}
                  </p>

                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Key Risk Factors:
                    </div>
                    <ul className="space-y-1">
                      {predictions.risk_assessment.factors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expected Aftershocks */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Expected Aftershocks
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(predictions.forecasts).map(([key, forecast]) => (
                      <div
                        key={key}
                        className="bg-white rounded-xl p-4 border border-gray-200"
                      >
                        <div className="text-xs text-gray-600 mb-1">
                          {forecast.days === 1
                            ? 'First 24 Hours'
                            : forecast.days === 7
                            ? 'First Week'
                            : forecast.days === 30
                            ? 'First Month'
                            : 'First Year'}
                        </div>
                        <div className="text-2xl font-bold text-orange-500">
                          {formatNumber(forecast.cumulative_expected)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          expected total
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decay Curve */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Aftershock Decay Pattern
                  </h3>
                  <div className="bg-white rounded-xl p-4">
                    <DecayCurveChart forecasts={predictions.forecasts} />
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Aftershock frequency decreases over time following Omori's Law
                  </p>
                </div>

                {/* Magnitude Probabilities */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Magnitude Probabilities
                  </h3>
                  <div className="bg-white rounded-xl p-4">
                    <ProbabilityChart
                      magnitudeProbabilities={predictions.magnitude_probabilities}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Probability of aftershocks at or above each magnitude threshold
                  </p>
                </div>

                {/* Model Information */}
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Model Information
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Region</span>
                      <span className="font-mono font-medium text-gray-900">
                        {predictions.model_info.region_id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Model Quality</span>
                      <span className="font-medium text-gray-900">
                        {predictions.model_info.quality}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tectonic Setting</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {predictions.model_info.tectonic_setting.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Training Data</span>
                      <span className="font-medium text-gray-900">
                        {predictions.model_info.training_sequences} sequences
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safety Recommendations */}
                <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Safety Recommendations
                  </h3>

                  <ul className="space-y-2">
                    {predictions.risk_assessment.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-2 text-sm text-gray-700"
                      >
                        <span className="text-orange-500 flex-shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-900">
                  <strong>⚠️ Important:</strong> These are statistical predictions based on
                  historical data and seismological models. Actual aftershock patterns may
                  vary. Always follow official guidance from local authorities and seismological
                  agencies.
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        {predictions && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white flex space-x-3">
            <button 
              onClick={handleShare}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-700 font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed rounded-xl transition-colors text-white font-medium"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}