import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

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
  ]
};

const tenants = [
  { id: 'TOSS', name: '토스페이먼츠' },
  { id: 'WOOWA', name: '우아한형제들' },
  { id: 'DAANGN', name: '당근마켓' }
];

const COLORS = ['#008d75', '#01ab8e', '#02c7a7'];

export default function Statistics() {
  const [selectedTenant, setSelectedTenant] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [enterpriseName, setEnterpriseName] = useState('');
  
  // For actual filtering
  const [appliedFilters, setAppliedFilters] = useState({
    tenant: 'ALL',
    startDate: '',
    endDate: '',
    enterpriseName: ''
  });

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  const handleSearch = () => {
    setAppliedFilters({
      tenant: selectedTenant,
      startDate,
      endDate,
      enterpriseName
    });
  };

  const handleReset = () => {
    setSelectedTenant('ALL');
    setStartDate('');
    setEndDate('');
    setEnterpriseName('');
    setAppliedFilters({
      tenant: 'ALL',
      startDate: '',
      endDate: '',
      enterpriseName: ''
    });
  };

  // Get aggregated or filtered data
  const getAggregatedData = () => {
    const { tenant, startDate: sDate, endDate: eDate, enterpriseName: eName } = appliedFilters;

    let data = Object.entries(mockStats).flatMap(([tId, stats]) => {
      const tenantObj = tenants.find(t => t.id === tId);
      const tenantName = tenantObj ? `${tenantObj.name} (${tId})` : tId;
      return stats.map(s => ({ ...s, tenantId: tId, tenantName }));
    });

    if (tenant !== 'ALL') {
      data = data.filter(d => d.tenantId === tenant);
    }
    
    if (eName) {
      data = data.filter(d => d.enterpriseName?.toLowerCase().includes(eName.toLowerCase()));
    }

    if (sDate) {
      data = data.filter(d => d.date >= sDate);
    }
    if (eDate) {
      data = data.filter(d => d.date <= eDate);
    }

    // Sort by date descending
    data.sort((a, b) => b.date.localeCompare(a.date));

    return data;
  };

  const currentData = getAggregatedData();

  // 누적 통계 계산
  const summary = currentData.reduce(
    (acc, curr) => {
      acc.van += curr.van;
      acc.erp += curr.erp;
      acc.openBanking += curr.openBanking;
      acc.total += curr.total;
      return acc;
    },
    { van: 0, erp: 0, openBanking: 0, total: 0 }
  );

  const pieData = [
    { name: 'VAN사 통신', value: summary.van },
    { name: 'ERP 통신', value: summary.erp },
    { name: '오픈뱅킹 통신', value: summary.openBanking },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-16 shrink-0">테넌트명</span>
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-48 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              <option value="ALL">전체</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-16 shrink-0">기업명</span>
            <input 
              type="text"
              placeholder="기업명 입력"
              value={enterpriseName}
              onChange={(e) => setEnterpriseName(e.target.value)}
              className="w-48 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">조회 기간</span>
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
              />
              <span className="text-[#8B95A1]">~</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button 
            onClick={handleSearch}
            className="w-[100px] flex-1 bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[14px] font-bold transition-all shadow-sm flex items-center justify-center"
          >
            조회
          </button>
          <button 
            onClick={handleReset}
            className="w-[100px] flex-1 bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] rounded-md text-[14px] font-bold transition-all shadow-sm flex items-center justify-center"
          >
            초기화
          </button>
        </div>
      </div>


      {/* Grid Controls (Total count and Buttons) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div className="text-[15px] font-bold">
          <span className="text-gray-800">총 </span>
          <span className="text-[#008d75]">{currentData.length.toLocaleString()}</span>
          <span className="text-gray-800">건</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExcelDownload}
            className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm">
            엑셀 다운로드
          </button>
        </div>
      </div>

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
  );
}

