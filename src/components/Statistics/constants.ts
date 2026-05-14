import type { Unit, ChannelFilter } from './types';

// 브랜드 컬러(#008d75) 기반 단색 톤 — 명도 차로 3개 채널 구분
export const VAN_COLOR = '#008d75'; // primary teal
export const ERP_COLOR = '#5BB8A4'; // mid teal
export const OB_COLOR  = '#B7E0D4'; // light teal

export const unitMeta: Record<Unit, {
  label: string;
  window: number;
  periodLabel: (n: number) => string;
  deltaLabel: string;
}> = {
  day:   { label: '일별', window: 14, periodLabel: (n) => `최근 ${n}일`,   deltaLabel: '직전 동기간 대비' },
  week:  { label: '주별', window: 8,  periodLabel: (n) => `최근 ${n}주`,   deltaLabel: '직전 동기간 대비' },
  month: { label: '월별', window: 6,  periodLabel: (n) => `최근 ${n}개월`, deltaLabel: '전년 동기간 대비' },
};

export const PAGE_SIZE = 10;

export const channelLabel = (c: ChannelFilter): string =>
  c === 'ALL' ? '전체' : c === 'van' ? 'VAN' : c === 'erp' ? 'ERP' : '오픈뱅킹';

export const channelColor = (c: 'van' | 'erp' | 'ob'): string =>
  c === 'van' ? VAN_COLOR : c === 'erp' ? ERP_COLOR : OB_COLOR;
