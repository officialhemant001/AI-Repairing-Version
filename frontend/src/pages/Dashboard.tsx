import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, Wrench, ShieldCheck, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import ErrorMessage from '../components/UI/ErrorMessage';
import { useAppContext } from '../context/AppContext';
import { scanService } from '../services/scanService';
import { Scan } from '../types/scan';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [history, setHistory] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await scanService.getHistory();
        // Handle both paginated or array responses
        const results = (data as any).results || data || [];
        setHistory(results);
      } catch (err: any) {
        setError(err.message || 'Failed to load scan history.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const totalScans = history.length;
  const successfulRepairs = history.filter(s => s.status === 'repaired').length;
  const timeSaved = history.length; 

  const recentScans = history.slice(0, 5); // Just show top 5

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.name || 'User'}</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Ready to fix something today?</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/chat')} 
            variant="outline"
            className="px-6 py-3.5 bg-slate-800 shadow-sm"
            icon={Cpu}
          >
            Chat AI
          </Button>
          <Button 
            onClick={() => navigate('/scan')} 
            className="px-8 py-3.5 shadow-blue-500/20 group"
          >
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            New Scan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel rounded-3xl p-6 shadow-xl flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner">
            <Camera className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Scans</p>
            <p className="text-3xl font-bold text-white">{totalScans}</p>
          </div>
        </div>
        
        <div className="glass-panel rounded-3xl p-6 shadow-xl flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Repairs Fixed</p>
            <p className="text-3xl font-bold text-white">{successfulRepairs}</p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-xl flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-inner">
            <Wrench className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Est. Time Saved</p>
            <p className="text-3xl font-bold text-white">{timeSaved} hrs</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Scans
          </h2>
          {history.length > 0 && (
             <button onClick={() => navigate('/history')} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors w-fit bg-transparent border-0 cursor-pointer">
               View All History <ArrowRight className="w-4 h-4" />
             </button>
          )}
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : isLoading ? (
          <div className="py-12 bg-slate-800/40 rounded-3xl border border-slate-700/50">
            <Loader message="Loading your scan history..." />
          </div>
        ) : (
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300 tracking-wide uppercase">Appliance & Issue</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300 tracking-wide uppercase">Severity</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300 tracking-wide uppercase">AI Confidence</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300 tracking-wide uppercase">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300 tracking-wide uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentScans.length > 0 ? recentScans.map((scan) => {
                    const confidence = Math.round((scan.confidence_score || 0) * 100);
                    const severity = scan.severity || 'medium';
                    
                    return (
                      <tr 
                        key={scan.id} 
                        className="hover:bg-slate-700/30 transition-colors group cursor-pointer" 
                        onClick={() => navigate(`/scan/${scan.id}`)}
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-slate-200">{scan.issue || 'Unknown Issue'}</div>
                          <div className="text-sm text-slate-400 capitalize mt-0.5 tracking-wide">
                            {scan.category_name || scan.appliance_category?.replace('_', ' ') || 'General'} • {scan.input_type || 'Image'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {severity === 'critical' || severity === 'high' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              {severity}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
                              {severity}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-full bg-slate-900 rounded-full h-2 max-w-[5rem] shadow-inner border border-slate-700">
                              <div 
                                className={`h-full rounded-full ${confidence > 85 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-300">{confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-400 font-medium">
                          {new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors flex items-center justify-end gap-1 w-full bg-transparent border-0 cursor-pointer"
                          >
                            View Report <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" />
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="max-w-xs mx-auto">
                           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                              <Camera className="w-8 h-8 text-slate-500" />
                           </div>
                           <h3 className="text-lg font-medium text-white mb-2">No scans yet</h3>
                           <p className="text-sm text-slate-400 mb-6">Start your first scan to diagnose an appliance issue.</p>
                           <Button onClick={() => navigate('/scan')} className="w-full py-2.5 text-sm">
                             Start First Scan
                           </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
