import React from 'react';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
export interface Column<T = Record<string, unknown>> {
  key: string;
  label: React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  emptyText?: string;
  /** 체크박스 전체선택 (thead에 렌더링할 노드) */
  selectAll?: React.ReactNode;
  className?: string;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
/**
 * 공통 DataTable 컴포넌트
 * thead/tbody 스타일, 빈 상태, 컬럼 정렬을 일괄 관리
 *
 * @example
 * const columns: Column<Notice>[] = [
 *   { key: 'no',    label: 'No.',   width: 64,  align: 'center' },
 *   { key: 'title', label: '제목',              align: 'left'   },
 *   { key: 'used',  label: '사용여부', width: 96, align: 'center',
 *     render: (v) => <StatusBadge status={v ? 'ON' : 'OFF'} /> },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={filteredData}
 *   rowKey={(r) => r.id}
 *   emptyText="조건에 맞는 결과가 없습니다."
 * />
 */
export default function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  rowKey,
  emptyText = '조회된 데이터가 없습니다.',
  selectAll,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-border-gray overflow-hidden shadow-sm ${className}`}>
      <table className="w-full text-[14px] text-text-main border-collapse">
        {/* ── thead ── */}
        <thead>
          <tr className="bg-table-head border-b border-border-gray">
            {selectAll !== undefined && (
              <th className="h-[52px] px-4 text-center w-12 border-r border-border-gray">
                {selectAll}
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className="h-[52px] px-4 font-semibold text-[#4E5968] border-r border-border-gray last:border-r-0"
                style={{
                  width: col.width,
                  textAlign: col.align ?? 'center',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── tbody ── */}
        <tbody className="divide-y divide-border-gray">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectAll !== undefined ? 1 : 0)}
                className="py-20 text-center text-text-sub text-[14px]"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className="hover:bg-[#FAFBFC] transition-colors"
              >
                {selectAll !== undefined && (
                  <td className="px-4 py-3 text-center border-r border-border-gray">
                    {/* 체크박스는 각 페이지에서 render prop으로 처리 */}
                  </td>
                )}
                {columns.map((col) => {
                  const value = (row as Record<string, unknown>)[col.key];
                  return (
                    <td
                      key={col.key}
                      className="px-4 py-3"
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {col.render ? col.render(value, row, index) : (value as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────
// TableControls — 테이블 상단 "총 N건 + 버튼" 행
// ────────────────────────────────────────────────
interface TableControlsProps {
  total: number;
  children?: React.ReactNode; // 등록/수정/삭제 버튼 등
}

/**
 * 테이블 상단 컨트롤 바 (총 건수 + 액션 버튼)
 *
 * @example
 * <DataTable.Controls total={filteredData.length}>
 *   <Button variant="primary" size="sm">등록</Button>
 *   <Button variant="ghost"   size="sm" disabled={selectedIds.length !== 1}>수정</Button>
 *   <Button variant="ghost"   size="sm" disabled={selectedIds.length === 0}>삭제</Button>
 * </DataTable.Controls>
 */
function Controls({ total, children }: TableControlsProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-[14px]">
        <span className="text-[#4E5968]">총 </span>
        <span className="text-primary font-bold">{total.toLocaleString()}</span>
        <span className="text-[#4E5968]"> 건</span>
      </p>
      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}

DataTable.Controls = Controls;
