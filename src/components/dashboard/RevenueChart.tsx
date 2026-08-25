'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const GROUP_OPTIONS = [
  { label: 'Daily',   value: 'day' },
  { label: 'Weekly',  value: 'week' },
  { label: 'Monthly', value: 'month' },
];

export default function RevenueChart() {
  const [groupBy, setGroupBy] = useState('day');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'revenue-over-time', groupBy],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/revenue-over-time?group_by=' + groupBy);
      return res.data.data;
    },
  });

  const chartData = (data || []).map((item: any) => ({
    ...item,
    date: item.period
      ? groupBy === 'week'
        ? 'Wk ' + item.period.week + ' ' + item.period.year
        : groupBy === 'month'
        ? new Date(item.period.year, (item.period.month ?? 1) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        : new Date(item.period.year, (item.period.month ?? 1) - 1, item.period.day ?? 1)
            .toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      : '',
  }));

  const totalRevenue = chartData.reduce((sum: number, d: any) => sum + (d.revenue || 0), 0);
  const totalOrders  = chartData.reduce((sum: number, d: any) => sum + (d.order_count || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-start justify-between mb-4 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue Over Time</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-800">Rs.{totalRevenue}</span>
            </span>
            <span className="text-sm text-gray-500">
              Orders: <span className="font-semibold text-gray-800">{totalOrders}</span>
            </span>
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {GROUP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value)}
              className={'px-3 py-1 text-xs font-medium rounded-md transition-colors ' + (groupBy === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
        ) : !chartData.length ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm">No revenue data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => 'Rs.' + v} width={55} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.12)', fontSize: '13px' }}
                formatter={(value: number, name: string) => [name === 'revenue' ? 'Rs.' + value : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
