import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Button, SearchBar, DataTable, PageLayout, Input, Select } from './ui';

interface DailyStats {
  date: string;
  van: number;
  erp: number;
  openBanking: number;
  total: number;
  enterpriseName?: string;
  tenantName?: string;
  tenantId?: string;
}

const mockStats: Record<string, DailyStats[]> = {
  'TOSS': [
    { date: '2024-05-01', van: 1200, erp: 800, openBanking: 450, total: 2450, enterpriseName: '토스페이먼츠' },
    { date: '2024-05-02', van: 1300, erp: 850, openBanking: 480, total: 2630, enterpriseName: '토스페이먼츠' },
    { date: '2024-05-03', van: 1100, erp: 790, openBanking: 420, total: 2310, enterpriseName: '토스증권' },
    { date: '2024-05-04', van: 1400, erp: 900, openBanking: 510, total: 2810, enterpriseName: '토스뱅크' },
    { date: '2024-05-05', van: 1500, erp: 950, openBanking: 550, total: 3000, enterpriseName: '토스페이먼츠' },
    { date: '2024-05-06', van: 1600, erp: 1000, openBanking: 600, total: 3200, enterpriseName: '토스뱅크' },
    { date: '2024-05-07', van: 1550, erp: 980, openBanking: 580, total: 3110, enterpriseName: '토스증권' },
  ],
  'WOOWA': [
    { date: '2024-05-01', van: 800, erp: 600, openBanking: 300, total: 1700, enterpriseName: '우아한형제들' },
    { date: '2024-05-02', van: 850, erp: 620, openBanking: 320, total: 1790, enterpriseName: '우아한청년들' },
    { date: '2024-05-03', van: 820, erp: 610, openBanking: 310, total: 1740, enterpriseName: '우아한형제들' },
    { date: '2024-05-04', van: 900, erp: 650, openBanking: 350, total: 1900, enterpriseName: '우아한청년들' },
    { date: '2024-05-05', van: 950, erp: 680, openBanking: 370, total: 2000, enterpriseName: '우아한형제들' },
    { date: '2024-05-06', van: 1000, erp: 700, openBanking: 400, total: 2100, enterpriseName: '우아한형제들' },
    { date: '2024-05-07', van: 980, erp: 690, openBanking: 390, total: 2060, enterpriseName: '배민페이' },
  ],
  'DAANGN': [
    { date: '2024-05-01', van: 500, erp: 400, openBanking: 200, total: 1100, enterpriseName: '당근페이' },
    { date: '2024-05-02', van: 520, erp: 410, openBanking: 210, total: 1140, enterpriseName: '당근마켓' },
    { date: '2024-05-03', van: 490, erp: 390, openBanking: 190, total: 1070, enterpriseName: '당근페이' },
    { date: '2024-05-04', van: 550, erp: 430, openBanking: 230, total: 1210, enterpriseName: '당근마켓' },
    { date: '2024-05-05', van: 580, erp: 450, openBanking: 250, total: 1280, enterpriseName: '당근마켓' },
    { date: '2024-05-06', van: 600, erp: 480, openBanking: 270, total: 1350, enterpriseName: '당근페이' },
    { date: '2024-05-07', van: 590, erp: 470, openBanking: 260, total: 1320, enterpriseName: '당근마켓' },
  ],
};

const tenants = [
  { id: 'TOSS', name: '토스페이먼츠' },
  { id: 'WOOWA', name: '우아한형제들' },
  { id: 'DAANGN', name: '당근마켓' },
];

const VAN_COLOR = '#008d75';
const ERP_COLOR = '#f59e0b';
const OB_COLOR  = '#3b82f6';
const PIE_COLORS = [VAN_COLOR, ERP_COLOR, OB_COLOR];

// ── formatter helpers (type-annotated outside JSX to avoid TSX parser ambiguity) ──
const fmtNumber = (v: unknown) => Number(v).toLocaleString();
const fmtBar    = (v: unknown) => [Number(v).toLocaleString(), '총 통신량'] as [string, string];

