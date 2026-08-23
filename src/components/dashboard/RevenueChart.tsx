'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'revenue-over-time'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/revenue-over-time');
      return res.data.data;
    },
  });

  // Transform period object into readable date string
  const chartData = (data || []).map((item: any) => ({
    ...item,
    date: item.period
      ? new Date(item.period.year, (item.period.month ?? 1) - 1, item.period.day ?? 1)
          .toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      : '',
  }))

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue (Last 30 Days)</h3>
      <div className="flex-1 w-full h-full min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₹${value}`, 'Revenue']}
                labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
