import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  /**
   * 하단 여백 — 고정 하단 바(버튼 등)가 있는 페이지는 true (기본값)
   * 없는 페이지(Statistics 등)는 false
   */
  bottomPadding?: boolean;
  className?: string;
}

/**
 * 공통 PageLayout 컴포넌트
 * 각 페이지의 최상단 wrapper를 통일
 *
 * @example
 * // 일반 페이지
 * export default function NoticeManagement() {
 *   return (
 *     <PageLayout>
 *       <SearchBar ...>...</SearchBar>
 *       <DataTable .../>
 *     </PageLayout>
 *   );
 * }
 *
 * // 하단 여백 없는 페이지 (Statistics 등)
 * <PageLayout bottomPadding={false}>...</PageLayout>
 */
export default function PageLayout({
  children,
  bottomPadding = true,
  className = '',
}: PageLayoutProps) {
  return (
    <div
      className={[
        'w-full',
        bottomPadding ? 'pb-20' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
