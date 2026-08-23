'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { useMachineStore } from '@/store/machineStore';
import { useAlertStore } from '@/store/alertStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken } = useAuthStore();
  const updateStatus = useMachineStore(state => state.updateStatus);
  const updateTelemetry = useMachineStore(state => state.updateTelemetry);
  const addAlert = useAlertStore(state => state.addAlert);

  useEffect(() => {
    if (accessToken) {
      const socket = getSocket(accessToken);
      if (!socket.connected) {
        socket.connect();
      }
      
      socket.on('machine:status', (data) => {
        updateStatus(data.machine_id, data.status);
      });
      
      socket.on('machine:telemetry', (data) => {
        updateTelemetry(data.machine_id, data.data);
      });
      
      socket.on('machine:alert', (data) => {
        addAlert({
          id: Math.random().toString(36).substr(2, 9),
          deviceVID: data.machine_id,
          type: data.type,
          message: data.message,
          severity: data.severity,
          timestamp: Date.now(),
        });
      });

      return () => {
        socket.off('machine:status');
        socket.off('machine:telemetry');
        socket.off('machine:alert');
      };
    }
  }, [accessToken, updateStatus, updateTelemetry, addAlert]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 relative">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
