import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const WINDOW = 5;
  let from = Math.max(1, page - Math.floor(WINDOW / 2));
  const to = Math.min(totalPages, from + WINDOW - 1);
  from = Math.max(1, to - WINDOW + 1);
  const pages: number[] = [];
  for (let i = from; i <= to; i++) pages.push(i);

  const btn = 'min-w-[28px] h-[28px] px-2 text-[12px] rounded border transition-colors';
  const idle = 'border-[#E5E8EB] text-[#4E5968] bg-white hover:bg-[#F9FAFB]';
  const active = 'border-[#008d75] text-white bg-[#008d75] font-semibold';
  const disabled = 'border-[#E5E8EB] text-[#CBD5E1] bg-white cursor-not-allowed';

  return (
    <div className="flex items-center px-5 py-3 border-t border-[#E5E8EB]">
      <div className="text-[12px] text-[#8B95A1]">
        총 <span className="font-semibold text-[#191F28]">{total.toLocaleString('ko-KR')}</span>건 중{' '}
        {start.toLocaleString('ko-KR')}–{end.toLocaleString('ko-KR')}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(1)}
          disabled={page === 1}
          className={btn + ' ' + (page === 1 ? disabled : idle)}
        >«</button>
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={btn + ' ' + (page === 1 ? disabled : idle)}
        >‹</button>
        {pages.map(pn => (
          <button
            key={pn}
            type="button"
            onClick={() => onChange(pn)}
            className={btn + ' ' + (pn === page ? active : idle)}
          >{pn}</button>
        ))}
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={btn + ' ' + (page === totalPages ? disabled : idle)}
        >›</button>
        <button
          type="button"
          onClick={() => onChange(totalPages)}
          disabled={page === totalPages}
          className={btn + ' ' + (page === totalPages ? disabled : idle)}
        >»</button>
      </div>
    </div>
  );
}
