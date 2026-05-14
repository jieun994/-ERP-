import React, { useState } from 'react';
import { Info, Calendar } from 'lucide-react';
import Button from './Button';
import { Input } from './Input';

/* ------------------------------------------------------------------ */
/*  FilterBar - 그리드 기반 검색조건 영역                                */
/*                                                                     */
/*  - 기존 SearchBar(flex-wrap)와 달리 CSS Grid로 라벨/입력이 칼같이     */
/*    정렬됩니다. 두 번째 이미지(결제상태/입금은행/실행일) 디자인 기준.   */
/*  - 화면별로 점진 교체. 기존 SearchBar는 그대로 둡니다.               */
/* ------------------------------------------------------------------ */

type Cols = 2 | 3 | 4;

interface FilterBarProps {
  /** 그리드 컬럼 수. 기본 3 */
  cols?: Cols;
  /** 조회 버튼 클릭 */
  onSearch?: () => void;
  /** 초기화 버튼 클릭 */
  onReset?: () => void;
  /** 우측 조회/초기화 버튼 숨기기 */
  hideActions?: boolean;
  children: React.ReactNode;
}

const COLS_CLASS: Record<Cols, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

/**
 * 공통 FilterBar (검색조건 영역)
 *
 * @example
 *   <FilterBar cols={3} onSearch={...} onReset={...}>
 *     <FilterBar.DateRange
 *       label="실행일"
 *       startDate={start}
 *       endDate={end}
 *       onChange={(s, e) => { setStart(s); setEnd(e); }}
 *       colSpan={2}
 *     />
 *     <FilterBar.Field label="결제상태">
 *       <Select ...>...</Select>
 *     </FilterBar.Field>
 *     <FilterBar.Field label="계좌번호" hint="'-' 제외, 숫자만 입력">
 *       <Input placeholder="..." />
 *     </FilterBar.Field>
 *   </FilterBar>
 */
function FilterBar({
  cols = 3,
  onSearch,
  onReset,
  hideActions = false,
  children,
}: FilterBarProps) {
  return (
    <div className="flex items-stretch gap-3 mb-8">
      {/* 조건 영역 - 그리드 */}
      <div
        className={[
          'flex-1 bg-bg-gray border border-border-gray px-8 py-5 rounded-md shadow-sm',
          'grid gap-x-10 gap-y-4 items-center',
          COLS_CLASS[cols],
        ].join(' ')}
      >
        {children}
      </div>

      {/* 우측 액션 버튼 */}
      {!hideActions && (
        <div className="flex flex-col gap-2 shrink-0">
          <Button variant="primary" size="lg" style={{ width: 100 }} onClick={onSearch}>
            조회
          </Button>
          <Button variant="secondary" size="lg" style={{ width: 100 }} onClick={onReset}>
            초기화
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FilterBar.Field - 라벨 + 입력 슬롯                                  */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  /** ⓘ 아이콘 hover 시 노출되는 도움말 */
  hint?: string;
  /** 그리드 가로 칸 차지 수 (기본 1) */
  colSpan?: 1 | 2 | 3 | 4;
  /** 라벨 너비 (px). 기본 72 */
  labelWidth?: number;
  children: React.ReactNode;
}

const SPAN_CLASS: Record<NonNullable<FieldProps['colSpan']>, string> = {
  1: '',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
};

function Field({
  label,
  hint,
  colSpan = 1,
  labelWidth = 72,
  children,
}: FieldProps) {
  return (
    <div className={['flex items-center gap-4 min-w-0', SPAN_CLASS[colSpan]].join(' ')}>
      <span
        className="text-body font-bold text-text-main shrink-0 inline-flex items-center gap-1"
        style={{ width: labelWidth }}
      >
        {label}
        {hint && (
          <span
            title={hint}
            className="text-text-sub cursor-help inline-flex items-center"
            aria-label={hint}
          >
            <Info size={14} />
          </span>
        )}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FilterBar.DateRange - 날짜 범위 + 당일/7일/15일/30일                 */
/* ------------------------------------------------------------------ */

interface DateRangeProps {
  label?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  /** 라벨 너비 (px). 기본 72 */
  labelWidth?: number;
  /** 그리드 가로 칸 차지 수 (기본 2 - 날짜 범위는 보통 2칸) */
  colSpan?: 1 | 2 | 3 | 4;
  /** 빠른 선택 버튼 옵션 */
  quickRanges?: Array<{ label: string; days: number }>;
  /** 빠른 선택 버튼 숨기기 */
  hideQuickRanges?: boolean;
}

const DEFAULT_QUICK_RANGES = [
  { label: '당일', days: 0 },
  { label: '7일', days: 7 },
  { label: '15일', days: 15 },
  { label: '30일', days: 30 },
];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function DateRange({
  label = '조회 기간',
  startDate,
  endDate,
  onChange,
  labelWidth = 72,
  colSpan = 2,
  quickRanges = DEFAULT_QUICK_RANGES,
  hideQuickRanges = false,
}: DateRangeProps) {
  const [activeQuick, setActiveQuick] = useState<string | null>(null);

  const applyQuick = (days: number, key: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onChange(toISODate(start), toISODate(end));
    setActiveQuick(key);
  };

  const handleManual = (which: 'start' | 'end', value: string) => {
    setActiveQuick(null);
    if (which === 'start') onChange(value, endDate);
    else onChange(startDate, value);
  };

  return (
    <div className={['flex items-center gap-4 min-w-0', SPAN_CLASS[colSpan]].join(' ')}>
      <span
        className="text-body font-bold text-text-main shrink-0 inline-flex items-center gap-1"
        style={{ width: labelWidth }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => handleManual('start', e.target.value)}
            style={{ width: 160 }}
          />
        </div>
        <span className="text-text-sub">~</span>
        <div className="relative">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => handleManual('end', e.target.value)}
            style={{ width: 160 }}
          />
        </div>

        {!hideQuickRanges && (
          <div className="flex items-center gap-1 ml-2">
            {quickRanges.map((r) => {
              const active = activeQuick === r.label;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => applyQuick(r.days, r.label)}
                  className={[
                    'h-[32px] px-3 text-body-sm font-medium rounded-md border transition-colors',
                    active
                      ? 'border-primary text-primary bg-white'
                      : 'border-input-border text-text-main bg-white hover:border-primary hover:text-primary',
                  ].join(' ')}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  static 메서드로 attach                                              */
/* ------------------------------------------------------------------ */

FilterBar.Field = Field;
FilterBar.DateRange = DateRange;

export default FilterBar;
export { Field as FilterField, DateRange as DateRangeField };
