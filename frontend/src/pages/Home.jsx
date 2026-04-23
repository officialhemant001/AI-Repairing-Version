import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Zap, ShieldCheck } from 'lucide-react';
import Button from '../components/UI/Button';
import { APP_NAME, APP_DESCRIPTION } from '../utils/constants';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center space-y-10">
        
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-30 animate-pulse rounded-full"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 relative z-10 border border-white/10">
            <Camera className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            {APP_DESCRIPTION}
          </p>
        </div>

        {/* Features List */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 w-full text-left space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-slate-300 font-medium">Scan any broken object</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-slate-300 font-medium">Instant AI analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-slate-300 font-medium">Step-by-step repair guides</span>
          </div>
        </div>

        {/* CTA */}
        <Button 
          onClick={() => navigate('/scan')} 
          className="w-full text-lg py-4 group"
        >
          Start Scan Now
          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Button>
        
      </div>
    </div>
  );
};

export default Home;
