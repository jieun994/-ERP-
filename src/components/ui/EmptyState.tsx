import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  /** 표시할 메시지 */
  message?: string;
  /** 커스텀 아이콘 (기본: Inbox) */
  icon?: React.ReactNode;
  /** colspan — DataTable 내부 <td>에 쓸 때 필요 */
  colSpan?: number;
  /** true면 <td>로 감싸서 반환 (테이블 내 사용), false면 <div> (단독 사용) */
  asTableRow?: boolean;
}

/**
 * 공통 EmptyState 컴포넌트
 *
 * @example
 * // 테이블 내부 (tbody > tr > td로 감싸서 렌더링)
 * {data.length === 0 && (
 *   <tr>
 *     <EmptyState asTableRow colSpan={6} message="조건에 맞는 결과가 없습니다." />
 *   </tr>
 * )}
 *
 * // 단독 사용
 * {data.length === 0 && (
 *   <EmptyState message="데이터가 없습니다." />
 * )}
 */
export default function EmptyState({
  message = '조회된 데이터가 없습니다.',
  icon,
  colSpan,
  asTableRow = false,
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-sub">
      <span className="text-[#D1D6DB]">
        {icon ?? <Inbox className="w-10 h-10" />}
      </span>
      <p className="text-[14px]">{message}</p>
    </div>
  );

  if (asTableRow) {
    return (
      <td colSpan={colSpan} className="text-center">
        {content}
      </td>
    );
  }

  return content;
}
