'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMachineStore } from '@/store/machineStore';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import TelemetryPanel from '@/components/machines/TelemetryPanel';
import CommandPanel from '@/components/machines/CommandPanel';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export default function MachineDetailPage() {
  const params = useParams();
  const deviceVID = params.deviceVID as string;
  const storeMachine = useMachineStore(state => state.machines.get(deviceVID));
  
  const { data: machine, isLoading, error } = useQuery({
    queryKey: ['machine', deviceVID],
    queryFn: async () => {
      const res = await api.get(`/api/admin/machines/${deviceVID}`);
      return res.data.data;
    },
  });

  const { data: model } = useQuery({
    queryKey: ['model', machine?.model_id],
    queryFn: async () => {
      const res = await api.get(`/api/admin/catalog/models/${machine.model_id}`);
      return res.data.data;
    },
    enabled: !!machine?.model_id,
  });

  if (isLoading) return <div className="p-8 text-center">Loading machine data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load machine data.</div>;
  if (!machine) return <div className="p-8 text-center">Machine not found.</div>;

  const status = storeMachine?.status || machine.status || 'offline';
  const anomaly = storeMachine?.anomalyDetected;
  const telemetry = storeMachine?.latestTelemetry || machine.latestTelemetry;
  const telemetryAt = storeMachine?.telemetryAt || machine.telemetryAt;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/machines" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Machine {deviceVID}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Model: {model ? model.name : machine.model_id || 'Unknown'}
          </p>
        </div>
      </div>

      {anomaly && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Critical Alert</h4>
            <p className="text-sm mt-1">{storeMachine?.hardwareAlert || 'Anomaly detected in hardware.'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Connection</span>
              <span className={clsx(
                "px-2.5 py-1 rounded-full text-xs font-medium flex items-center",
                status === 'online' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              )}>
                <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", status === 'online' ? "bg-green-500" : "bg-gray-500")}></span>
                {status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Last Telemetry</span>
              <span className="text-sm font-medium text-gray-900">
                {telemetryAt ? formatDistanceToNow(new Date(telemetryAt), { addSuffix: true }) : 'Never'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Hardware</span>
              <span className={clsx(
                "px-2.5 py-1 rounded-full text-xs font-medium flex items-center",
                anomaly ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              )}>
                {anomaly ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                {anomaly ? 'ERROR' : 'OK'}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <CommandPanel deviceVID={deviceVID} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center text-lg">
          <Server className="w-5 h-5 mr-2 text-gray-500" />
          Live Telemetry
        </h3>
        
        <TelemetryPanel 
          components={model?.components || machine.components || []} 
          telemetry={telemetry} 
        />
      </div>
    </div>
  );
}
