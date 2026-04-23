import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../components/UI/Button';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const recentScans = user?.history || [];
  const totalScans = user?.scansCount || 0;
  // Mock successful repairs based on total scans just for visual
  const successfulRepairs = Math.max(0, totalScans - 1); 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="text-blue-400">{user?.name || 'User'}</span>
          </h1>
          <p className="text-slate-400 mt-1 text-lg">Ready to fix something today?</p>
        </div>
        <Button 
          onClick={() => navigate('/scan')} 
          className="px-8 py-4 text-lg shadow-blue-500/20 group"
        >
          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Start New Scan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Camera className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Scans</p>
            <p className="text-2xl font-bold text-white">{totalScans}</p>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Successful Repairs</p>
            <p className="text-2xl font-bold text-white">{successfulRepairs}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Wrench className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Time Saved (est.)</p>
            <p className="text-2xl font-bold text-white">14 hrs</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Scans
          </h2>
          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Object / Issue</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">AI Confidence</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentScans.length > 0 ? recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{scan.problem || scan.object}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-900 rounded-full h-2 max-w-[4rem]">
                          <div 
                            className={`h-2 rounded-full ${scan.confidence > 90 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${scan.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-400">{scan.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        scan.status === 'Repaired' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {scan.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {scan.date || new Date(scan.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No scans yet. Start your first scan!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
