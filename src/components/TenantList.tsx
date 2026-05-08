import React, { useState } from 'react';

interface Tenant {
  id: number;
  tenantCode: string;
  tenantName: string;
  isUsed: boolean;
}

const mockData: Tenant[] = [
  { id: 1, tenantCode: 'TOSS', tenantName: '(주)토스페이먼츠', isUsed: true },
  { id: 2, tenantCode: 'WOOWAHAN', tenantName: '우아한형제들', isUsed: true },
  { id: 4, tenantCode: 'INNOVATION', tenantName: '(주)혁신테크', isUsed: true },
  { id: 3, tenantCode: 'DAANGN', tenantName: '당근마켓', isUsed: false },
];

export default function TenantList() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [data, setData] = useState<Tenant[]>(mockData);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('사용여부를 변경할 테넌트를 선택해주세요.');
      return;
    }
    if (confirm(`선택한 ${selectedIds.length}개 테넌트의 사용여부를 변경하시겠습니까?`)) {
      setData(data.map(d => selectedIds.includes(d.id) ? { ...d, isUsed: !d.isUsed } : d));
      setSelectedIds([]);
    }
  };

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">테넌트명</span>
            <input 
              type="text" 
              placeholder="테넌트명 입력" 
              className="w-64 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">사용여부</span>
            <select className="w-40 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all">
              <option value="all">전체</option>
              <option value="use">사용</option>
              <option value="unused">미사용</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="w-[100px] h-[48px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[15px] font-bold transition-colors shadow-sm">
            조회
          </button>
          <button className="w-[100px] h-[48px] bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] rounded-md text-[15px] font-bold transition-colors shadow-sm">
            초기화
          </button>
        </div>
      </div>


      {/* Grid Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-[14px]">
          <span className="text-[#4E5968]">총 </span>
          <span className="text-[#008d75] font-bold">{data.length.toLocaleString()}</span>
          <span className="text-[#4E5968]"> 건</span>
        </div>
        
        <div className="flex items-center gap-2">
          
          
          
          
          <button 
            onClick={handleToggleUse}
            className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"
          >
            사용여부 변경
          </button>
          <button 
            onClick={handleExcelDownload}
            className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm">
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center border-r border-[#E5E8EB] w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">테넌트명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-32">사용여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`h-[52px] transition-colors hover:bg-[#F9FAFB] ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : 'bg-white'}`}
                >
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 text-[13px] text-center text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{index + 1}</td>
                  <td className="px-4 text-[14px] font-medium text-[#191F28] border-r border-[#E5E8EB]">
                    <div className="flex items-center gap-2">
                      {item.tenantName}
                    </div>
                  </td>
                  <td className="px-4 text-center">
                    <span className={`text-[13px] font-bold ${item.isUsed ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
                      {item.isUsed ? '사용' : '미사용'}
                    </span>
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
