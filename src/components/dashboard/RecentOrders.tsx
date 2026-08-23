'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import clsx from 'clsx';
import { format } from 'date-fns';

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
    return m?.serialNumber || machine_id?.slice(-8).toUpperCase() || 'Unknown';
  };

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => {
      const res = await api.get('/api/admin/orders?limit=10');
      return res.data.orders;
    },
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
        Recent Orders
        <Link href="/orders" className="text-sm text-primary hover:underline font-medium">View All</Link>
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500">
              <th className="pb-3 font-medium px-2">Order ID</th>
              <th className="pb-3 font-medium px-2">Machine</th>
              <th className="pb-3 font-medium px-2">Amount</th>
              <th className="pb-3 font-medium px-2">Method</th>
              <th className="pb-3 font-medium px-2">Status</th>
              <th className="pb-3 font-medium px-2">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">Loading...</td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No recent orders</td>
              </tr>
            ) : (
              data?.map((order: any) => (
                <tr key={order._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-2 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 px-2 font-medium">{getMachineName(order.machine_id)}</td>
                  <td className="py-3 px-2 font-medium">₹{order.total_amount}</td>
                  <td className="py-3 px-2">
                    <span className={clsx(
                      "px-2 py-1 rounded text-xs font-medium",
                      order.payment_method === 'UPI' ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={clsx(
                      "px-2 py-1 rounded text-xs font-medium",
                      order.payment_status === 'PAID' ? "bg-green-100 text-green-700" :
                      order.payment_status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">
                    {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}