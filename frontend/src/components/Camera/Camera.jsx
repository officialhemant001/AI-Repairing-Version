import React, { useEffect, useState } from 'react';
import { Camera as CameraIcon, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import Button from '../UI/Button';
import './Camera.css';

const CameraComponent = ({ onCapture }) => {
  const { videoRef, startCamera, stopCamera, captureImage, error, stream } = useCamera();
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCaptureClick = async () => {
    const imageBlob = await captureImage();
    if (imageBlob) {
      setPreviewImage(URL.createObjectURL(imageBlob));
      // Store blob in state to send later
      videoRef.current.imageBlob = imageBlob;
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
  };

  const handleUpload = () => {
    if (onCapture && videoRef.current?.imageBlob) {
      onCapture(videoRef.current.imageBlob);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-300 font-medium">{error}</p>
        <Button onClick={startCamera} variant="outline" className="mt-6 border-red-500/50 text-red-300 hover:bg-red-500/20">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {previewImage ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900">
          <img 
            src={previewImage} 
            alt="Preview" 
            className="w-full h-full object-cover max-h-[60vh] rounded-t-xl"
          />
          <div className="w-full p-4 flex gap-4 bg-slate-800 rounded-b-xl border-t border-slate-700">
            <Button onClick={handleRetake} variant="secondary" className="flex-1" icon={RefreshCw}>
              Retake
            </Button>
            <Button onClick={handleUpload} className="flex-1" icon={Upload}>
              Upload
            </Button>
          </div>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="camera-video environment" 
          />
          
          <div className="camera-overlay">
            <div className="flex justify-between items-start w-full">
              <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg">
                Position the damage in the center
              </div>
            </div>
            
            <div className="camera-guides"></div>

            <div className="flex justify-center w-full pb-4">
              <button 
                onClick={handleCaptureClick}
                disabled={!stream}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 disabled:opacity-50 disabled:pointer-events-none hover:bg-white/40"
                aria-label="Take photo"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-inner"></div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraComponent;
