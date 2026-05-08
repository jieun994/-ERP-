import React, { useState } from 'react';

interface ErpIntegrationStatus {
  id: string;
  no: number;
  enterpriseName: string;
  erpType: string;
  status: '정상' | '오류' | '미연결';
  lastConnectedAt: string | null;
}

const services = [
  'Biz-서비스 1',
  'Biz-서비스 2',
  'ERP 인테그레이션 1',
  'ERP 인테그레이션 2',
];

const mockData: Record<string, ErpIntegrationStatus[]> = {
  'Biz-서비스 1': [
    { id: '1', no: 1, enterpriseName: '토스페이먼츠', erpType: 'SAP', status: '정상', lastConnectedAt: '2024-05-15 10:30:05' },
    { id: '2', no: 2, enterpriseName: '카카오페이', erpType: '더존', status: '정상', lastConnectedAt: '2024-05-15 10:28:15' },
    { id: '3', no: 3, enterpriseName: '우아한형제들', erpType: '자체구축', status: '오류', lastConnectedAt: '2024-05-15 09:15:33' },
    { id: '4', no: 4, enterpriseName: '당근마켓', erpType: '영림원', status: '정상', lastConnectedAt: '2024-05-15 10:29:50' },
  ],
  'Biz-서비스 2': [
    { id: '5', no: 1, enterpriseName: '쿠팡', erpType: 'SAP', status: '정상', lastConnectedAt: '2024-05-15 10:25:00' },
    { id: '6', no: 2, enterpriseName: '11번가', erpType: '자체구축', status: '미연결', lastConnectedAt: null },
  ],
  'ERP 인테그레이션 1': [
    { id: '7', no: 1, enterpriseName: '네이버파이낸셜', erpType: '더존', status: '정상', lastConnectedAt: '2024-05-15 10:31:00' },
  ],
  'ERP 인테그레이션 2': []
};

export default function ServiceStatus() {
  const [selectedService, setSelectedService] = useState<string>(services[0]);

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  const currentData = mockData[selectedService] || [];

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">서비스명</span>
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-64 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              {services.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="w-[100px] h-[48px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[15px] font-bold transition-colors shadow-sm">
            조회
          </button>
          <button className="w-[100px] h-[48px] bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] rounded-md text-[15px] font-bold transition-colors shadow-sm"
            onClick={() => setSelectedService('전체')}
          >
            초기화
          </button>
        </div>
      </div>

      {/* Grid Controls (Total count and Buttons) */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[14px]">
          <span className="text-[#4E5968]">총 </span>
          <span className="text-[#008d75] font-bold">{currentData.length.toLocaleString()}</span>
          <span className="text-[#4E5968]"> 건</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExcelDownload}
            className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm">
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-[#E5E8EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="py-3 px-4 text-[14px] font-semibold text-center w-20 border-r border-[#E5E8EB]">No.</th>
                <th className="py-3 px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">기업명</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-center w-48 border-r border-[#E5E8EB]">ERP 종류</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-center w-32 border-r border-[#E5E8EB]">연계 상태</th>
                <th className="py-3 px-4 text-[14px] font-semibold text-center w-56">마지막 연계 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {currentData.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-[#8B95A1] text-[14px]">
                    선택한 서비스에 연계된 기업 데이터가 없습니다.
                   </td>
                </tr>
              ) : currentData.map((item) => (
                <tr 
                  key={item.id} 
                  className="h-[44px] hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono border-r border-[#E5E8EB]">{item.no}</td>
                  <td className="px-4 text-[14px] font-medium text-[#191F28] border-r border-[#E5E8EB]">
                    {item.enterpriseName}
                  </td>
                  <td className="px-4 text-center text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">
                    {item.erpType}
                  </td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <span className={`text-[13px] font-bold ${item.status === '정상' ? 'text-[#008d75]' : item.status === '미연결' ? 'text-[#8B95A1]' : 'text-[#F04452]'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono tracking-tight">
                    {item.lastConnectedAt || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
