import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { scanService } from '../services/scanService';
import { useAppContext } from '../context/AppContext';
import ErrorMessage from '../components/UI/ErrorMessage';

// We reuse the updated Result component, but we need to inject the fetched data into the context
// because Result.jsx reads from AppContext.resultData
import Result from '../components/Result/Result'; 

const ScanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setResultData } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanDate, setScanDate] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [description, setDescription] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const data = await scanService.getScanDetail(id);
        
        // Populate context so the Result component can render it
        setResultData(data);
        
        // Local state for layout metadata
        setScanDate(new Date(data.created_at).toLocaleString(undefined, { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }));
        
        if (data.image) setImageUrl(data.image);
        if (data.description) setDescription(data.description);
        
      } catch (err) {
        setError(err.message || 'Failed to load scan details.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetail();
    
    // Cleanup context when leaving page so we don't accidentally show old data on the /scan page
    return () => {
       setResultData(null);
    };
  }, [id, setResultData]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Diagnostic Report</h1>
          {scanDate && (
             <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
               <Calendar className="w-4 h-4" /> {scanDate}
             </p>
          )}
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} />
      ) : isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Loading report data...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Input Data */}
          {(imageUrl || description) && (
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-4 shadow-lg sticky top-24">
                 <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Input Source</h3>
                 
                 {imageUrl && (
                   <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-black">
                     <img 
                       src={imageUrl} 
                       alt="Appliance scan" 
                       className="w-full h-auto object-cover max-h-64"
                       crossOrigin="anonymous" // needed if images are on another domain
                     />
                   </div>
                 )}
                 
                 {description && (
                   <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                     <p className="text-sm text-slate-300 italic">"{description}"</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* Right Column: Results (Reusing Result Component) */}
          <div className="w-full flex-1">
             <Result />
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ScanDetail;
