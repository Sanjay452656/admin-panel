'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ShoppingCart } from 'lucide-react';

export default function RecentOrders() {
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

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => {
      const res = await api.get('/api/admin/orders?limit=8');
      // Backend returns { orders: [...] } or { data: [...] }
      return res.data.orders || res.data.data || [];
    },
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
        <Link href="/orders" className="text-sm text-primary hover:underline font-medium">View All</Link>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-400">Loading...</div>
      ) : !data?.length ? (
        <div className="py-10 flex flex-col items-center text-gray-400">
          <ShoppingCart className="w-10 h-10 mb-2" />
          <p className="text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="pb-3 font-medium px-2">Order ID</th>
                <th className="pb-3 font-medium px-2">Machine</th>
                <th className="pb-3 font-medium px-2">Amount</th>
                <th className="pb-3 font-medium px-2">Method</th>
                <th className="pb-3 font-medium px-2">Status</th>
                <th className="pb-3 font-medium px-2">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {data?.map((order: any) => (
                <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 px-2 font-medium text-gray-900 max-w-[120px] truncate">{getMachineName(order.machine_id)}</td>
                  <td className="py-3 px-2 font-semibold text-gray-900">Rs.{order.total_amount}</td>
                  <td className="py-3 px-2">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      order.payment_method === 'UPI'  ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                    )}>
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      order.payment_status === 'PAID'    ? 'bg-green-100 text-green-700' :
                      order.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-400 text-xs whitespace-nowrap">
                    {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
