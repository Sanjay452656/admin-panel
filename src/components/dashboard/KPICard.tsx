'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  prefix?: string;
  color?: 'indigo' | 'green' | 'amber' | 'blue' | 'red';
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green:  'bg-green-50 text-green-600',
  amber:  'bg-amber-50 text-amber-600',
  blue:   'bg-blue-50 text-blue-600',
  red:    'bg-red-50 text-red-600',
};

export default function KPICard({ title, value, icon, prefix, color = 'indigo', subtitle, trend, className }: KPICardProps) {
  return (
    <div className={clsx('bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1 truncate">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 truncate">
            {prefix && <span className="text-xl">{prefix}</span>}{value}
          </h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('p-3 rounded-xl shrink-0 ml-3', colorMap[color])}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={clsx('font-medium', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-gray-400 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}
