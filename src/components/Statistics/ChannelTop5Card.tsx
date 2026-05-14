import React from 'react';
import { fmtNum } from './helpers';
import type { ChannelTop5Row } from './types';

interface ChannelTop5CardProps {
  title: string;
  color: string;
  rows: ChannelTop5Row[];
}

export default function ChannelTop5Card({ title, color, rows }: ChannelTop5CardProps) {
  return (
    <div className="bg-white border border-[#E5E8EB] rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-[#E5E8EB] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <p className="text-[15px] font-bold text-[#191F28]">{title}</p>
      </div>
      <div className="px-5 py-2">
        {rows.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[#8B95A1]">데이터가 없습니다.</div>
        ) : rows.map((r, i) => (
          <div key={r.id} className="flex items-center py-3 border-b border-[#F2F4F6] last:border-b-0">
            <span className="text-[13px] text-[#8B95A1] w-5 text-center">{i + 1}</span>
            <span className="text-[13px] font-medium text-[#191F28] flex-1 ml-2 truncate">{r.name}</span>
            <span className="text-[13px] font-mono text-[#191F28] ml-3">{fmtNum(r.value)}</span>
            <span className="text-[12px] font-mono text-[#8B95A1] ml-2 w-14 text-right">{r.share.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
