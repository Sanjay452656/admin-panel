'use client';

import clsx from 'clsx';

interface TankLevelBarProps {
  name: string;
  level: number;
}

export default function TankLevelBar({ name, level }: TankLevelBarProps) {
  const getColor = (val: number) => {
    if (val < 15) return 'bg-red-500';
    if (val < 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const color = getColor(level);

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{name}</span>
        <span className={clsx("font-bold", level < 15 ? "text-red-600" : level < 30 ? "text-yellow-600" : "text-gray-700")}>
          {level}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={clsx("h-2.5 rounded-full transition-all duration-500 ease-in-out", color)} 
          style={{ width: `${Math.min(100, Math.max(0, level))}%` }}
        ></div>
      </div>
    </div>
  );
}
