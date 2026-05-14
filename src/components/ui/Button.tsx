import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-primary hover:bg-primary-hover text-white shadow-sm',
  secondary: 'bg-white border border-border-input hover:bg-bg-muted text-text-main shadow-sm',
  ghost:     'bg-white border border-border-input hover:bg-bg-gray text-text-main',
  danger:         'bg-status-error hover:bg-status-error-strong text-white shadow-sm',
  'danger-outline': 'bg-white border border-status-error hover:bg-red-50 text-status-error shadow-sm',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-[32px] px-3 text-body-sm font-medium rounded-md',
  md: 'h-[40px] px-4 text-body font-semibold rounded-md',
  lg: 'h-[48px] px-6 text-body-lg font-bold rounded-md',
};

/**
 * 공통 Button 컴포넌트
 *
 * @example
 * // 조회 버튼 (검색 영역)
 * <Button variant="primary" size="lg" style={{ width: 100 }}>조회</Button>
 *
 * // 테이블 상단 등록 버튼
 * <Button variant="primary" size="sm">등록</Button>
 *
 * // 취소 버튼
 * <Button variant="secondary" size="md">취소</Button>
 *
 * // 삭제 버튼 (confirm 모달 내)
 * <Button variant="danger" size="md" fullWidth>삭제하기</Button>
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-1.5 transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
