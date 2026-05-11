import React, { useState } from 'react';
import { SearchBar, DataTable, PageLayout, Button, Input, Select } from './ui';

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
    <PageLayout>
      {/* Search Area */}
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <SearchBar.Field label="테넌트명">
          <Select style={{ width: 192 }}>
            <option value="ALL">전체</option>
            <option value="TOSS">(주)토스페이먼츠</option>
            <option value="WOOWAHAN">우아한형제들</option>
          </Select>
        </SearchBar.Field>
        <SearchBar.Field label="기업명">
          <Input
            type="text"
            placeholder="기업명 입력"
            style={{ width: 224 }}
          />
        </SearchBar.Field>
      </SearchBar>

      {/* Grid Controls */}
      <DataTable.Controls total={data.length}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExcelDownload}
        >
          엑셀 다운로드
        </Button>
      </DataTable.Controls>

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
    </PageLayout>
  );
}
