'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function AnalyticsContent() {
  const { data: machinesList } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const res = await api.get('/api/admin/machines');
      return res.data.data;
    },
  });

  const { data: revenueByMachineRaw, isLoading: isLoadingMachines } = useQuery({
    queryKey: ['analytics', 'revenue-by-machine'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/revenue-by-machine');
      return res.data.data;
    },
  });

  // Enrich machine_id with serial number for readable chart labels
  const revenueByMachine = (revenueByMachineRaw || []).map((item: any) => {
    const machine = (machinesList || []).find((m: any) => m._id === item.machine_id);
    return { ...item, machine_label: machine?.serialNumber || item.machine_id };
  });

  const { data: topProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['analytics', 'top-products'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/top-products');
      return res.data.data;
    },
  });

  const { data: paymentMethods, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['analytics', 'payment-methods'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/payment-methods');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>

      <div className="grid grid-cols-1 gap-6">
        <RevenueChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Machines */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Machine</h3>
          <div className="flex-1 min-h-0">
            {isLoadingMachines ? (
              <div className="flex items-center justify-center h-full">Loading...</div>
            ) : !revenueByMachine?.length ? (
              <div className="flex items-center justify-center h-full text-gray-400">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMachine} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis dataKey="machine_label" type="category" width={100} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                  />
                  <Bar dataKey="total_revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="flex-1 min-h-0">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center h-full">Loading...</div>
            ) : !topProducts?.length ? (
              <div className="flex items-center justify-center h-full text-gray-400">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis dataKey="product_name" type="category" width={110} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [value, name === 'total_revenue' ? 'Revenue (₹)' : 'Qty Sold']}
                  />
                  <Bar dataKey="total_quantity" name="total_quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
          {isLoadingPayments ? (
            <div className="py-8 text-center text-gray-400">Loading...</div>
          ) : !paymentMethods?.length ? (
            <div className="py-8 text-center text-gray-400">No data yet</div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    dataKey="total_revenue"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ method, total_revenue }) => `${method}: ₹${total_revenue}`}
                  >
                    {paymentMethods.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`₹${value}`, 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {paymentMethods?.map((item: any, idx: number) => (
              <div key={item.method} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium text-gray-700">{item.method}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {item.total_orders} orders &bull; <span className="font-semibold text-gray-800">₹{item.total_revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products by Revenue</h3>
          {isLoadingProducts ? (
            <div className="py-8 text-center text-gray-400">Loading...</div>
          ) : !topProducts?.length ? (
            <div className="py-8 text-center text-gray-400">No data yet</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Orders</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts?.map((item: any) => (
                  <tr key={item.product_id} className="hover:bg-gray-50">
                    <td className="py-2 font-medium text-gray-900">{item.product_name}</td>
                    <td className="py-2 text-right text-gray-600">{item.total_quantity}</td>
                    <td className="py-2 text-right text-gray-600">{item.times_ordered}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">₹{item.total_revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
