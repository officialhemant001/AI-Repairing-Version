import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, ArrowLeft, Filter, Search } from 'lucide-react';
import Loader from '../components/UI/Loader';
import ErrorMessage from '../components/UI/ErrorMessage';
import { scanService } from '../services/scanService';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await scanService.getHistory();
        const results = data.results || data || [];
        setHistory(results);
      } catch (err) {
        setError(err.message || 'Failed to load scan history.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  // Derived state for filtering (React 19 best practice)
  const filteredHistory = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return history;
    }
    
    const term = searchTerm.toLowerCase();
    return history.filter(scan => 
      (scan.issue && scan.issue.toLowerCase().includes(term)) ||
      (scan.appliance_category && scan.appliance_category.toLowerCase().includes(term))
    );
  }, [searchTerm, history]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Clock className="w-7 h-7 text-blue-400" />
              Repair History
            </h1>
            <p className="text-slate-400 mt-1">Review your past diagnostics and repairs.</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by issue or appliance..."
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 font-medium transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* List */}
      {error ? (
        <ErrorMessage message={error} />
      ) : isLoading ? (
        <div className="py-12 bg-slate-800/40 rounded-3xl border border-slate-700/50">
          <Loader message="Loading your scan history..." />
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredHistory.map((scan) => {
              const date = new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const isCritical = scan.severity === 'critical' || scan.severity === 'high';

              return (
                <div 
                  key={scan.id} 
                  onClick={() => navigate(`/scan/${scan.id}`)}
                  className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-700/50 hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                   <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700">
                        {scan.appliance_category?.replace('_', ' ') || 'General'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{date}</span>
                   </div>
                   
                   <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                     {scan.issue || 'Unknown Issue'}
                   </h3>
                   
                   <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-green-500'}`}></div>
                        <span className="text-sm font-medium text-slate-300 capitalize">{scan.severity || 'Medium'} Severity</span>
                      </div>
                      <span className="text-sm font-medium text-blue-400">View Report &rarr;</span>
                   </div>
                </div>
              );
           })}
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-800/40 rounded-3xl border border-slate-700/50">
          <Camera className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
          <p className="text-slate-400">Try adjusting your search or start a new scan.</p>
        </div>
      )}

    </div>
  );
};

export default History;
