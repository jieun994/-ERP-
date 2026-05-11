import React from 'react';

type CardVariant = 'default' | 'accent';

interface SectionCardProps {
  children: React.ReactNode;
  /**
   * default : 일반 흰 배경 카드
   * accent  : 상단에 primary 컬러 border가 있는 카드 (강조 섹션)
   */
  variant?: CardVariant;
  className?: string;
  /** 내부 패딩 (기본 p-6) */
  padding?: string;
}

/**
 * 공통 SectionCard 컴포넌트
 * 흰 배경 + border + 그림자 카드 박스를 통일
 *
 * @example
 * // 일반 카드
 * <SectionCard>
 *   <p>내용</p>
 * </SectionCard>
 *
 * // 강조 카드 (상단 primary 라인)
 * <SectionCard variant="accent" padding="p-8">
 *   <h2>섹션 제목</h2>
 * </SectionCard>
 */
export default function SectionCard({
  children,
  variant = 'default',
  className = '',
  padding = 'p-6',
}: SectionCardProps) {
  const base = 'bg-white rounded-xl border border-border-gray shadow-sm';
  const accent = variant === 'accent' ? 'border-t-4 border-t-primary' : '';

  return (
    <div className={[base, accent, padding, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