export default function Statistics() {
  const [selectedTenant, setSelectedTenant] = useState('ALL');
  const [startDate, setStartDate]           = useState('');
  const [endDate, setEndDate]               = useState('');
  const [enterpriseName, setEnterpriseName] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    tenant: 'ALL',
    startDate: '',
    endDate: '',
    enterpriseName: '',
  });

  const handleExcelDownload = () => alert('엑셀 다운로드를 실행합니다.');

  const handleSearch = () =>
    setAppliedFilters({ tenant: selectedTenant, startDate, endDate, enterpriseName });

  const handleReset = () => {
    setSelectedTenant('ALL');
    setStartDate('');
    setEndDate('');
    setEnterpriseName('');
    setAppliedFilters({ tenant: 'ALL', startDate: '', endDate: '', enterpriseName: '' });
  };

  const getAggregatedData = () => {
    const { tenant, startDate: sDate, endDate: eDate, enterpriseName: eName } = appliedFilters;

    let data = Object.entries(mockStats).flatMap(([tId, stats]) => {
      const tenantObj  = tenants.find(t => t.id === tId);
      const tenantName = tenantObj ? `${tenantObj.name} (${tId})` : tId;
      return stats.map(s => ({ ...s, tenantId: tId, tenantName }));
    });

    if (tenant !== 'ALL') data = data.filter(d => d.tenantId === tenant);
    if (eName)  data = data.filter(d => d.enterpriseName?.toLowerCase().includes(eName.toLowerCase()));
    if (sDate)  data = data.filter(d => d.date >= sDate);
    if (eDate)  data = data.filter(d => d.date <= eDate);

    data.sort((a, b) => b.date.localeCompare(a.date));
    return data;
  };

  const currentData = getAggregatedData();

  // --- summary ---
  const summary = currentData.reduce(
    (acc, curr) => {
      acc.van         += curr.van;
      acc.erp         += curr.erp;
      acc.openBanking += curr.openBanking;
      acc.total       += curr.total;
      return acc;
    },
    { van: 0, erp: 0, openBanking: 0, total: 0 },
  );

  // --- chart data ---
  const pieData = [
    { name: 'VAN사 통신',   value: summary.van },
    { name: 'ERP 통신',     value: summary.erp },
    { name: '오픈뱅킹 통신', value: summary.openBanking },
  ];

  // TOP-5 tenants
  const tenantTotals: Record<string, number> = {};
  for (const item of currentData) {
    const key = item.tenantName || item.tenantId || 'Unknown';
    tenantTotals[key] = (tenantTotals[key] ?? 0) + item.total;
  }
  const top5Tenants = Object.entries(tenantTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Daily stacked
  const dailyMap: Record<string, { date: string; van: number; erp: number; openBanking: number }> = {};
  for (const item of currentData) {
    if (!dailyMap[item.date]) {
      dailyMap[item.date] = { date: item.date, van: 0, erp: 0, openBanking: 0 };
    }
    dailyMap[item.date].van         += item.van;
    dailyMap[item.date].erp         += item.erp;
    dailyMap[item.date].openBanking += item.openBanking;
  }
  const dailyStackedData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Donut tooltip
  const donutFormatter = (value: unknown) => {
    const n   = Number(value);
    const pct = summary.total > 0 ? ((n / summary.total) * 100).toFixed(1) : '0.0';
    return [`${n.toLocaleString()} (${pct}%)`, ''];
  };

  return (
    <PageLayout bottomPadding={false}>
      <div className="space-y-6">

      {/* Search Area */}
      <SearchBar onSearch={handleSearch} onReset={handleReset}>
        <SearchBar.Field label="테넌트명">
          <Select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            style={{ width: 192 }}
          >
            <option value="ALL">전체</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
            ))}
          </Select>
        </SearchBar.Field>

        <SearchBar.Field label="기업명">
          <Input
            type="text"
            placeholder="기업명 입력"
            value={enterpriseName}
            onChange={(e) => setEnterpriseName(e.target.value)}
            style={{ width: 192 }}
          />
        </SearchBar.Field>

        <SearchBar.Field label="조회 기간">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-[#8B95A1]">~</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </SearchBar.Field>
      </SearchBar>

      {/* ============================================================
          Analytics Charts
          ============================================================ */}
      {currentData.length > 0 && (
        <div className="space-y-5">

          {/* Row 1: Donut + TOP-5 horizontal bar */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* 통신 플랫폼별 누적 비중 - Donut */}
            <div className="lg:col-span-2 bg-white border border-[#E5E8EB] rounded-md p-5 shadow-sm">
              <p className="text-[14px] font-bold text-[#191F28] mb-0.5">통신 플랫폼별 누적 비중</p>
              <p className="text-[12px] text-[#8B95A1] mb-3">
                조회 기간 내 VAN사 / ERP / 오픈뱅킹 통신량의 총합 비율
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={donutFormatter} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 주요 테넌트/기업별 통신량 TOP 5 - Horizontal Bar */}
            <div className="lg:col-span-3 bg-white border border-[#E5E8EB] rounded-md p-5 shadow-sm">
              <p className="text-[14px] font-bold text-[#191F28] mb-0.5">주요 테넌트/기업별 통신량 TOP 5</p>
              <p className="text-[12px] text-[#8B95A1] mb-3">
                시스템 트래픽 상위 테넌트 및 기업 비교
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  layout="vertical"
                  data={top5Tenants}
                  margin={{ top: 4, right: 24, bottom: 0, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={fmtNumber} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={148} />
                  <Tooltip formatter={fmtBar} />
                  <Bar dataKey="value" name="총 통신량" fill={VAN_COLOR} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Row 2: 일별 누적 통신량 추이 - Stacked Bar */}
          <div className="bg-white border border-[#E5E8EB] rounded-md p-5 shadow-sm">
            <p className="text-[14px] font-bold text-[#191F28] mb-0.5">일별 누적 통신량 추이</p>
            <p className="text-[12px] text-[#8B95A1] mb-3">
              일별 전체 처리량 규모 변화 및 플랫폼별 비중 확인
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={dailyStackedData}
                margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtNumber} />
                <Tooltip formatter={fmtNumber} />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="van"         name="VAN사 통신"   stackId="a" fill={VAN_COLOR} />
                <Bar dataKey="erp"         name="ERP 통신"     stackId="a" fill={ERP_COLOR} />
                <Bar dataKey="openBanking" name="오픈뱅킹 통신" stackId="a" fill={OB_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* Grid Controls */}
      <DataTable.Controls total={currentData.length}>
        <Button variant="ghost" size="sm" onClick={handleExcelDownload}>엑셀 다운로드</Button>
      </DataTable.Controls>

      {/* Grid */}
      <div className="bg-white border border-[#E5E8EB] rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-[#F2F4F6] shadow-[0_1px_0_0_#E5E8EB]">
              <tr className="text-[#4E5968]">
                <th className="py-3 px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB]">일자</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB]">테넌트</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB]">기업명</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-right border-r border-[#E5E8EB]">VAN사 통신</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-right border-r border-[#E5E8EB]">ERP 통신</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-right border-r border-[#E5E8EB]">오픈뱅킹 통신</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-right">합계</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-[14px]">
                    해당 조건의 통계 데이터가 없습니다.
                  </td>
                </tr>
              ) : currentData.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-4 text-center text-[13px] text-[#4E5968] font-mono border-r border-[#E5E8EB]">
                    {item.date}
                  </td>
                  <td className="py-3 px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB]">
                    {item.tenantName}
                  </td>
                  <td className="py-3 px-4 text-center text-[14px] text-[#191F28] border-r border-[#E5E8EB]">
                    {item.enterpriseName}
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] font-mono tracking-tight text-[#4E5968] border-r border-[#E5E8EB]">
                    {item.van.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] font-mono tracking-tight text-[#4E5968] border-r border-[#E5E8EB]">
                    {item.erp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] font-mono tracking-tight text-[#4E5968] border-r border-[#E5E8EB]">
                    {item.openBanking.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] font-mono tracking-tight font-bold text-[#191F28] bg-gray-50/30">
                    {item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {currentData.length > 0 && (
                <tr className="bg-[#F2F4F6] border-t border-[#D1D6DB]">
                  <td colSpan={3} className="py-3 px-4 text-center text-[14px] text-[#191F28] font-bold border-r border-[#E5E8EB]">
                    총계
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-[#191F28] border-r border-[#E5E8EB]">
                    {summary.van.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-[#191F28] border-r border-[#E5E8EB]">
                    {summary.erp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-[#191F28] border-r border-[#E5E8EB]">
                    {summary.openBanking.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-[#008d75]">
                    {summary.total.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>
    </PageLayout>
  );
}
