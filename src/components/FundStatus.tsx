import React, { useState } from 'react';

export default function FundStatus() {
  const [data] = useState([
    { id: 1, tenant: '(주)토스페이먼츠', enterprise: '(주)토스페이먼츠', accountNo: '123-456789-01234', bankName: '하나은행', balance: '1,250,500,000', updateTime: '2026-05-04 15:30:22' },
    { id: 2, tenant: '(주)토스페이먼츠', enterprise: '(주)토스페이먼츠', accountNo: '987-654321-09876', bankName: '하나은행', balance: 'USD 45,000.00', updateTime: '2026-05-04 15:30:22' },
    { id: 3, tenant: '우아한형제들', enterprise: '우아한형제들', accountNo: '111-222222-33333', bankName: '국민은행', balance: '850,000,000', updateTime: '2026-05-04 14:15:00' },
  ]);

  const handleExcelDownload = () => {
    alert('자금 현황 엑셀 다운로드를 실행합니다.');
  };

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
        <div className="flex flex-wrap items-center justify-start gap-x-12 gap-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">테넌트명</span>
            <select className="w-48 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all appearance-none">
              <option value="all">전체</option>
              <option value="TOSS">(주)토스페이먼츠</option>
              <option value="WOOWAHAN">우아한형제들</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">기업명</span>
            <input 
              type="text" 
              placeholder="기업명 입력" 
              className="w-56 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]" 
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">조회일자</span>
            <input 
              type="date" 
              className="h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all" 
            />
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

      {/* Grid Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[14px]">
          <span className="text-[#4E5968]">총 </span>
          <span className="text-[#008d75] font-bold">{data.length}</span>
          <span className="text-[#4E5968]"> 건</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExcelDownload}
            className="h-[32px] px-4 bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-[#E5E8EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-20">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">테넌트</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">기업명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">은행명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">계좌번호</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] text-right">잔액</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center">최종 업데이트</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="h-[52px] transition-colors hover:bg-[#F9FAFB] bg-white"
                >
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB]">{index + 1}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.tenant}</td>
                  <td className="px-4 text-[14px] text-[#191F28] font-medium border-r border-[#E5E8EB]">{item.enterprise}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.bankName}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] font-mono tracking-tight border-r border-[#E5E8EB]">{item.accountNo}</td>
                  <td className="px-4 text-[14px] text-right font-semibold text-[#191F28] border-r border-[#E5E8EB]">{item.balance}</td>
                  <td className="px-4 text-[13px] text-center text-[#8B95A1] font-mono">{item.updateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
