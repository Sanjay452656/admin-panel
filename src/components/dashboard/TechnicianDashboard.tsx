'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useMachineStore } from '@/store/machineStore';
import { Server, AlertTriangle, ShoppingCart, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { formatDistanceToNow, format } from 'date-fns';

export default function TechnicianDashboard() {
  const { user } = useAuthStore();
  const machines = useMachineStore(state => state.machines);

  // Technician's assigned machines from their user profile
  const { data: assignedMachineData, isLoading: loadingMachines } = useQuery({
    queryKey: ['machines', 'assigned'],
    queryFn: async () => {
      const res = await api.get('/api/admin/machines');
      return res.data.data || [];
    },
  });

  // Only pending CASH orders (what technician needs to confirm)
  const { data: pendingOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', 'pending-cash'],
    queryFn: async () => {
      const res = await api.get('/api/admin/orders?payment_method=CASH&payment_status=PENDING');
      return res.data.orders || [];
    },
    refetchInterval: 30000, // poll every 30s for new cash orders
  });

  const machineList = assignedMachineData || [];
  const onlineCount = machineList.filter((m: any) => {
    const store = machines.get(m.deviceVID || m._id);
    return store?.status === 'online';
  }).length;
  const alertCount = Array.from(machines.values()).filter(m => m.anomalyDetected).length;

  return (
    <div className="space-y-6">
      {/* KPIs — no revenue, only operational metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Assigned Machines</p>
            <p className="text-2xl font-bold text-gray-900">{loadingMachines ? '...' : machineList.length}</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">{onlineCount} online</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className={clsx(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            alertCount > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"
          )}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Alerts</p>
            <p className={clsx("text-2xl font-bold", alertCount > 0 ? "text-red-600" : "text-gray-900")}>
              {alertCount}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{alertCount === 0 ? 'All clear' : 'Needs attention'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className={clsx(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            pendingOrders?.length > 0 ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"
          )}>
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Cash Orders</p>
            <p className={clsx("text-2xl font-bold", pendingOrders?.length > 0 ? "text-yellow-600" : "text-gray-900")}>
              {loadingOrders ? '...' : (pendingOrders?.length || 0)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Awaiting confirmation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Machines status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
            My Machines
            <Link href="/machines" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </h3>
          <div className="space-y-3">
            {loadingMachines ? (
              <p className="text-center text-gray-500 py-4">Loading...</p>
            ) : machineList.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No machines assigned yet.</p>
            ) : (
              machineList.map((m: any) => {
                const vid = m.deviceVID || m._id;
                const store = machines.get(vid);
                const status = store?.status || m.status || 'offline';
                const hasAnomaly = store?.anomalyDetected;
                return (
                  <Link
                    key={vid}
                    href={`/machines/${vid}`}
                    className={clsx(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50",
                      hasAnomaly ? "border-red-200 bg-red-50" : "border-gray-100"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={clsx(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        hasAnomaly ? "bg-red-500 animate-pulse" :
                        status === 'online' ? "bg-green-500" : "bg-gray-400"
                      )}></span>
                      <span className="font-medium text-gray-800 text-sm">{vid}</span>
                    </div>
                    <span className={clsx(
                      "text-xs font-semibold",
                      hasAnomaly ? "text-red-600" :
                      status === 'online' ? "text-green-600" : "text-gray-500"
                    )}>
                      {hasAnomaly ? 'ALERT' : status.toUpperCase()}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Pending cash orders — actionable for technician */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
            Pending Cash Orders
            <Link href="/orders" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </h3>
          <div className="space-y-3">
            {loadingOrders ? (
              <p className="text-center text-gray-500 py-4">Loading...</p>
            ) : pendingOrders?.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center text-gray-400">
                <ClipboardCheck className="w-10 h-10 mb-2" />
                <p className="font-medium">No pending cash orders</p>
                <p className="text-sm">All clear!</p>
              </div>
            ) : (
              pendingOrders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Machine: {order.machine_id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(order.createdAt), 'MMM d, HH:mm')} · {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.total_amount}</p>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      CASH
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

