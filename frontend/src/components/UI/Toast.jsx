import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Toast = () => {
  const { toasts, removeToast } = useAppContext();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass = 'bg-blue-500 text-white';
        
        if (toast.type === 'success') {
          Icon = CheckCircle;
          colorClass = 'bg-green-500 text-white';
        } else if (toast.type === 'error') {
          Icon = AlertTriangle;
          colorClass = 'bg-red-500 text-white';
        }

        return (
          <div 
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300 ${colorClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium pr-4">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
