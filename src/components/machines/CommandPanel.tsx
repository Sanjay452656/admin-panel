'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { RefreshCcw, Power, Terminal } from 'lucide-react';
import clsx from 'clsx';

interface CommandPanelProps {
  deviceVID: string;
}

export default function CommandPanel({ deviceVID }: CommandPanelProps) {
  const { user } = useAuthStore();
  const [loadingCmd, setLoadingCmd] = useState<string | null>(null);
  
  if (!user || user.role === 'TECHNICIAN') {
    return null;
  }

  const sendCommand = async (cmdName: string, message: string) => {
    setLoadingCmd(cmdName);
    try {
      await api.post(`/api/admin/machines/${deviceVID}/commands`, { message });
    } catch (error) {
      console.error('Failed to send command', error);
      alert(`Failed to send command: ${message}`);
    } finally {
      setLoadingCmd(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Terminal className="w-5 h-5 mr-2 text-gray-500" />
        Commands
      </h3>
      
      <div className="space-y-3 flex-1">
        <button
          onClick={() => sendCommand('read', 'getDataFromHardware')}
          disabled={loadingCmd !== null}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center text-sm font-medium text-gray-700">
            <RefreshCcw className={clsx("w-4 h-4 mr-3 text-blue-500", loadingCmd === 'read' && "animate-spin")} />
            Force Read Telemetry
          </div>
        </button>
        
        <button
          onClick={() => sendCommand('motor', 'toggleSteeringMotor')}
          disabled={loadingCmd !== null}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Power className={clsx("w-4 h-4 mr-3 text-orange-500", loadingCmd === 'motor' && "animate-pulse")} />
            Toggle Steering Motor
          </div>
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-4 text-center">
        Commands are sent via MQTT and may take a few seconds to execute.
      </p>
    </div>
  );
}
