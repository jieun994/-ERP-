import type { DailyStats } from './types';

export const tenants = [
  { id: 'TOSS',    name: '토스페이먼츠' },
  { id: 'WOOWA',   name: '우아한형제들' },
  { id: 'DAANGN',  name: '당근마켓' },
];

const enterprisesByTenant: Record<string, { id: string; name: string }[]> = {
  TOSS:   [
    { id: 'TP01', name: '토스페이먼츠' },
    { id: 'TS01', name: '토스증권' },
    { id: 'TB01', name: '토스뱅크' },
  ],
  WOOWA:  [
    { id: 'WB01', name: '우아한형제들' },
    { id: 'WB02', name: '우아한청년들' },
    { id: 'WB03', name: '배민페이' },
  ],
  DAANGN: [
    { id: 'DG01', name: '당근마켓' },
    { id: 'DG02', name: '당근페이' },
  ],
};

function generateMockData(): DailyStats[] {
  const out: DailyStats[] = [];
  const today = new Date('2026-05-13');
  const DAYS = 90;
  let seed = 1;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const date = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.45 : 1;
    const growth = 1 + (i / DAYS) * 0.35;

    for (const t of tenants) {
      const tenantBase = t.id === 'TOSS' ? 2400 : t.id === 'WOOWA' ? 1800 : 1100;
      const ents = enterprisesByTenant[t.id];
      for (const e of ents) {
        const entBase = tenantBase * (0.45 + rand() * 0.6);
        const dayNoise = 0.75 + rand() * 0.5;
        const factor = weekendFactor * growth * dayNoise;
        const van = Math.round(entBase * 0.55 * factor);
        const erp = Math.round(entBase * 0.30 * factor);
        const openBanking = Math.round(entBase * 0.15 * factor);
        out.push({
          date,
          van, erp, openBanking,
          total: van + erp + openBanking,
          enterpriseId: e.id,
          enterpriseName: e.name,
          tenantId: t.id,
          tenantName: `${t.name}(${t.id})`,
        });
      }
    }
  }
  return out;
}

export const ALL_DATA = generateMockData();
