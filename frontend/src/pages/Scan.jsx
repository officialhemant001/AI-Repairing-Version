import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Image as ImageIcon, Mic, FileText, ChevronDown } from 'lucide-react';
import CameraComponent from '../components/Camera/Camera';
import Result from '../components/Result/Result';
import Loader from '../components/UI/Loader';
import ErrorMessage from '../components/UI/ErrorMessage';
import Button from '../components/UI/Button';
import { useAppContext } from '../context/AppContext';
import { scanService } from '../services/scanService';
import { APPLIANCE_CATEGORIES } from '../utils/constants';
import { useVoiceInput } from '../hooks/useVoiceInput';

const Scan = () => {
  const navigate = useNavigate();
  const { loading, setLoading, resultData, setResultData, error, setError, resetState, user, addToast } = useAppContext();
  
  // UI State
  const [activeTab, setActiveTab] = useState('camera'); // camera, text
  const [applianceCategory, setApplianceCategory] = useState('');
  
  // Text/Voice State
  const { 
    isListening, 
    transcript, 
    toggleListening, 
    error: voiceError, 
    isSupported: voiceSupported,
    setTranscriptValue
  } = useVoiceInput();

  const handleCapture = async (imageBlob) => {
    setLoading(true);
    setError(null);
    setResultData(null);
    try {
      const data = await scanService.uploadImage(imageBlob, applianceCategory);
      setResultData(data);
      if (!user) {
        addToast('Sign up to save this scan to your history!', 'info');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!transcript.trim()) {
      setError("Please describe the issue first.");
      return;
    }
    
    // Stop listening if active
    if (isListening) toggleListening();

    setLoading(true);
    setError(null);
    setResultData(null);
    try {
      const data = await scanService.analyzeText(transcript, applianceCategory);
      setResultData(data);
      if (!user) {
        addToast('Sign up to save this scan to your history!', 'info');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (resultData) {
      resetState();
    } else {
      resetState();
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative p-4 md:p-8 overflow-hidden animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-20 gap-4">
        <button 
          onClick={handleBack}
          className="w-fit p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300 flex items-center gap-2 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Global Appliance Selector - Only show if not in result view */}
        {!resultData && (
          <div className="relative max-w-xs w-full sm:w-64">
            <select
              value={applianceCategory}
              onChange={(e) => setApplianceCategory(e.target.value)}
              className="w-full appearance-none bg-slate-800/80 border border-slate-700 text-white py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium"
            >
              <option value="">Select Appliance (Optional)</option>
              {APPLIANCE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto relative z-10">
        
        {loading && (
          <div className="w-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
            <Loader message="AI is diagnosing the issue..." />
          </div>
        )}

        {error && !loading && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ErrorMessage message={error} />
            <Button 
              onClick={resetState}
              variant="outline"
              className="w-full mt-2"
            >
              Clear Error & Try Again
            </Button>
          </div>
        )}

        {!loading && !resultData && !error && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Tabs */}
            <div className="flex bg-slate-800/60 backdrop-blur-md p-1.5 rounded-2xl mb-6 shadow-sm border border-slate-700/50">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'camera' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Camera className="w-4 h-4" /> Camera / Upload
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'text' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <FileText className="w-4 h-4" /> Text / Voice
              </button>
            </div>

            {/* Camera View */}
            {activeTab === 'camera' && (
              <div className="w-full animate-in fade-in duration-300">
                <CameraComponent onCapture={handleCapture} />
              </div>
            )}

            {/* Text / Voice View */}
            {activeTab === 'text' && (
              <div className="w-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl animate-in fade-in duration-300">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Describe the problem</h3>
                  {voiceSupported && (
                    <button
                      onClick={toggleListening}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        isListening 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' 
                          : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      {isListening ? 'Listening...' : 'Use Voice'}
                    </button>
                  )}
                </div>
                
                {voiceError && <ErrorMessage message={voiceError} />}
                
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscriptValue(e.target.value)}
                  placeholder="E.g. My ceiling fan is making a grinding noise and spinning very slowly..."
                  className="w-full h-40 bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                />
                
                <Button 
                  onClick={handleTextSubmit} 
                  className="w-full mt-4 py-3.5 shadow-blue-500/20"
                  disabled={!transcript.trim()}
                >
                  Analyze Issue
                </Button>
              </div>
            )}

          </div>
        )}

        {resultData && !loading && (
          <div className="w-full">
            <Result />
          </div>
        )}

      </main>
      
    </div>
  );
};

export default Scan;
