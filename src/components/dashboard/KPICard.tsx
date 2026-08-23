'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function KPICard({ title, value, icon, trend, className }: KPICardProps) {
  return (
    <div className={clsx("bg-white p-6 rounded-xl shadow-sm border border-gray-100", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-lg">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={clsx("font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}
