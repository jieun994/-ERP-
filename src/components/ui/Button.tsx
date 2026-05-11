import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-[#008d75] hover:bg-[#007a65] text-white shadow-sm',
  secondary: 'bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] shadow-sm',
  ghost:     'bg-white border border-[#D1D6DB] hover:bg-[#F9FAFB] text-[#333333]',
  danger:    'bg-[#F04452] hover:bg-[#d93a46] text-white shadow-sm',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-[32px] px-3 text-[13px] font-medium rounded-md',
  md: 'h-[40px] px-4 text-[14px] font-semibold rounded-md',
  lg: 'h-[48px] px-6 text-[15px] font-bold rounded-md',
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
