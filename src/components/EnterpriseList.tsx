import React, { useState } from 'react';
import EnterpriseEditModal from './EnterpriseEditModal';
import EnterpriseRegister from './EnterpriseRegister';

interface Enterprise {
  id: number;
  tenant: string;
  tenantCode: string;
  name: string;
  bizNumber: string;
  corpNumber: string;
  isUsed: boolean;
}

const mockData: Enterprise[] = [
  { id: 1, tenant: '(주)토스페이먼츠', tenantCode: 'TOSS',       name: '(주)토스페이먼츠',  bizNumber: '120-81-12345', corpNumber: '110111-1234567', isUsed: true },
  { id: 2, tenant: '(주)토스페이먼츠', tenantCode: 'TOSS',       name: '(주)토스페이자회사', bizNumber: '120-81-22345', corpNumber: '110111-2234567', isUsed: true },
  { id: 3, tenant: '우아한형제들',     tenantCode: 'WOOWAHAN',   name: '우아한형제들',       bizNumber: '120-81-67890', corpNumber: '110111-3234567', isUsed: true },
  { id: 4, tenant: '당근마켓',         tenantCode: 'DAANGN',     name: '당근마켓',           bizNumber: '120-81-54321', corpNumber: '110111-4234567', isUsed: false },
  { id: 7, tenant: '(주)혁신테크',     tenantCode: 'INNOVATION', name: '(주)혁신테크',       bizNumber: '123-45-67890', corpNumber: '110111-7234567', isUsed: true },
  { id: 5, tenant: '야놀자',           tenantCode: 'YANOLJA',    name: '야놀자',             bizNumber: '120-81-09876', corpNumber: '110111-5234567', isUsed: true },
  { id: 6, tenant: '스타벅스코리아',   tenantCode: 'STARBUCKS',  name: '스타벅스코리아',     bizNumber: '120-81-55555', corpNumber: '110111-6234567', isUsed: true },
];

export default function EnterpriseList() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [data, setData] = useState<Enterprise[]>(mockData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEnterpriseId, setEditEnterpriseId] = useState<number | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 기업을 선택해주세요.');
      return;
    }
    if (confirm(`선택한 ${selectedIds.length}개 기업을 삭제하시겠습니까?`)) {
      setData(data.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  const handleToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('사용여부를 변경할 기업을 선택해주세요.');
      return;
    }
    setData(data.map(d => selectedIds.includes(d.id) ? { ...d, isUsed: !d.isUsed } : d));
    setSelectedIds([]);
  };

  const handleEdit = () => {
    if (selectedIds.length === 0) {
      alert('수정할 기업을 선택해주세요.');
      return;
    }
    if (selectedIds.length > 1) {
      alert('수정은 다건 선택을 지원하지 않습니다. 1개 기업만 선택해주세요.');
      return;
    }
    setEditEnterpriseId(selectedIds[0]);
    setIsEditModalOpen(true);
  };

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  return (
    <div className="w-full space-y-0 relative pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-bg-gray border border-border-gray px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">테넌트명</span>
            <select className="w-48 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary transition-all">
              <option value="all">전체</option>
              <option value="TOSS">(주)토스페이먼츠(TOSS)</option>
              <option value="WOOWAHAN">우아한형제들(WOOWAHAN)</option>
              <option value="DAANGN">당근마켓(DAANGN)</option>
              <option value="YANOLJA">야놀자(YANOLJA)</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">기업명</span>
            <input 
              type="text" 
              placeholder="기업명 입력" 
              className="w-56 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all" 
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">사용여부</span>
            <select className="w-32 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary transition-all">
              <option value="all">전체</option>
              <option value="use">사용</option>
              <option value="unused">미사용</option>
            </select>
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-body">
          <span className="text-text-main">총 </span>
          <span className="text-primary font-bold">{data.length}</span>
          <span className="text-text-main"> 건</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleUse}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >
            사용여부 변경
          </button>
          <button 
            onClick={handleEdit}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >
            수정
          </button>
          <button 
            onClick={handleDelete}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >
            삭제
          </button>
          <button 
            onClick={handleExcelDownload}
            className="h-[36px] border border-border-input px-5 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >
            엑셀 다운로드
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-center border-r border-border-gray w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-16">No.</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">테넌트</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">기업명</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">사업자등록번호</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">법인등록번호</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center">사용여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`h-[52px] transition-colors hover:bg-bg-gray ${selectedIds.includes(item.id) ? 'bg-primary/5' : 'bg-white'}`}
                >
                  <td className="px-4 text-center border-r border-border-gray">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 text-center text-body-sm text-text-sub border-r border-border-gray font-mono">{index + 1}</td>
                  <td className="px-4 text-body text-text-body border-r border-border-gray">{item.tenant}({item.tenantCode})</td>
                  <td className="px-4 text-body font-medium text-text-main border-r border-border-gray">
                    <div className="flex items-center gap-2">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-4 text-body text-text-body font-mono tracking-tight border-r border-border-gray">{item.bizNumber}</td>
                  <td className="px-4 text-body text-text-body font-mono tracking-tight border-r border-border-gray">{item.corpNumber}</td>
                  <td className="px-4 text-center">
                    <span className={`text-body font-semibold ${item.isUsed ? 'text-primary' : 'text-text-sub'}`}>
                      {item.isUsed ? '사용' : '미사용'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-body text-text-sub">
                    조회된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        
      </div>
      
      {/* 팝업 */}
      <EnterpriseEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        enterpriseId={editEnterpriseId}
        enterprise={data.find(d => d.id === editEnterpriseId) ?? null}
      />
    </div>
  );
}
