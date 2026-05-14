import React from 'react';
import { fmtNum } from './helpers';

interface KpiCardProps {
  label: string;
  value: number;
  delta: number;
  comp: string;
}

export default function KpiCard({ label, value, delta, comp }: KpiCardProps) {
  const up = delta >= 0;
  return (
    <div className="bg-white border border-[#E5E8EB] rounded-lg p-5 shadow-sm">
      <p className="text-[12px] text-[#8B95A1]">{label}</p>
      <p className="text-[20px] font-bold text-[#191F28] mt-1">
        {fmtNum(value)}
        <span className="text-[12px] text-[#8B95A1] font-medium ml-1">건</span>
      </p>
      <p className="text-[12px] text-[#8B95A1] mt-1">
        <span className={up ? 'text-[#008d75] font-semibold' : 'text-[#F04452] font-semibold'}>
          {up ? '+' : ''}{delta.toFixed(1)}%
        </span>
        <span className="ml-1">{comp}</span>
      </p>
    </div>
  );
}
