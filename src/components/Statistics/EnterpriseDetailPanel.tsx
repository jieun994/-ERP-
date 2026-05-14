import React from 'react';
import { unitMeta } from './constants';
import { fmtNum, breakdownRows } from './helpers';
import type { ChannelFilter, RankingRow, Unit } from './types';

interface EnterpriseDetailPanelProps {
  selected: RankingRow | null;
  channel: ChannelFilter;
  unit: Unit;
  periodLabel: string;
}

export default function EnterpriseDetailPanel({
  selected, channel, unit, periodLabel,
}: EnterpriseDetailPanelProps) {
  return (
    <div className="bg-white border border-[#E5E8EB] rounded-lg shadow-sm overflow-hidden flex flex-col">
      {selected ? (
        <>
          <div className="px-5 py-4 border-b border-[#E5E8EB]">
            <p className="text-[15px] font-bold text-[#191F28]">{selected.name}</p>
            <p className="text-[13px] text-[#8B95A1] mt-1">{selected.tenantName}</p>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <p className="text-[12px] text-[#8B95A1]">{periodLabel} 통신</p>
              <p className="text-[20px] font-bold text-[#191F28] mt-1">
                {fmtNum(selected.total)}
                <span className="text-[12px] text-[#8B95A1] font-medium ml-1">건</span>
              </p>
              <p className="text-[12px] text-[#8B95A1] mt-1">
                <span className={selected.delta >= 0 ? 'text-[#008d75] font-semibold' : 'text-[#F04452] font-semibold'}>
                  {selected.delta >= 0 ? '+' : ''}{selected.delta.toFixed(1)}%
                </span>
                <span className="ml-1">{unitMeta[unit].deltaLabel}</span>
              </p>
            </div>

            {channel === 'ALL' && (
              <div className="border-t border-[#E5E8EB] pt-5">
                <p className="text-[13px] font-semibold text-[#191F28] mb-3">통신 유형별 비중</p>
                {breakdownRows(selected).map(item => (
                  <div key={item.key} className="flex items-center gap-3 py-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-[13px] text-[#4E5968] w-16">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-[#F2F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: item.pct + '%', background: item.color }}
                      />
                    </div>
                    <span className="text-[13px] font-mono text-[#191F28] w-12 text-right">
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 text-[#8B95A1]">
          <p className="text-[13px] text-[#4E5968]">기업을 선택해 주세요</p>
          <p className="text-[12px] mt-1">왼쪽 랭킹에서 기업을 클릭하면 상세 정보가 표시됩니다.</p>
        </div>
      )}
    </div>
  );
}
