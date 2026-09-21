'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN']}>
      <OrdersContent />
    </ProtectedRoute>
  );
}

function OrdersContent() {
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const { data: machinesList } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const res = await api.get('/api/admin/machines');
      return res.data.data || [];
    },
  });

  const getMachineName = (machine_id: string) => {
    const m = (machinesList || []).find(
      (m: any) => m._id === machine_id || m.deviceVID === machine_id
    );
    return m?.model || m?.serialNumber || machine_id?.slice(-8).toUpperCase() || 'Unknown';
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'all', selectedMachineId],
    queryFn: async () => {
      const url = selectedMachineId ? `/api/admin/orders?machine_id=${selectedMachineId}` : '/api/admin/orders';
      const res = await api.get(url);
      return res.data.orders || res.data.data || [];
    },
  });

  const totalRevenue = (orders || [])
    .filter((o: any) => o.payment_status === 'PAID')
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {!isLoading && orders?.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {orders.length} total orders &bull; Rs.{totalRevenue} paid revenue
            </p>
          )}
        </div>
        {machinesList && machinesList.length > 0 && (
          <div className="shrink-0">
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white"
            >
              <option value="">All Machines</option>
              {machinesList.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.serialNumber || m.deviceVID || m._id} ({m.model})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading orders...</div>
        ) : !orders?.length ? (
          <div className="p-12 text-center flex flex-col items-center text-gray-400">
            <ShoppingCart className="w-12 h-12 mb-3 opacity-40" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="py-3 px-5 font-medium">Order ID</th>
                  <th className="py-3 px-5 font-medium">Machine</th>
                  <th className="py-3 px-5 font-medium">Items</th>
                  <th className="py-3 px-5 font-medium">Amount</th>
                  <th className="py-3 px-5 font-medium">Method</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                  <th className="py-3 px-5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                {orders?.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-gray-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-gray-900">{getMachineName(order.machine_id)}</div>
                      <div className="text-xs text-gray-400 font-mono">{order.machine_id?.slice(-8)}</div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-600">
                      {order.items?.map((item: any) => (
                        <div key={item.product_id} className="text-xs">
                          {item.product_name} x{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-gray-900">Rs.{order.total_amount}</td>
                    <td className="py-3.5 px-5">
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        order.payment_method === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      )}>
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        order.payment_status === 'PAID'    ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-400 text-xs whitespace-nowrap">
                      {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
