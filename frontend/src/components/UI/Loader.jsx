import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = "Analyzing image..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 w-full max-w-sm mx-auto shadow-xl">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/30 animate-pulse"></div>
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
      </div>
      <p className="text-slate-300 font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;
