'use client';

import { useAlertStore } from '@/store/alertStore';
import { Info, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';

export default function AlertToast() {
  const alerts = useAlertStore(state => state.alerts);
  const resolveAlert = useAlertStore(state => state.resolveAlert);
  
  const toastAlerts = alerts.filter(a => a.severity === 'HIGH' || a.severity === 'WARNING');
  
  if (toastAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toastAlerts.slice(0, 3).map(alert => (
        <div 
          key={alert.id}
          className={clsx(
            "p-4 rounded-lg shadow-lg border flex items-start gap-3 w-80 animate-in slide-in-from-right-full",
            alert.severity === 'HIGH' 
              ? "bg-orange-50 border-orange-200 text-orange-900" 
              : "bg-yellow-50 border-yellow-200 text-yellow-900"
          )}
        >
          {alert.severity === 'HIGH' ? (
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-sm">
              Machine {alert.deviceVID}
            </h4>
            <p className="text-sm mt-1 opacity-90">{alert.message}</p>
          </div>
          <button 
            onClick={() => resolveAlert(alert.id)}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
