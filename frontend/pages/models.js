import { useState, useEffect } from 'react';
import Header from '@/components/UI/Header';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { fetchModelCoverage } from '@/utils/api';
import { Map, Database, BarChart2, TrendingUp, Info } from 'lucide-react';
import { getQualityColor, formatQuality } from '@/utils/formatters';

export default function ModelsPage() {
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  useEffect(() => {
    loadCoverage();
  }, []);
  
  const loadCoverage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchModelCoverage();
      setCoverage(data);
    } catch (err) {
      setError('Failed to load model coverage');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Group models by quality
  const getQualityStats = () => {
    if (!coverage) return {};
    
    const stats = {
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
    };
    
    coverage.coverage.forEach(model => {
      const quality = model.quality.toLowerCase();
      stats[quality] = (stats[quality] || 0) + 1;
    });
    
    return stats;
  };
  
  const qualityStats = getQualityStats();
  
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Model Explorer</h1>
          <p className="text-text-secondary text-lg">
            Explore our global network of trained aftershock prediction models and their coverage
          </p>
        </div>
        
        {loading ? (
          <LoadingSpinner message="Loading model data..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadCoverage}
              className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : coverage ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Map className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-text-secondary text-sm">Total Models</div>
                </div>
                <div className="text-3xl font-bold">{coverage.total_models}</div>
              </div>
              
              <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-text-secondary text-sm">High Quality</div>
                </div>
                <div className="text-3xl font-bold">{qualityStats.high || 0}</div>
              </div>
              
              <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-text-secondary text-sm">Medium Quality</div>
                </div>
                <div className="text-3xl font-bold">{qualityStats.medium || 0}</div>
              </div>
              
              <div className="bg-bg-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-text-secondary text-sm">Global Fallback</div>
                </div>
                <div className="text-3xl font-bold">{coverage.has_global_fallback ? '✓' : '✗'}</div>
              </div>
            </div>
            
            {/* Model Quality Distribution */}
            <div className="bg-bg-card border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-orange-500" />
                <span>Model Quality Distribution</span>
              </h2>
              
              <div className="space-y-4">
                {Object.entries(qualityStats).map(([quality, count]) => {
                  const percentage = (count / coverage.total_models) * 100;
                  const color = getQualityColor(quality);
                  
                  return (
                    <div key={quality}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{quality} Quality</span>
                        <span className="text-sm text-text-secondary">
                          {count} models ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Regional Models Table */}
            <div className="bg-bg-card border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Database className="w-5 h-5 text-orange-500" />
                <span>Regional Models</span>
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Region ID</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Center</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Quality</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Sequences</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Aftershocks</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Tectonic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.coverage.slice(0, 20).map((model) => (
                      <tr
                        key={model.region_id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedRegion(model)}
                      >
                        <td className="py-3 px-4 font-mono text-xs">{model.region_id}</td>
                        <td className="py-3 px-4 text-xs">
                          {model.center.lat.toFixed(1)}°, {model.center.lon.toFixed(1)}°
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${getQualityColor(model.quality)}20`,
                              color: getQualityColor(model.quality),
                            }}
                          >
                            {formatQuality(model.quality)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{model.sequences}</td>
                        <td className="py-3 px-4">{model.aftershocks}</td>
                        <td className="py-3 px-4 text-xs capitalize">
                          {model.tectonic_setting.replace('_', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {coverage.coverage.length > 20 && (
                <div className="mt-4 text-center text-sm text-text-secondary">
                  Showing 20 of {coverage.total_models} models
                </div>
              )}
            </div>
            
            {/* Methodology Section */}
            <div className="bg-bg-card border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-500" />
                <span>Model Training Methodology</span>
              </h2>
              
              <div className="prose prose-invert max-w-none space-y-4 text-text-secondary">
                <p>
                  Our aftershock prediction models are trained on 35 years of global seismic data (1990-2025)
                  using statistical seismology principles:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-bg-dark border border-white/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Omori's Law</h3>
                    <p className="text-sm">
                      Models the temporal decay of aftershock rates: n(t) = K / (t + c)^p
                    </p>
                  </div>
                  
                  <div className="bg-bg-dark border border-white/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Gutenberg-Richter Law</h3>
                    <p className="text-sm">
                      Describes magnitude distribution: log N = a - bM
                    </p>
                  </div>
                </div>
                
                <p>
                  Each regional model requires a minimum of 3 earthquake sequences with at least 30 total
                  aftershocks. Models are validated using R² scores and cross-validation.
                </p>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 my-4">
                  <p className="text-yellow-200 text-sm">
                    <strong>Important:</strong> These predictions are probabilistic forecasts based on
                    historical patterns. They should be used as one tool among many for disaster preparedness
                    and should not replace official guidance from local authorities.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}