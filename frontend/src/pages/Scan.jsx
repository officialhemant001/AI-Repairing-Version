import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CameraComponent from '../components/Camera/Camera';
import Result from '../components/Result/Result';
import Loader from '../components/UI/Loader';
import ErrorMessage from '../components/UI/ErrorMessage';
import { useAppContext } from '../context/AppContext';
import { scanService } from '../services/scanService';

const Scan = () => {
  const navigate = useNavigate();
  const { loading, setLoading, resultData, setResultData, error, setError, resetState, addScanToHistory } = useAppContext();

  const handleCapture = async (imageBlob) => {
    setLoading(true);
    setError(null);
    setResultData(null);
    try {
      const data = await scanService.uploadImage(imageBlob);
      setResultData(data);
      addScanToHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    resetState();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen relative p-4 md:p-8">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-20">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300 flex items-center gap-2 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto relative z-10">
        
        {loading && (
          <div className="w-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
            <Loader message="AI is analyzing the damage..." />
          </div>
        )}

        {error && !loading && (
          <div className="w-full max-w-md animate-in fade-in duration-300">
            <ErrorMessage message={error} />
            <button 
              onClick={resetState}
              className="mt-4 px-6 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-full font-medium transition-colors w-full"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !resultData && !error && (
          <div className="w-full animate-in fade-in zoom-in duration-300 delay-100 fill-mode-both">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Scan Damage</h2>
              <p className="text-slate-400">Ensure the broken area is well-lit and in focus.</p>
            </div>
            <CameraComponent onCapture={handleCapture} />
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
