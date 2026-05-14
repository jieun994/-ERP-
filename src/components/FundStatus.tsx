import React, { useState } from 'react';

export default function FundStatus() {
  const [data] = useState([
    { id: 1, tenant: '(주)토스페이먼츠', tenantCode: 'TOSS',     enterprise: '(주)토스페이먼츠', accountNo: '123-456789-01234', bankName: '하나은행', balance: '1,250,500,000', updateTime: '2026-05-04 15:30:22' },
    { id: 2, tenant: '(주)토스페이먼츠', tenantCode: 'TOSS',     enterprise: '(주)토스페이먼츠', accountNo: '987-654321-09876', bankName: '하나은행', balance: 'USD 45,000.00',  updateTime: '2026-05-04 15:30:22' },
    { id: 3, tenant: '우아한형제들',     tenantCode: 'WOOWAHAN', enterprise: '우아한형제들',     accountNo: '111-222222-33333', bankName: '국민은행', balance: '850,000,000',    updateTime: '2026-05-04 14:15:00' },
  ]);

  const handleExcelDownload = () => {
    alert('자금 현황 엑셀 다운로드를 실행합니다.');
  };

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-bg-gray border border-border-gray px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">테넌트명</span>
            <select className="w-48 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-body text-text-main outline-none focus:border-primary transition-all">
              <option value="all">전체</option>
              <option value="TOSS">(주)토스페이먼츠(TOSS)</option>
              <option value="WOOWAHAN">우아한형제들(WOOWAHAN)</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">기업명</span>
            <input 
              type="text" 
              placeholder="기업명 입력" 
              className="w-56 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-body text-text-main outline-none focus:border-primary transition-all placeholder-[#8B95A1]" 
            />
          </div>
        
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="w-[100px] h-[48px] bg-primary hover:bg-primary-hover text-white rounded-md text-body-lg font-bold transition-colors shadow-sm">
            조회
          </button>
          <button className="w-[100px] h-[48px] bg-white border border-border-input hover:bg-bg-muted text-text-main rounded-md text-body-lg font-bold transition-colors shadow-sm">
            초기화
          </button>
        </div>
      </div>


      {/* Grid Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-body">
          <span className="text-text-body">총 </span>
          <span className="text-primary font-bold">{data.length}</span>
          <span className="text-text-body"> 건</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExcelDownload}
            className="h-[36px] border border-border-input px-5 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm">
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-border-gray overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-20">No.</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">테넌트</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">기업명</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">은행명</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">계좌번호</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray text-right">잔액</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center">최종 업데이트</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="h-[52px] transition-colors hover:bg-bg-gray bg-white"
                >
                  <td className="px-4 text-center text-body-sm text-text-sub border-r border-border-gray">{index + 1}</td>
                  <td className="px-4 text-body text-text-body border-r border-border-gray">{item.tenant}({item.tenantCode})</td>
                  <td className="px-4 text-body text-text-main font-medium border-r border-border-gray">{item.enterprise}</td>
                  <td className="px-4 text-body text-text-body border-r border-border-gray">{item.bankName}</td>
                  <td className="px-4 text-body text-text-body font-mono tracking-tight border-r border-border-gray">{item.accountNo}</td>
                  <td className="px-4 text-body text-right font-semibold text-text-main border-r border-border-gray">{item.balance}</td>
                  <td className="px-4 text-body-sm text-center text-text-sub font-mono">{item.updateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
