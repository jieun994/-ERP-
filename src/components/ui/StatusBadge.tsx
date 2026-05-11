import React from 'react';

// ────────────────────────────────────────────────
// 프리셋 스타일 맵
// ────────────────────────────────────────────────
const PRESET: Record<string, string> = {
  // 사용여부
  'ON':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'OFF':  'bg-gray-100 text-gray-500 border border-gray-200',

  // 퍼블리싱 현황
  '완료':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '진행중': 'bg-blue-50 text-blue-700 border border-blue-200',
  '대기':   'bg-gray-100 text-gray-500 border border-gray-200',

  // 노출여부
  '노출':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '미노출': 'bg-gray-100 text-gray-500 border border-gray-200',

  // 성공/실패
  '성공':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '실패':   'bg-red-50 text-red-600 border border-red-200',
  '처리중': 'bg-blue-50 text-blue-700 border border-blue-200',
};

const FALLBACK = 'bg-gray-100 text-gray-500 border border-gray-200';

interface StatusBadgeProps {
  status: string;
  /** 커스텀 색상 클래스 (프리셋에 없는 상태값에 직접 지정) */
  colorClass?: string;
}

/**
 * 공통 StatusBadge 컴포넌트
 * 프리셋에 없는 값은 FALLBACK(회색) 스타일 적용, colorClass로 오버라이드 가능
 *
 * @example
 * <StatusBadge status="ON" />
 * <StatusBadge status="완료" />
 * <StatusBadge status="진행중" />
 * <StatusBadge status="커스텀" colorClass="bg-purple-50 text-purple-700 border border-purple-200" />
 */
export default function StatusBadge({ status, colorClass }: StatusBadgeProps) {
  const cls = colorClass ?? PRESET[status] ?? FALLBACK;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}
