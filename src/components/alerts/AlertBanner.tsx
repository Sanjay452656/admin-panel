'use client';

import { useAlertStore } from '@/store/alertStore';
import { AlertTriangle, X } from 'lucide-react';

export default function AlertBanner() {
  const alerts = useAlertStore(state => state.alerts);
  const resolveAlert = useAlertStore(state => state.resolveAlert);
  
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  
  if (criticalAlerts.length === 0) return null;
  
  const alert = criticalAlerts[0];
  
  return (
    <div className="bg-red-600 text-white p-4 flex items-center justify-between mb-6 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-6 h-6 shrink-0 animate-pulse" />
        <div>
          <p className="font-bold">CRITICAL: Machine {alert.deviceVID}</p>
          <p className="text-sm">{alert.message} at {new Date(alert.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>
      <button 
        onClick={() => resolveAlert(alert.id)}
        className="p-2 hover:bg-red-700 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
