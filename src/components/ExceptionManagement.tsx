import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface ExceptionAccount {
  id: number;
  tenant: string;
  enterprise: string;
  bankName: string;
  accountNo: string;
  reason: string;
  isUsed: boolean;
  registeredAt: string;
}

const mockData: ExceptionAccount[] = [
  { id: 1, tenant: '(주)토스페이먼츠', enterprise: '(주)토스페이먼츠', bankName: '국민은행', accountNo: '111-222-333333', reason: '법인카드 결제계좌', isUsed: true, registeredAt: '2026-05-01' },
  { id: 2, tenant: '우아한형제들', enterprise: '우아한형제들', bankName: '신한은행', accountNo: '110-444-555555', reason: '특수목적 자금', isUsed: false, registeredAt: '2026-05-02' },
];

export default function ExceptionManagement() {
  const location = useLocation();
  const [data, setData] = useState<ExceptionAccount[]>(mockData);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setModalMode('create');
      setIsModalOpen(true);
    }
  }, []);

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
      alert('사용여부를 변경할 목록을 선택해주세요.');
      return;
    }
    setData(data.map(d => selectedIds.includes(d.id) ? { ...d, isUsed: !d.isUsed } : d));
    setSelectedIds([]);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 목록을 선택해주세요.');
      return;
    }
    if (confirm(`선택한 ${selectedIds.length}개 예외 계좌를 삭제하시겠습니까?`)) {
      setData(data.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedIds.length === 0) {
      alert('수정할 항목을 선택해주세요.');
      return;
    }
    if (selectedIds.length > 1) {
      alert('수정은 1개 항목만 가능합니다.');
      return;
    }
    setModalMode('edit');
    setIsModalOpen(true);
  };

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">테넌트명</span>
            <select className="w-40 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all">
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
              className="w-48 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]"
            />
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
      <div className="flex items-center justify-between mb-4">
        <div className="text-[14px]">
          <span className="text-[#4E5968]">총 </span>
          <span className="text-[#008d75] font-bold">{data.length}</span>
          <span className="text-[#4E5968]"> 건</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleOpenAddModal} className="h-[36px] px-4 bg-[#008d75] text-white rounded-md text-[14px] font-bold hover:bg-[#007a65] transition-colors shadow-sm">
            등록
          </button>
          <button onClick={handleOpenEditModal} disabled={selectedIds.length !== 1} className="h-[36px] px-4 bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedIds.length === 0}
            className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >삭제</button>
          <button className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm">
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
                  <input type="checkbox" className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer" checked={data.length > 0 && selectedIds.length === data.length} onChange={toggleSelectAll}/>
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">테넌트</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">기업명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">은행명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">대상 계좌번호</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">예외 사유</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center">등록일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className={`h-[52px] transition-colors hover:bg-[#F9FAFB] cursor-pointer ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : 'bg-white'}`}
                  onClick={() => toggleSelect(item.id)}
                  onDoubleClick={() => {
                    setSelectedIds([item.id]);
                    handleOpenEditModal();
                  }}
                >
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input type="checkbox" className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} onClick={(e) => e.stopPropagation()}/>
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{index + 1}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.tenant}</td>
                  <td className="px-4 text-[14px] text-[#191F28] font-medium border-r border-[#E5E8EB]">{item.enterprise}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.bankName}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] font-mono tracking-tight border-r border-[#E5E8EB]">{item.accountNo}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.reason}</td>
                  
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono">{item.registeredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0 bg-white">
                <h2 className="text-[16px] font-semibold text-[#191F28]">타행계좌 예외 {modalMode === 'create' ? '등록' : '수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#8B95A1] hover:text-[#191F28] transition-colors p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto w-full space-y-8">
                {/* 기본 정보 세션 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[14px] font-semibold text-[#191F28]">기본 정보</h4>
                  </div>
                  
                  <div className="pl-3 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-semibold text-[#191F28]">테넌트 <span className="text-[#F04452]">*</span></label>
                      <select className="w-full h-[36px] px-3 border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all bg-white">
                        <option>(주)토스페이먼츠</option>
                        <option>우아한형제들</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-semibold text-[#191F28]">기업명 <span className="text-[#F04452]">*</span></label>
                      <select className="w-full h-[36px] px-3 border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all bg-white">
                        <option value="">기업 선택</option>
                        <option value="toss">(주)토스페이먼츠</option>
                        <option value="toss_sub">(주)토스페이자회사</option>
                        <option value="woowa">우아한형제들</option>
                        <option value="daangn">당근마켓</option>
                        <option value="innovation">(주)혁신테크</option>
                        <option value="yanolja">야놀자</option>
                        <option value="starbucks">스타벅스코리아</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 계좌 정보 세션 */}
                <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[14px] font-semibold text-[#191F28]">계좌 정보</h4>
                  </div>
                  
                  <div className="pl-3 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[14px] font-semibold text-[#191F28]">대상 은행 <span className="text-[#F04452]">*</span></label>
                        <select className="w-full h-[36px] px-3 border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all bg-white">
                          <option>국민은행</option>
                          <option>신한은행</option>
                          <option>우리은행</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[14px] font-semibold text-[#191F28]">대상 계좌번호 <span className="text-[#F04452]">*</span></label>
                        <input type="text" className="w-full h-[36px] px-3 border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all font-mono" placeholder="계좌번호 (숫자만)" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-semibold text-[#191F28]">예외 사유</label>
                      <input type="text" className="w-full h-[36px] px-3 border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all" placeholder="예외 등록 사유 입력" />
                    </div>
                    {modalMode === 'edit' && (
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-semibold text-[#191F28]">사용여부</label>
                      <div className="flex gap-6 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" name="isUsed" className="w-4 h-4 accent-[#008d75]" defaultChecked />
                          <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">사용</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" name="isUsed" className="w-4 h-4 accent-[#008d75]" />
                          <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">미사용</span>
                        </label>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] gap-3 shrink-0">
                 <button onClick={() => setIsModalOpen(false)} className="w-[120px] h-[40px] text-[14px] font-medium text-[#333333] bg-white border border-[#D1D6DB] rounded-md hover:bg-[#F2F4F6] transition-colors">
                   취소
                 </button>
                 <button className="w-[120px] h-[40px] text-[14px] font-semibold text-white bg-[#008d75] rounded-md hover:bg-[#007a65] transition-colors shadow-sm">
                   {modalMode === 'create' ? '등록하기' : '저장하기'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
