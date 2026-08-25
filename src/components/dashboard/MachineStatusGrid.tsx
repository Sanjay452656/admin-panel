'use client';

import { useMachineStore } from '@/store/machineStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Server, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export default function MachineStatusGrid() {
  const { machines, updateStatus } = useMachineStore();

  const { data, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const res = await api.get('/api/admin/machines');
      return res.data.data || [];
    },
  });

  useEffect(() => {
    if (data) {
      data.forEach((m: any) => {
        if (!machines.has(m.deviceVID || m._id)) {
          updateStatus(m.deviceVID || m._id, m.status || 'unknown');
        }
      });
    }
  }, [data, machines, updateStatus]);

  const machineList = (data || []).map((m: any) => ({
    deviceVID:       m.deviceVID || m._id,
    label:           m.model || m.serialNumber || m.deviceVID || m._id,
    serialNumber:    m.serialNumber || '',
    status:          machines.get(m.deviceVID || m._id)?.status || m.status || 'offline',
    anomalyDetected: machines.get(m.deviceVID || m._id)?.anomalyDetected || false,
  }));

  const onlineCount  = machineList.filter(m => m.status === 'online').length;
  const offlineCount = machineList.length - onlineCount;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Machine Status</h3>
        <Link href="/machines" className="text-sm text-primary hover:underline font-medium">View All</Link>
      </div>

      {/* Summary pills */}
      {machineList.length > 0 && (
        <div className="flex gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-medium text-green-700">{onlineCount} Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="text-xs font-medium text-gray-600">{offlineCount} Offline</span>
          </div>
        </div>
      )}

      <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
        {isLoading && machineList.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-400">Loading...</div>
        ) : machineList.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Server className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No machines provisioned</p>
          </div>
        ) : (
          machineList.map((machine) => (
            <Link
              href={'/machines/' + machine.deviceVID}
              key={machine.deviceVID}
              className={clsx(
                'flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm',
                machine.anomalyDetected ? 'border-red-200 bg-red-50' :
                machine.status === 'online' ? 'border-green-100 bg-green-50/40' :
                'border-gray-100 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  machine.anomalyDetected ? 'bg-red-100 text-red-600' :
                  machine.status === 'online' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-500'
                )}>
                  {machine.anomalyDetected ? <AlertTriangle className="w-4 h-4" /> :
                   machine.status === 'online' ? <Wifi className="w-4 h-4" /> :
                   <WifiOff className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{machine.label}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {machine.anomalyDetected
                      ? <span className="text-red-500 font-medium">⚠ Critical Alert</span>
                      : machine.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <span className={clsx(
                'w-2.5 h-2.5 rounded-full shrink-0',
                machine.anomalyDetected ? 'bg-red-500 animate-pulse' :
                machine.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
              )} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
