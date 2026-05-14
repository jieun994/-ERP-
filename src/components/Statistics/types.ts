// 통신 통계 화면 — 공통 타입

export interface DailyStats {
  date: string;
  van: number;
  erp: number;
  openBanking: number;
  total: number;
  enterpriseId: string;
  enterpriseName: string;
  tenantId: string;
  tenantName: string;
}

export type Unit = 'day' | 'week' | 'month';

export type ChannelFilter = 'ALL' | 'van' | 'erp' | 'ob';

export type SortKey =
  | 'name'
  | 'tenantName'
  | 'van'
  | 'erp'
  | 'ob'
  | 'total'
  | 'share'
  | 'delta';

export type SortDir = 'asc' | 'desc';

export interface RankingRow {
  id: string;
  name: string;
  tenantName: string;
  van: number;
  erp: number;
  ob: number;
  total: number;
  share: number;
  intensity: number;
  prevTotal: number;
  delta: number;
}

export interface BucketRow {
  key: string;
  van: number;
  erp: number;
  openBanking: number;
  total: number;
}

export interface ChartRow {
  label: string;
  van: number;
  erp: number;
  openBanking: number;
  total: number;
}

export interface ChannelTop5Row {
  id: string;
  name: string;
  value: number;
  share: number;
}
