import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 p-4 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default ErrorMessage;
