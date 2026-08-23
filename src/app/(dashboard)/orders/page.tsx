'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      const res = await api.get('/api/admin/orders'); 
      return res.data.orders;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading orders...</div>
        ) : orders?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-6 font-medium">Order ID</th>
                  <th className="py-3 px-6 font-medium">Machine</th>
                  <th className="py-3 px-6 font-medium">Items</th>
                  <th className="py-3 px-6 font-medium">Amount</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                  <th className="py-3 px-6 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {orders?.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-4 px-6 font-medium text-primary hover:underline cursor-pointer">
                      {order.machine_id}
                    </td>
                    <td className="py-4 px-6">
                      {order.items?.length || 0} items
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">₹{order.total_amount}</td>
                    <td className="py-4 px-6">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        order.payment_status === 'PAID' ? "bg-green-100 text-green-700" :
                        order.payment_status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
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

