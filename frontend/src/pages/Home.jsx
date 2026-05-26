import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Zap, ShieldCheck, Cpu, Mic, FileText, ArrowRight } from 'lucide-react';
import Button from '../components/UI/Button';
import { APP_NAME, APP_DESCRIPTION, APPLIANCE_CATEGORIES } from '../utils/constants';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Animated Background decorations */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-float"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-float animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-12 mt-8 sm:mt-16">
        
        {/* Premium Logo / Icon */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse rounded-full"></div>
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 relative z-10 border border-white/10 group-hover:scale-105 transition-transform duration-500">
            <Cpu className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-6 max-w-2xl px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight leading-tight">
            Fix appliances <br className="hidden sm:block" />smarter with AI.
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed">
            {APP_DESCRIPTION}
          </p>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
          <Button 
            onClick={() => navigate('/scan')} 
            className="w-full sm:w-auto text-lg py-4 px-8 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Troubleshooting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          </Button>
          <Button 
            onClick={() => navigate('/chat')} 
            variant="outline"
            className="w-full sm:w-auto text-lg py-4 px-8 group bg-slate-800/50 backdrop-blur-sm"
          >
            Chat with AI Expert
          </Button>
        </div>

        {/* Supported Input Methods */}
        <div className="w-full max-w-3xl pt-12 border-t border-slate-700/50">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">4 ways to diagnose</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <Camera className="w-6 h-6 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Camera Scan</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <Mic className="w-6 h-6 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Voice Input</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <FileText className="w-6 h-6 text-green-400" />
              <span className="text-sm font-medium text-slate-300">Text Describe</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">Live Chat</span>
            </div>
          </div>
        </div>

        {/* Categories Marquee / Grid */}
        <div className="w-full pt-12 pb-24">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6 text-center">Supported Appliances</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto px-4">
            {APPLIANCE_CATEGORIES.filter(c => c.value !== 'general').map((cat) => (
              <div 
                key={cat.value} 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/40 border border-slate-700/50 text-slate-300 text-sm font-medium hover:border-blue-500/50 hover:text-white transition-colors cursor-default"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
