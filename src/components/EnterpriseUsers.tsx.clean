import React, { useState } from 'react';

interface EnterpriseUser {
  id: number;
  tenant: string;
  enterprise: string;
  userName: string;
  userId: string;
  role: string;
  status: string;
  lastLogin: string;
}

const mockData: EnterpriseUser[] = [
  { id: 1, tenant: '(주)토스페이먼츠', enterprise: '(주)토스페이먼츠', userName: '김하나', userId: 'hana_kim@toss.im', role: '마스터', status: '정상', lastLogin: '2024-05-01 10:23:45' },
  { id: 2, tenant: '(주)토스페이먼츠', enterprise: '(주)토스페이먼츠', userName: '이보람', userId: 'boram_lee@toss.im', role: '자금 담당', status: '정상', lastLogin: '2024-05-02 11:10:00' },
  { id: 3, tenant: '(주)토스페이먼츠', enterprise: '(주)토스페이자회사', userName: '박지성', userId: 'jisung_park@toss.im', role: '인사 담당', status: '중지', lastLogin: '2024-04-20 09:00:22' },
  { id: 4, tenant: '야놀자', enterprise: '야놀자', userName: '최수종', userId: 'sujong_choi@yanolja.com', role: '마스터', status: '정상', lastLogin: '2024-05-04 08:30:11' },
];

export default function EnterpriseUsers() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [data, setData] = useState<EnterpriseUser[]>(mockData);
  const [roleFilter, setRoleFilter] = useState('all');

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

  const handleToggleStatus = () => {
    if (selectedIds.length === 0) {
      alert('상태를 변경할 사용자를 선택해주세요.');
      return;
    }
    if (confirm(`선택한 ${selectedIds.length}명 사용자의 상태(사용/중지)를 변경하시겠습니까?`)) {
      setData(data.map(d => selectedIds.includes(d.id) ? { ...d, status: d.status === '정상' ? '중지' : '정상' } : d));
      setSelectedIds([]);
    }
  };

  const handleExcelDownload = () => {
    alert('사용자 목록 엑셀 다운로드를 실행합니다.');
  };

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">테넌트명</span>
            <select className="w-48 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all">
              <option value="all">전체</option>
              <option value="TOSS">(주)토스페이먼츠</option>
              <option value="YANOLJA">야놀자</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">기업명</span>
            <input 
              type="text" 
              placeholder="기업명 입력" 
              className="w-56 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all" 
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">상세 검색</span>
            <input 
              type="text" 
              placeholder="이름 또는 아이디 입력" 
              className="w-56 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all" 
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">상태</span>
            <select className="w-40 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all">
              <option value="all">전체</option>
              <option value="normal">정상</option>
              <option value="stopped">중지</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">권한</span>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-40 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              <option value="all">전체</option>
              <option value="master">마스터</option>
              <option value="fund">자금 담당</option>
              <option value="hr">인사 담당</option>
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
          <span className="text-[#191F28]">총 </span>
          <span className="text-[#008d75] font-bold">{data.length}</span>
          <span className="text-[#191F28]"> 명</span>
        </div>
        
        <div className="flex items-center gap-2">
          
          
          
          
          <button 
            onClick={handleExcelDownload}
            className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm">
            엑셀 다운로드
          </button>
          <button 
            onClick={handleToggleStatus}
            className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"
          >
            상태 변경
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
                    className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">테넌트</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">기업명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">사용자명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">아이디(ID)</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">권한</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB]">상태</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center">최근 로그인</th>
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
                      className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{index + 1}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.tenant}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] font-medium border-r border-[#E5E8EB]">{item.enterprise}</td>
                  <td className="px-4 text-[14px] text-[#191F28] font-medium border-r border-[#E5E8EB]">{item.userName}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.userId}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.role}</td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <span className={`text-[14px] font-semibold ${item.status === '정상' ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono whitespace-nowrap">{item.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
