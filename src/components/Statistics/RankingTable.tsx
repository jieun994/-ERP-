import React from 'react';
import { Button } from '../ui';
import SortableTh from './SortableTh';
import Pagination from './Pagination';
import { fmtNum } from './helpers';
import type { ChannelFilter, RankingRow, SortKey, SortDir, Unit } from './types';

interface RankingTableProps {
  channel: ChannelFilter;
  unit: Unit;
  periodLabel: string;
  sortedRanking: RankingRow[];
  pagedRanking: RankingRow[];
  selectedId: string | null | undefined;
  onSelect: (id: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  pageSize: number;
  onExcelDownload: () => void;
}

export default function RankingTable({
  channel, unit, periodLabel,
  sortedRanking, pagedRanking,
  selectedId, onSelect,
  sortKey, sortDir, onSort,
  page, totalPages, onPageChange, pageSize,
  onExcelDownload,
}: RankingTableProps) {
  const deltaLabel =
    unit === 'day' ? '전일 대비' : unit === 'week' ? '전주 대비' : '전월 대비';
  const colSpan = channel === 'ALL' ? 9 : 7;

  return (
    <div className="bg-white border border-[#E5E8EB] rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center px-5 py-4 border-b border-[#E5E8EB]">
        <div>
          <p className="text-[15px] font-bold text-[#191F28]">기업별 통신량</p>
          <p className="text-[13px] text-[#8B95A1] mt-1">{periodLabel} 합계</p>
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={onExcelDownload}>엑셀 다운로드</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
            <tr>
              <th className="px-4 h-[44px] text-[12px] font-semibold text-center w-14">순위</th>
              <SortableTh label="기업명"   col="name"       align="left"  sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortableTh label="테넌트"   col="tenantName" align="left"  sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              {(channel === 'ALL' || channel === 'van') && (
                <SortableTh label="VAN 통신" col="van" align="right" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              )}
              {(channel === 'ALL' || channel === 'erp') && (
                <SortableTh label="ERP 통신" col="erp" align="right" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              )}
              {(channel === 'ALL' || channel === 'ob') && (
                <SortableTh label="오픈뱅킹 통신" col="ob" align="right" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              )}
              <SortableTh label="합계"   col="total" align="right" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortableTh label="점유율" col="share" align="right" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortableTh label={deltaLabel} col="delta" align="right" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E8EB]">
            {sortedRanking.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-[#8B95A1] text-[14px]">
                  해당 조건의 통계 데이터가 없습니다.
                </td>
              </tr>
            ) : pagedRanking.map((r) => {
              const active = selectedId === r.id;
              const overallRank = sortedRanking.findIndex(x => x.id === r.id) + 1;
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className={(active ? 'bg-[#F9FAFB] ' : 'hover:bg-[#F9FAFB] ') + 'cursor-pointer transition-colors h-[52px]'}
                >
                  <td className="px-4 text-center text-[13px] text-[#4E5968]">{overallRank}</td>
                  <td className="px-4 text-[13px] font-medium text-[#191F28]">{r.name}</td>
                  <td className="px-4 text-[13px] text-[#4E5968]">{r.tenantName}</td>
                  {(channel === 'ALL' || channel === 'van') && (
                    <td className="px-4 text-[13px] text-right font-mono text-[#4E5968]">{fmtNum(r.van)}</td>
                  )}
                  {(channel === 'ALL' || channel === 'erp') && (
                    <td className="px-4 text-[13px] text-right font-mono text-[#4E5968]">{fmtNum(r.erp)}</td>
                  )}
                  {(channel === 'ALL' || channel === 'ob') && (
                    <td className="px-4 text-[13px] text-right font-mono text-[#4E5968]">{fmtNum(r.ob)}</td>
                  )}
                  <td className="px-4 text-[13px] text-right font-mono font-bold text-[#191F28]">{fmtNum(r.total)}</td>
                  <td className="px-4 text-[13px] text-right font-mono text-[#4E5968]">{r.share.toFixed(1)}%</td>
                  <td className={'px-4 text-[13px] text-right font-mono ' + (r.delta >= 0 ? 'text-[#008d75]' : 'text-[#F04452]')}>
                    {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedRanking.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={sortedRanking.length}
          pageSize={pageSize}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
