import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, CheckCircle2, RefreshCw, Wrench, Volume2, 
  VolumeX, ShieldAlert, Hammer, Clock, IndianRupee, MessageSquare, Cpu
} from 'lucide-react';
import Button from '../UI/Button';
import { useAppContext } from '../../context/AppContext';

const Result = () => {
  const { resultData, resetState } = useAppContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!resultData) return null;

  const { 
    id, // Backend scan ID
    issue, 
    severity, 
    confidence_score, 
    repair_steps, 
    tools_required, 
    safety_warnings,
    appliance_category,
    estimated_cost,
    estimated_time,
    technician_required,
    repair_difficulty
  } = resultData;

  const handleSpeak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `Issue Detected: ${issue || 'Unknown'}. 
    Severity is ${severity || 'Unknown'}. 
    Safety Warnings: ${(safety_warnings || []).join('. ')}.
    Recommended Repair Steps: ${(repair_steps || []).join('. ')}.`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleChat = () => {
    if (!id) {
      // It's a guest scan, direct them to general chat with the issue text as initial prompt via state
      navigate('/chat', { state: { initialPrompt: `I need help fixing a ${issue}` } });
    } else {
      // Authenticated scan, pass the scan ID to load context
      navigate('/chat', { state: { scanId: id, applianceCategory: appliance_category } });
    }
  };

  const confidencePercentage = confidence_score ? Math.round(confidence_score * 100) : 0;
  
  let severityConfig = { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  if (severity?.toLowerCase() === 'high') {
    severityConfig = { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  } else if (severity?.toLowerCase() === 'critical') {
    severityConfig = { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  } else if (severity?.toLowerCase() === 'low') {
    severityConfig = { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
      
      {/* Header section */}
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

        <div className={`p-4 rounded-full ${severityConfig.bg} ${severityConfig.border} border mb-4 inline-flex mt-4`}>
          {severity?.toLowerCase() === 'critical' ? (
             <AlertTriangle className={`w-10 h-10 ${severityConfig.color} animate-pulse`} />
          ) : (
             <CheckCircle2 className={`w-10 h-10 ${severityConfig.color}`} />
          )}
        </div>
        
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">{appliance_category?.replace('_', ' ')}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">{issue}</h2>
        
        {confidence_score && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-sm font-medium text-slate-400">AI Confidence:</span>
            <div className="flex items-center bg-slate-900/80 rounded-full px-3 py-1 border border-slate-700">
              <span className={`text-sm font-bold ${confidencePercentage > 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                {confidencePercentage}%
              </span>
            </div>
            {severity && (
              <span className={`text-sm font-bold ml-2 px-3 py-1 rounded-full border uppercase tracking-wide text-xs ${severityConfig.color} ${severityConfig.border} ${severityConfig.bg}`}>
                {severity}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Critical Warnings */}
      {(technician_required || (safety_warnings && safety_warnings.length > 0)) && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          {technician_required && (
            <div className="flex items-start gap-3 mb-3 pb-3 border-b border-red-500/20">
              <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-md font-bold text-red-400 uppercase tracking-wide">Professional Required</h3>
                <p className="text-sm text-red-200/80 mt-1">This repair involves high risk. It is strongly recommended to hire a qualified electrician or technician.</p>
              </div>
            </div>
          )}
          
          {safety_warnings && safety_warnings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-md font-semibold text-red-300">Safety Precautions</h3>
              </div>
              <ul className="list-disc list-inside text-sm text-red-200/80 space-y-1.5 ml-1">
                {safety_warnings.map((prec, i) => <li key={i}>{prec}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
          <Clock className="w-5 h-5 text-blue-400 mb-2" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Time</span>
          <span className="text-sm font-bold text-slate-200">{estimated_time || 'Unknown'}</span>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
          <IndianRupee className="w-5 h-5 text-green-400 mb-2" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Est. Cost</span>
          <span className="text-sm font-bold text-slate-200">{estimated_cost || 'N/A'}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
          <Wrench className="w-5 h-5 text-purple-400 mb-2" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Difficulty</span>
          <span className="text-sm font-bold text-slate-200">{repair_difficulty || 'Unknown'}</span>
        </div>
      </div>

      {/* Required Tools */}
      {tools_required && tools_required.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Hammer className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-200">Tools Needed</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tools_required.map((tool, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-300 font-medium shadow-sm">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Repair Steps */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">AI Repair Steps</h3>
        </div>
        
        <div className="space-y-3">
          {repair_steps?.map((step, index) => (
            <div 
              key={index} 
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold mt-0.5 border border-blue-500/20 shadow-inner">
                {index + 1}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed pt-1 font-medium">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-700/50">
        <Button onClick={handleChat} className="flex-1 shadow-blue-500/20" icon={MessageSquare}>
          Chat with AI Assistant
        </Button>
        <Button onClick={resetState} variant="secondary" className="flex-1" icon={RefreshCw}>
          Scan Another Object
        </Button>
      </div>

    </div>
  );
};

export default Result;
