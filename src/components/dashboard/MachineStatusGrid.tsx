'use client';

import { useMachineStore } from '@/store/machineStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Server, AlertTriangle } from 'lucide-react';

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

  // Build an enriched list using API data (has serialNumber) + store data (has live status)
  const machineList = (data || []).map((m: any) => ({
    deviceVID: m.deviceVID || m._id,
    serialNumber: m.serialNumber || m.deviceVID || m._id,
    status: machines.get(m.deviceVID || m._id)?.status || m.status || 'offline',
    anomalyDetected: machines.get(m.deviceVID || m._id)?.anomalyDetected || false,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between shrink-0">
        Machine Status
        <Link href="/machines" className="text-sm text-primary hover:underline font-medium">View All</Link>
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
        {isLoading && machineList.length === 0 ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : machineList.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No machines found</div>
        ) : (
          machineList.map((machine) => (
            <Link 
              href={`/machines/${machine.deviceVID}`}
              key={machine.deviceVID} 
              className={clsx(
                "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50",
                machine.anomalyDetected ? "border-red-200 bg-red-50" : "border-gray-100"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  machine.anomalyDetected ? "bg-red-100 text-red-600" :
                  machine.status === 'online' ? "bg-green-100 text-green-600" : 
                  "bg-gray-100 text-gray-500"
                )}>
                  {machine.anomalyDetected ? <AlertTriangle className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{machine.serialNumber}</p>
                  <p className="text-xs text-gray-500">
                    {machine.anomalyDetected ? <span className="text-red-600 font-medium">Critical Alert</span> : 
                     machine.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={clsx(
                  "w-2.5 h-2.5 rounded-full",
                  machine.anomalyDetected ? "bg-red-500 animate-pulse" :
                  machine.status === 'online' ? "bg-green-500" : "bg-gray-400"
                )}></span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
