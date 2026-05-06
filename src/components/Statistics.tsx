import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DailyStats {
  date: string;
  van: number;
  erp: number;
  openBanking: number;
  total: number;
}

const mockStats: Record<string, DailyStats[]> = {
  'TOSS': [
    { date: '2024-05-01', van: 1200, erp: 800, openBanking: 450, total: 2450 },
    { date: '2024-05-02', van: 1300, erp: 850, openBanking: 480, total: 2630 },
    { date: '2024-05-03', van: 1100, erp: 790, openBanking: 420, total: 2310 },
    { date: '2024-05-04', van: 1400, erp: 900, openBanking: 510, total: 2810 },
    { date: '2024-05-05', van: 1500, erp: 950, openBanking: 550, total: 3000 },
    { date: '2024-05-06', van: 1600, erp: 1000, openBanking: 600, total: 3200 },
    { date: '2024-05-07', van: 1550, erp: 980, openBanking: 580, total: 3110 },
  ],
  'WOOWA': [
    { date: '2024-05-01', van: 800, erp: 600, openBanking: 300, total: 1700 },
    { date: '2024-05-02', van: 850, erp: 620, openBanking: 320, total: 1790 },
    { date: '2024-05-03', van: 820, erp: 610, openBanking: 310, total: 1740 },
    { date: '2024-05-04', van: 900, erp: 650, openBanking: 350, total: 1900 },
    { date: '2024-05-05', van: 950, erp: 680, openBanking: 370, total: 2000 },
    { date: '2024-05-06', van: 1000, erp: 700, openBanking: 400, total: 2100 },
    { date: '2024-05-07', van: 980, erp: 690, openBanking: 390, total: 2060 },
  ],
  'DAANGN': [
    { date: '2024-05-01', van: 500, erp: 400, openBanking: 200, total: 1100 },
    { date: '2024-05-02', van: 520, erp: 410, openBanking: 210, total: 1140 },
    { date: '2024-05-03', van: 490, erp: 390, openBanking: 190, total: 1070 },
    { date: '2024-05-04', van: 550, erp: 430, openBanking: 230, total: 1210 },
    { date: '2024-05-05', van: 580, erp: 450, openBanking: 250, total: 1280 },
    { date: '2024-05-06', van: 600, erp: 480, openBanking: 270, total: 1350 },
    { date: '2024-05-07', van: 590, erp: 470, openBanking: 260, total: 1320 },
  ]
};

const tenants = [
  { id: 'TOSS', name: '토스페이먼츠' },
  { id: 'WOOWA', name: '우아한형제들' },
  { id: 'DAANGN', name: '당근마켓' }
];

const COLORS = ['#008d75', '#01ab8e', '#02c7a7'];

export default function Statistics() {
  const [selectedTenant, setSelectedTenant] = useState('TOSS');

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  const currentData = mockStats[selectedTenant] || [];

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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
        <div className="flex flex-wrap items-center justify-start gap-x-12 gap-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">테넌트명</span>
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-80 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all appearance-none"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex justify-end gap-3">
            <button className="h-[40px] px-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap">
              초기화
            </button>
            <button className="h-[40px] px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap">
              조회하기
            </button>
          </div>
        </div>
      </div>

      {/* Grid Controls (Total count and Buttons) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b-2 border-gray-900">
        <div className="text-[15px] font-bold">
          <span className="text-gray-800">총 </span>
          <span className="text-[#008d75]">{currentData.length.toLocaleString()}</span>
          <span className="text-gray-800">건</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExcelDownload}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
              <tr className="text-gray-800">
                <th className="py-4 px-4 text-[14px] font-bold text-center">일자</th>
                <th className="py-4 px-4 text-[14px] font-bold text-right">VAN사 통신</th>
                <th className="py-4 px-4 text-[14px] font-bold text-right">ERP 통신</th>
                <th className="py-4 px-4 text-[14px] font-bold text-right">오픈뱅킹 통신</th>
                <th className="py-4 px-4 text-[14px] font-bold text-right">합계</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-gray-500 text-[14px]">
                    해당 테넌트의 통신량 데이터가 없습니다.
                   </td>
                </tr>
              ) : currentData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-center text-[14px] text-gray-900 font-medium">
                    {item.date}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight text-gray-600">
                    {item.van.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight text-gray-600">
                    {item.erp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight text-gray-600">
                    {item.openBanking.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-gray-800 bg-gray-50/50">
                    {item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {currentData.length > 0 && (
                <tr className="bg-[#eef1f5] border-t border-gray-400">
                  <td className="py-3 px-4 text-center text-[14px] text-gray-900 font-bold">
                    총계
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-gray-800">
                    {summary.van.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-gray-800">
                    {summary.erp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[14px] font-mono tracking-tight font-bold text-gray-800">
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
