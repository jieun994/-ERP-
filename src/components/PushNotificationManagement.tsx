import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  Download, 
  Plus, 
  X, 
  AlertCircle,
  MoreVertical,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PushTemplate {
  id: string;
  name: string;
  content: string;
  targetType: 'USER' | 'ENTERPRISE';
  targetValue: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

const mockData: PushTemplate[] = [
  {
    id: 'PUSH_001',
    name: '결재 승인 완료 알림',
    content: '[하나은행] 요청하신 결재 건이 승인 완료되었습니다.',
    targetType: 'USER',
    targetValue: 'user_01',
    isUsed: true,
    createdAt: '2024-05-01 10:00:00',
    updatedAt: '2024-05-01 10:00:00',
    updatedBy: '관리자A'
  },
  {
    id: 'PUSH_002',
    name: '자금 이체 실행 반려 알림',
    content: '[하나은행] 이체 실행 건이 반려되었습니다. 사유를 확인해 주세요.',
    targetType: 'USER',
    targetValue: 'user_02',
    isUsed: true,
    createdAt: '2024-05-02 14:30:00',
    updatedAt: '2024-05-02 14:30:00',
    updatedBy: '관리자B'
  },
  {
    id: 'PUSH_003',
    name: '기업 인증서 만료 안내',
    content: '[하나은행] 기업 인증서 만료가 7일 남았습니다. 갱신이 필요합니다.',
    targetType: 'ENTERPRISE',
    targetValue: 'ENT_HANA_01',
    isUsed: false,
    createdAt: '2024-05-03 09:15:00',
    updatedAt: '2024-05-04 11:20:00',
    updatedBy: '관리자A'
  }
];

export default function PushNotificationManagement() {
  const [data, setData] = useState<PushTemplate[]>(mockData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PushTemplate | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | 'bulk' | null>(null);

  // Search States
  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState('all');

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    targetType: 'USER' as 'USER' | 'ENTERPRISE',
    targetValue: '',
    isUsed: true
  });

  const filteredData = data.filter(item => {
    const matchesName = searchName === '' || item.name.includes(searchName);
    const matchesStatus = searchStatus === 'all' || (searchStatus === 'use' ? item.isUsed : !item.isUsed);
    return matchesName && matchesStatus;
  });

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openForm = (item?: PushTemplate) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name,
        content: item.content,
        targetType: item.targetType,
        targetValue: item.targetValue,
        isUsed: item.isUsed
      });
    } else {
      setEditItem(null);
      setFormData({
        name: '',
        content: '',
        targetType: 'USER',
        targetValue: '',
        isUsed: true
      });
    }
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const saveForm = () => {
    if (!formData.name || !formData.content || !formData.targetValue) {
      alert('필수 항목을 모두 입력해 주세요.');
      return;
    }

    if (editItem) {
      setData(data.map(d => d.id === editItem.id ? { ...d, ...formData, updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0] } : d));
    } else {
      const newId = `PUSH_${String(data.length + 1).padStart(3, '0')}`;
      setData([{
        id: newId,
        ...formData,
        createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        updatedBy: '현재관리자'
      }, ...data]);
    }
    closeForm();
  };

  const deleteItems = () => {
    if (showDeleteWarning === 'bulk') {
      setData(data.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    } else if (showDeleteWarning) {
      setData(data.filter(d => d.id !== showDeleteWarning));
      setSelectedIds(selectedIds.filter(id => id !== showDeleteWarning));
    }
    setShowDeleteWarning(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Search Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
        <div className="flex flex-wrap items-center justify-start gap-x-12 gap-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">검색어</span>
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="템플릿명 입력"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]"
              />
              <Search className="w-4 h-4 text-[#8B95A1] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="flex-1 flex justify-end gap-3">
            <button 
              onClick={() => { setSearchName(''); setSearchStatus('all'); }} 
              className="h-[40px] px-6 bg-white border border-[#D1D6DB] text-[#333333] hover:bg-gray-50 rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              초기화
            </button>
            <button className="h-[40px] px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap">
              조회하기
            </button>
          </div>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-[14px]">
          <span className="text-[#4E5968]">총 </span>
          <span className="text-[#008d75] font-bold">{filteredData.length.toLocaleString()}</span>
          <span className="text-[#4E5968]"> 건</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openForm()}
            className="h-[32px] px-4 bg-[#008d75] text-white rounded-md text-[13px] font-semibold hover:bg-[#007a65] transition-colors shadow-sm"
          >등록</button>
          <button 
            className="h-[32px] px-4 bg-white border border-[#D1D6DB] rounded-md text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors"
          >
             엑셀 다운로드
          </button>
          <button 
            onClick={() => {
              if (selectedIds.length !== 1) {
                alert('수정할 항목을 1개만 선택해 주세요.');
                return;
              }
              const item = data.find(d => d.id === selectedIds[0]);
              if (item) openForm(item);
            }}
            className="h-[32px] px-4 bg-white border border-[#D1D6DB] rounded-md text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors"
          >
            수정
          </button>
          <button 
            onClick={() => {
              if (selectedIds.length === 0) {
                alert('삭제할 항목을 선택해 주세요.');
                return;
              }
              setShowDeleteWarning('bulk');
            }}
            className="h-[32px] px-4 bg-white border border-[#D1D6DB] rounded-md text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors"
          >삭제</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center border-r border-[#E5E8EB] w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-48">템플릿명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">메시지 내용</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-28">대상 유형</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-32">발송 대상</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-24">사용 여부</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[#8B95A1] text-[14px]">
                    조건에 맞는 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="h-[52px] transition-colors hover:bg-[#F9FAFB] group">
                    <td className="px-4 text-center border-r border-[#E5E8EB]">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{idx + 1}</td>
                    <td className="px-4 border-r border-[#E5E8EB]">
                      <span className="text-[14px] font-semibold text-[#191F28] leading-snug break-all">{item.name}</span>
                    </td>
                    <td className="px-4 border-r border-[#E5E8EB]">
                      <p className="text-[14px] text-[#4E5968] line-clamp-1">{item.content}</p>
                    </td>
                    <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB]">
                      {item.targetType === 'USER' ? '사용자' : '기업'}
                    </td>
                    <td className="px-4 text-center border-r border-[#E5E8EB]">
                      <span className="font-mono text-[13px] text-[#8B95A1]">{item.targetValue}</span>
                    </td>
                    <td className="px-4 text-center border-r border-[#E5E8EB]">
                      <span className={`text-[13px] font-bold ${
                        item.isUsed ? 'text-[#008d75]' : 'text-[#8B95A1]'
                      }`}>
                        {item.isUsed ? '사용' : '미사용'}
                      </span>
                    </td>
                    <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono leading-tight whitespace-nowrap">
                      {item.updatedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0 bg-white">
                <h3 className="text-[16px] font-semibold text-[#191F28]">PUSH 템플릿 {editItem ? '수정' : '등록'}</h3>
                <button onClick={closeForm} className="p-2 text-[#8B95A1] hover:text-[#191F28] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* 템플릿 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[14px] font-semibold text-[#191F28]">템플릿 정보</h4>
                  </div>
                  
                  <div className="pl-3 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[14px] font-semibold text-[#191F28]">템플릿명 <span className="text-[#F04452]">*</span></label>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-[36px] px-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]"
                        placeholder="예: 승인 완료 알림"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="block text-[14px] font-semibold text-[#191F28]">사용 여부</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="isUsed" 
                            checked={formData.isUsed}
                            onChange={() => setFormData({ ...formData, isUsed: true })}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">사용</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="isUsed" 
                            checked={!formData.isUsed}
                            onChange={() => setFormData({ ...formData, isUsed: false })}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">미사용</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="block text-[14px] font-semibold text-[#191F28]">메시지 내용 <span className="text-[#F04452]">*</span></label>
                      <textarea 
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={4}
                        maxLength={100}
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] focus:bg-white transition-all resize-none placeholder-[#8B95A1]"
                        placeholder="수신자에게 노출될 알림 내용을 입력하세요."
                      />
                      <div className="flex justify-end pr-1">
                        <span className="text-[12px] text-[#8B95A1]">{formData.content.length} / 100자</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 발송 대상 설정 */}
                <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[14px] font-semibold text-[#191F28]">발송 대상 설정</h4>
                  </div>
                  
                  <div className="pl-3 flex bg-[#F9FAFB] p-6 rounded-lg border border-[#E5E8EB] gap-6">
                    <div className="flex-1 space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#4E5968]">대상 유형</label>
                      <div className="flex bg-white p-1 rounded-md border border-[#D1D6DB]">
                        <button 
                          onClick={() => setFormData({ ...formData, targetType: 'USER' })}
                          className={`flex-1 h-[28px] rounded-sm text-[12px] font-semibold transition-all ${
                            formData.targetType === 'USER' ? 'bg-[#008d75] text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                          }`}
                        >
                          사용자
                        </button>
                        <button 
                          onClick={() => setFormData({ ...formData, targetType: 'ENTERPRISE' })}
                          className={`flex-1 h-[28px] rounded-sm text-[12px] font-semibold transition-all ${
                            formData.targetType === 'ENTERPRISE' ? 'bg-[#008d75] text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                          }`}
                        >
                          기업
                        </button>
                      </div>
                    </div>
                    <div className="flex-[2] space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#4E5968]">
                        {formData.targetType === 'USER' ? '사용자 ID/계정' : '기업 코드/사업자번호'} <span className="text-[#F04452]">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={formData.targetValue}
                          onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                          className="w-full h-[36px] pl-3 pr-9 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]"
                          placeholder={formData.targetType === 'USER' ? '대상 사용자 검색' : '대상 기업 검색'}
                        />
                        <Search className="w-3.5 h-3.5 text-[#8B95A1] absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                  <p className="pl-3 text-[12px] text-[#8B95A1] leading-relaxed">
                    * 전체 발송 또는 다수 대상 일괄 발송은 지원하지 않습니다. 단건 자동 발송 템플릿만 등록 가능합니다.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] shrink-0 gap-3">
                <button 
                  onClick={closeForm}
                  className="w-[120px] h-[40px] border border-[#D1D6DB] rounded-md bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F2F4F6] transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={saveForm}
                  className="w-[120px] h-[40px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[14px] font-semibold transition-colors shadow-sm"
                >
                  {editItem ? '저장하기' : '등록하기'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simple Delete Warning Modal */}
      <AnimatePresence>
        {showDeleteWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-8 text-center"
            >
              <div className="w-12 h-12 bg-red-50 text-[#F04452] rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-[18px] font-bold text-[#191F28] mb-3">PUSH 템플릿을 삭제하시겠습니까?</h3>
              <p className="text-[14px] text-[#4E5968] mb-10 leading-relaxed font-medium">
                삭제 시 자동 발송 로직이 중단될 수 있습니다.<br/>삭제 후에는 복구가 불가능합니다.
              </p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => setShowDeleteWarning(null)}
                  className="flex-1 h-[44px] bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[14px] font-semibold hover:bg-[#F9FAFB] transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={deleteItems}
                  className="flex-1 h-[44px] bg-[#F04452] text-white rounded-md text-[14px] font-semibold hover:bg-[#d93a46] transition-colors shadow-sm"
                >
                  삭제하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
