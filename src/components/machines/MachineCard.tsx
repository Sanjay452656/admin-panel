'use client';

import { useMachineStore } from '@/store/machineStore';
import { Server, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

interface MachineCardProps {
  machine: any; // Using any for simplicity here, but should be typed in a real app
}

export default function MachineCard({ machine }: MachineCardProps) {
  const vid = machine.deviceVID || machine._id;
  const displayName = machine.serialNumber || vid;
  const storeMachine = useMachineStore(state => state.machines.get(vid));
  
  // Prefer live store data, fallback to API data
  const status = storeMachine?.status || machine.status || 'offline';
  const hasAnomaly = storeMachine?.anomalyDetected;
  const latestTelemetry = storeMachine?.latestTelemetry || machine.latestTelemetry;
  const telemetryAt = storeMachine?.telemetryAt || machine.telemetryAt;

  // Extract a key metric for display (e.g. motor temperature)
  let keyMetric = null;
  if (latestTelemetry) {
    const tempKey = Object.keys(latestTelemetry).find(k => k.toLowerCase().includes('temperature'));
    if (tempKey) {
      keyMetric = { label: 'Temp', value: `${latestTelemetry[tempKey]}°C` };
    }
  }

  return (
    <Link 
      href={`/machines/${vid}`}
      className={clsx(
        "bg-white rounded-xl shadow-sm border p-5 flex flex-col transition-all hover:shadow-md",
        hasAnomaly ? "border-red-300 bg-red-50/30" : "border-gray-100"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            hasAnomaly ? "bg-red-100 text-red-600" :
            status === 'online' ? "bg-green-100 text-green-600" : 
            "bg-gray-100 text-gray-500"
          )}>
            {hasAnomaly ? <AlertTriangle className="w-6 h-6" /> : <Server className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{displayName}</h3>
            <div className="flex items-center mt-1">
              <span className={clsx(
                "w-2 h-2 rounded-full mr-2",
                hasAnomaly ? "bg-red-500 animate-pulse" :
                status === 'online' ? "bg-green-500" : "bg-gray-400"
              )}></span>
              <span className={clsx(
                "text-xs font-medium",
                hasAnomaly ? "text-red-600" :
                status === 'online' ? "text-green-600" : "text-gray-500"
              )}>
                {hasAnomaly ? 'CRITICAL ALERT' : status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <Activity className="w-4 h-4 mr-1.5" />
          {telemetryAt ? (
            <span>Updated {formatDistanceToNow(new Date(telemetryAt), { addSuffix: true })}</span>
          ) : (
            <span>No data yet</span>
          )}
        </div>
        {keyMetric && (
          <div className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
            {keyMetric.label}: {keyMetric.value}
          </div>
        )}
      </div>
    </Link>
  );
}
