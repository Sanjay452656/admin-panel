'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Building2, Users, TrendingUp, ChevronDown, ChevronUp, X, ShoppingCart, IndianRupee, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts';

export default function CompaniesPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <CompaniesContent />
    </ProtectedRoute>
  );
}

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-600',
  PRO: 'bg-blue-100 text-blue-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
};
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Mini analytics panel loaded per company ───
function CompanyAnalyticsPanel({ company }: { company: any }) {
  const cid = company._id;

  const { data: summary, isLoading: ls } = useQuery({
    queryKey: ['company-summary', cid],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/summary?company_id=' + cid);
      return res.data.data;
    },
  });

  const { data: revenueOverTime, isLoading: lt } = useQuery({
    queryKey: ['company-revenue-time', cid],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/revenue-over-time?company_id=' + cid + '&group_by=day');
      return res.data.data || [];
    },
  });

  const { data: topProducts, isLoading: lp } = useQuery({
    queryKey: ['company-top-products', cid],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/top-products?company_id=' + cid + '&limit=5');
      return res.data.data || [];
    },
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['company-payment-methods', cid],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/payment-methods?company_id=' + cid);
      return res.data.data || [];
    },
  });

  const chartData = (revenueOverTime || []).map((item: any) => ({
    date: item.period
      ? new Date(item.period.year, (item.period.month ?? 1) - 1, item.period.day ?? 1)
          .toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      : '',
    revenue: item.revenue,
  }));

  return (
    <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
      {/* Company Name header */}
      <div className="mb-4 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-gray-700">{company.company_name} — Analytics</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Revenue',    value: ls ? '...' : 'Rs.' + (summary?.total_revenue ?? 0),    icon: <IndianRupee className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Orders',     value: ls ? '...' : (summary?.total_orders ?? 0),              icon: <ShoppingCart className="w-4 h-4" />, color: 'text-green-600 bg-green-50' },
          { label: 'Paid Orders',      value: ls ? '...' : (summary?.paid_orders ?? 0),               icon: <TrendingUp className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Avg Order Value',  value: ls ? '...' : 'Rs.' + Number(summary?.avg_order_value ?? 0).toFixed(2), icon: <BarChart2 className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={'p-2 rounded-lg ' + k.color}>{k.icon}</div>
            <div>
              <div className="text-xs text-gray-400">{k.label}</div>
              <div className="text-base font-bold text-gray-900">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Over Time */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Revenue Over Time</h4>
          {lt ? (
            <div className="h-36 flex items-center justify-center text-gray-300 text-sm">Loading...</div>
          ) : !chartData.length ? (
            <div className="h-36 flex items-center justify-center text-gray-300 text-sm">No revenue data</div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={'grad-' + cid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'Rs.' + v} width={45} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)', fontSize: 12 }}
                  formatter={(v: any) => ['Rs.' + v, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill={'url(#grad-' + cid + ')'} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products + Payment Methods */}
        <div className="space-y-4">
          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Products</h4>
            {lp ? (
              <div className="text-xs text-gray-300 py-2">Loading...</div>
            ) : !topProducts?.length ? (
              <div className="text-xs text-gray-400 py-2">No product sales yet</div>
            ) : (
              <div className="space-y-1.5">
                {topProducts.slice(0, 4).map((p: any, i: number) => (
                  <div key={p.product_id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                        {i + 1}
                      </span>
                      <span className="text-gray-700 truncate">{p.product_name}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-semibold text-gray-900">Rs.{p.total_revenue}</span>
                      <span className="text-gray-400 text-xs ml-1">× {p.total_quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Methods</h4>
            {!paymentMethods?.length ? (
              <div className="text-xs text-gray-400 py-2">No payment data</div>
            ) : (
              <div className="space-y-1.5">
                {paymentMethods.map((m: any, i: number) => {
                  const total = paymentMethods.reduce((s: number, x: any) => s + x.total_revenue, 0);
                  const pct   = total > 0 ? Math.round((m.total_revenue / total) * 100) : 0;
                  return (
                    <div key={m.method} className="flex items-center gap-2">
                      <span className="w-16 text-xs font-medium text-gray-700">{m.method}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: pct + '%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right">Rs.{m.total_revenue} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
function CompaniesContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/api/admin/companies');
      return res.data.data as any[];
    },
  });

  const { data: revenueByCompany, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['analytics', 'revenue-by-company'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/revenue-by-company');
      return res.data.data as any[];
    },
  });

  const revenueMap = Object.fromEntries(
    (revenueByCompany || []).map((r: any) => [String(r.company_id), r])
  );

  const totalRevenue = (revenueByCompany || []).reduce((s: number, r: any) => s + r.total_revenue, 0);
  const totalOrders  = (revenueByCompany || []).reduce((s: number, r: any) => s + r.total_orders, 0);

  const chartData = (revenueByCompany || []).map((r: any) => ({
    name: r.company_name, revenue: r.total_revenue, orders: r.total_orders,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-1">Click any company to view its analytics</p>
        </div>
        <Link 
          href="/companies/new"
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="font-bold mr-2">+</span>
          Add Company
        </Link>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50"><Building2 className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{isLoading ? '-' : companies?.length ?? 0}</div>
            <div className="text-sm text-gray-500">Total Companies</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50"><TrendingUp className="w-6 h-6 text-green-600" /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Rs.{isLoadingRevenue ? '-' : totalRevenue}</div>
            <div className="text-sm text-gray-500">Platform Revenue</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50"><Users className="w-6 h-6 text-amber-600" /></div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{isLoadingRevenue ? '-' : totalOrders}</div>
            <div className="text-sm text-gray-500">Platform Orders</div>
          </div>
        </div>
      </div>

      {/* Companies Table with drill-down */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <th className="py-3 px-6 font-medium">Company</th>
              <th className="py-3 px-6 font-medium">Plan</th>
              <th className="py-3 px-6 font-medium">Users</th>
              <th className="py-3 px-6 font-medium">Revenue</th>
              <th className="py-3 px-6 font-medium">Orders</th>
              <th className="py-3 px-6 font-medium">Status</th>
              <th className="py-3 px-6 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading companies...</td></tr>
            ) : companies?.map((c: any, idx: number) => {
              const rev        = revenueMap[String(c._id)];
              const isExpanded = selectedId === c._id;
              return (
                <React.Fragment key={c._id}>
                  <tr
                    className={'cursor-pointer transition-colors ' + (isExpanded ? 'bg-indigo-50/60' : 'hover:bg-gray-50')}
                    onClick={() => setSelectedId(isExpanded ? null : c._id)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        >
                          {c.company_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{c.company_name}</div>
                          <div className="text-xs text-gray-400">{c.contact_email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={'px-2 py-0.5 rounded-full text-xs font-semibold ' + (PLAN_COLORS[c.plan] || PLAN_COLORS.FREE)}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{c.user_count ?? 0}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {rev ? 'Rs.' + rev.total_revenue : <span className="text-gray-400 font-normal text-xs">No sales</span>}
                    </td>
                    <td className="py-4 px-6 text-gray-700">{rev?.total_orders ?? 0}</td>
                    <td className="py-4 px-6">
                      <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + (c.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {c.is_active !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-indigo-500" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </td>
                  </tr>

                  {/* Drill-down analytics panel */}
                  {isExpanded && (
                    <tr key={c._id + '-analytics'}>
                      <td colSpan={7} className="p-0">
                        <CompanyAnalyticsPanel company={c} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}



