'use client';

import clsx from 'clsx';
import { Settings } from 'lucide-react';

interface MotorStatusProps {
  name: string;
  temperature: number | null;
  isRunning: boolean | null;
}

export default function MotorStatus({ name, temperature, isRunning }: MotorStatusProps) {
  const getTempColor = (temp: number | null) => {
    if (temp === null) return 'text-gray-500';
    if (temp < 50) return 'text-green-600';
    if (temp < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-sm text-gray-700">{name}</span>
        <Settings className={clsx("w-4 h-4", isRunning ? "text-primary animate-spin-slow" : "text-gray-300")} />
      </div>
      
      <div className="flex justify-between items-end mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Status</span>
          <span className={clsx("text-sm font-bold", isRunning ? "text-green-600" : "text-gray-500")}>
            {isRunning ? 'RUNNING' : 'IDLE'}
          </span>
        </div>
        
        {temperature !== null && (
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">Temp</span>
            <span className={clsx("text-sm font-bold", getTempColor(temperature))}>
              {temperature}°C
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
