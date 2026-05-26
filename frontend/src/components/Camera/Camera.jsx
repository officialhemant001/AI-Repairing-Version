import React, { useEffect, useState } from 'react';
import { Camera as CameraIcon, AlertCircle, RefreshCw, Upload, SwitchCamera, Image as ImageIcon } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import './Camera.css';

const CameraComponent = ({ onCapture }) => {
  const { 
    videoRef, 
    startCamera, 
    stopCamera, 
    captureImage, 
    toggleCamera,
    isSupported,
    isLoading,
    facingMode,
    error, 
    stream 
  } = useCamera();
  
  const [previewImage, setPreviewImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCaptureClick = async () => {
    const imageBlob = await captureImage();
    if (imageBlob) {
      setPreviewImage(URL.createObjectURL(imageBlob));
      setCapturedBlob(imageBlob);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    setCapturedBlob(null);
    // Camera will auto-resume because the hook handles stream state, 
    // but just in case we need to re-initiate if it was stopped.
    if (!stream) {
      startCamera();
    }
  };

  const handleUpload = () => {
    if (onCapture && capturedBlob) {
      onCapture(capturedBlob);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setCapturedBlob(file);
      stopCamera(); // Stop camera since we have an image
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-800/80 border border-slate-700 rounded-2xl text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Camera Not Supported</h3>
        <p className="text-slate-400 mb-6">Your browser or device does not support direct camera access.</p>
        
        <label className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-colors shadow-lg shadow-blue-500/30 font-medium">
          <Upload className="w-5 h-5" />
          Upload Image Instead
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center max-w-md mx-auto animate-in fade-in zoom-in">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-300 font-medium mb-6">{error}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button onClick={startCamera} variant="outline" className="flex-1 border-red-500/50 text-red-300 hover:bg-red-500/20">
            Try Camera Again
          </Button>
          <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full cursor-pointer transition-colors border border-slate-700 font-medium">
            <Upload className="w-5 h-5" />
            Upload File
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container animate-in fade-in duration-500">
      {previewImage ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-xl overflow-hidden">
          <img 
            src={previewImage} 
            alt="Preview" 
            className="w-full h-full object-cover max-h-[60vh] rounded-t-xl"
          />
          <div className="w-full p-4 flex gap-4 bg-slate-800 rounded-b-xl border-t border-slate-700 relative z-20">
            <Button onClick={handleRetake} variant="secondary" className="flex-1" icon={RefreshCw}>
              Retake
            </Button>
            <Button onClick={handleUpload} className="flex-1" icon={Upload}>
              Analyze
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[400px]">
          {isLoading && !stream && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader message="Starting camera..." />
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`camera-video ${facingMode === 'environment' ? 'environment' : 'user'}`} 
          />
          
          {/* Overlay must allow pointer events to pass through, OR buttons inside must have pointer-events-auto */}
          <div className="camera-overlay pointer-events-none">
            
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full">
              <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg border border-white/10">
                Position damage in center
              </div>
              
              <div className="flex gap-2">
                 {/* Enable pointer events specifically for buttons inside the overlay */}
                 <button 
                   onClick={toggleCamera}
                   className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-colors pointer-events-auto"
                   title="Switch Camera"
                 >
                   <SwitchCamera className="w-5 h-5" />
                 </button>
                 
                 <label 
                   className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-colors pointer-events-auto cursor-pointer"
                   title="Upload from gallery"
                 >
                   <ImageIcon className="w-5 h-5" />
                   <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                 </label>
              </div>
            </div>
            
            <div className="camera-guides">
               {/* Corner markers for better visual */}
               <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-lg opacity-70"></div>
               <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-lg opacity-70"></div>
               <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-lg opacity-70"></div>
               <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-lg opacity-70"></div>
            </div>

            {/* Bottom Bar - Capture Button */}
            <div className="flex justify-center w-full pb-4">
              <button 
                onClick={handleCaptureClick}
                disabled={!stream}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 disabled:opacity-50 pointer-events-auto hover:bg-white/40"
                aria-label="Take photo"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-inner"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
