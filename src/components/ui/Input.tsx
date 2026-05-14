import React from 'react';

// ────────────────────────────────────────────────
// Input
// ────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  error?: boolean;
}

/**
 * 공통 Input 컴포넌트
 *
 * @example
 * <Input placeholder="기업명 입력" style={{ width: 224 }} />
 * <Input size="sm" placeholder="검색어" fullWidth />
 * <Input error placeholder="잘못된 입력" />
 */
export function Input({
  size = 'md',
  fullWidth = false,
  error = false,
  className = '',
  ...props
}: InputProps) {
  const sizeClass = size === 'sm'
    ? 'h-[36px] px-3 text-body'
    : 'h-[40px] px-4 text-body';

  const borderClass = error
    ? 'border-status-error focus:border-status-error'
    : 'border-input-border focus:border-primary';

  return (
    <input
      className={[
        'bg-white rounded-lg border transition-all text-text-main placeholder-text-sub',
        'disabled:bg-[#F2F4F6] disabled:text-[#8B95A1] disabled:cursor-not-allowed disabled:border-[#E5E8EB] disabled:select-none',
        sizeClass,
        borderClass,
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

// ────────────────────────────────────────────────
// Select
// ────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  error?: boolean;
}

/**
 * 공통 Select 컴포넌트
 *
 * @example
 * <Select style={{ width: 192 }}>
 *   <option value="all">전체</option>
 *   <option value="use">사용</option>
 * </Select>
 *
 * <Select size="sm" fullWidth>...</Select>
 */
export function Select({
  size = 'md',
  fullWidth = false,
  error = false,
  className = '',
  children,
  ...props
}: SelectProps) {
  const sizeClass = size === 'sm'
    ? 'h-[36px] px-3 text-body'
    : 'h-[40px] px-4 text-body';

  const borderClass = error
    ? 'border-status-error focus:border-status-error'
    : 'border-input-border focus:border-primary';

  return (
    <select
      className={[
        'bg-white rounded-lg border transition-all text-text-main',
        sizeClass,
        borderClass,
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </select>
  );
}

// ────────────────────────────────────────────────
// Textarea
// ────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean;
  error?: boolean;
}

/**
 * 공통 Textarea 컴포넌트
 *
 * @example
 * <Textarea rows={4} placeholder="내용을 입력하세요" fullWidth />
 */
export function Textarea({
  fullWidth = false,
  error = false,
  className = '',
  ...props
}: TextareaProps) {
  const borderClass = error
    ? 'border-status-error focus:border-status-error'
    : 'border-input-border focus:border-primary';

  return (
    <textarea
      className={[
        'bg-white rounded-lg border px-4 py-3 text-body text-text-main placeholder-text-sub transition-all resize-none',
        borderClass,
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
