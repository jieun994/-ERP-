import { VAN_COLOR, ERP_COLOR, OB_COLOR } from './constants';

export const fmtNum = (n: number) => n.toLocaleString('ko-KR');
export const fmtRecharts = (v: unknown) => Number(v).toLocaleString('ko-KR');

export function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export const deltaPct = (cur: number, prev: number): number =>
  prev === 0 ? 0 : ((cur - prev) / prev) * 100;

export function breakdownRows(s: { van: number; erp: number; ob: number; total: number }) {
  return [
    { key: 'van', label: 'VAN',     color: VAN_COLOR, pct: s.total === 0 ? 0 : (s.van / s.total) * 100 },
    { key: 'erp', label: 'ERP',     color: ERP_COLOR, pct: s.total === 0 ? 0 : (s.erp / s.total) * 100 },
    { key: 'ob',  label: '오픈뱅킹', color: OB_COLOR,  pct: s.total === 0 ? 0 : (s.ob  / s.total) * 100 },
  ];
}
