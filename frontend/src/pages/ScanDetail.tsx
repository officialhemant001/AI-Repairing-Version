import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, FileText, Download } from 'lucide-react';
import { scanService } from '../services/scanService';
import { useAppContext } from '../context/AppContext';
import ErrorMessage from '../components/UI/ErrorMessage';
import Result from '../components/Result/Result'; 
import { Scan } from '../types/scan';

const ScanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setResultData } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanData, setScanData] = useState<Scan | null>(null);
  const [scanDate, setScanDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await scanService.getScanDetail(id);
        setScanData(data);
        setResultData(data);
        
        setScanDate(new Date(data.created_at).toLocaleString(undefined, { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }));
      } catch (err: any) {
        setError(err.message || 'Failed to load scan details.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetail();
    
    return () => {
       setResultData(null);
    };
  }, [id, setResultData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors bg-transparent border-0 cursor-pointer"
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
      ) : scanData ? (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Input Data */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
            
            {/* Primary Image / Description */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-5 shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Diagnostic Context</h3>
              
              {scanData.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black">
                  <img 
                    src={scanData.image} 
                    alt="Appliance scan" 
                    className="w-full h-auto object-cover max-h-64"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              
              {scanData.description && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                  <p className="text-sm text-slate-300 italic">"{scanData.description}"</p>
                </div>
              )}
            </div>

            {/* Additional Images (if any) */}
            {scanData.images && scanData.images.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-5 shadow-lg">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Additional Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {scanData.images.map((img) => (
                    <div key={img.id} className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video">
                      <img 
                        src={img.image} 
                        alt={img.caption || 'Additional scan'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF manual / previous reports attachments */}
            {scanData.documents && scanData.documents.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-5 shadow-lg">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Attached Documents</h3>
                <div className="space-y-2">
                  {scanData.documents.map((doc) => (
                    <a 
                      key={doc.id}
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-700/50 rounded-xl hover:bg-slate-700/30 transition-all text-slate-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-semibold truncate max-w-[150px]">{doc.original_filename}</span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: AI Analysis Result */}
          <div className="w-full flex-1">
             <Result />
          </div>
          
        </div>
      ) : null}
    </div>
  );
};

export default ScanDetail;
