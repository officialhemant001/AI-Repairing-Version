import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Wrench, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import Button from '../UI/Button';
import { useAppContext } from '../../context/AppContext';

const Result = () => {
  const { resultData, resetState } = useAppContext();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Cleanup speech synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!resultData) return null;

  const { problem, confidence, steps } = resultData;

  const handleSpeak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `Issue Detected: ${problem}. Recommended Repair Steps: ${steps.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const confidencePercentage = confidence && confidence <= 1 ? Math.round(confidence * 100) : confidence || 0;
  
  let severityColor = "text-yellow-500";
  let severityBg = "bg-yellow-500/10";
  let severityBorder = "border-yellow-500/20";
  
  if (confidencePercentage > 85) {
    severityColor = "text-red-500";
    severityBg = "bg-red-500/10";
    severityBorder = "border-red-500/20";
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-500">
      
      <div className="flex flex-col items-center text-center mb-8 relative">
        <button 
          onClick={handleSpeak}
          className="absolute top-0 right-0 p-3 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors group"
          title="Read Aloud"
        >
          {isPlaying ? (
            <VolumeX className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
          ) : (
            <Volume2 className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
          )}
        </button>

        <div className={`p-4 rounded-full ${severityBg} ${severityBorder} border mb-4 inline-flex mt-4`}>
          <AlertTriangle className={`w-10 h-10 ${severityColor}`} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Issue Detected</h2>
        <p className="text-lg text-slate-300 font-medium bg-slate-900/50 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          {problem}
        </p>
        
        {confidence && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-slate-400">AI Confidence:</span>
            <div className="flex items-center bg-slate-900/80 rounded-full px-3 py-1 border border-slate-700">
              <span className={`text-sm font-bold ${confidencePercentage > 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                {confidencePercentage}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Wrench className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Recommended Repair Steps</h3>
        </div>
        
        <div className="bg-slate-900/50 rounded-2xl p-2 border border-slate-700/50">
          <ul className="space-y-1">
            {steps?.map((step, index) => (
              <li 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold mt-0.5 border border-blue-500/30">
                  {index + 1}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed pt-0.5">
                  {step}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={resetState} className="w-full" icon={RefreshCw}>
          Scan Another Object
        </Button>
      </div>

    </div>
  );
};

export default Result;
