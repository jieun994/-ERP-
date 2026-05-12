import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button, SearchBar, DataTable, StatusBadge, PageLayout, ConfirmModal, Input, Select } from './ui';

interface PushTemplate {
  id: string;
  name: string;
  content: string;
  sendingType: '승인' | '반려' | '결재대기';
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
    sendingType: '승인',
    targetValue: 'user_01',
    isUsed: true,
    createdAt: '2024-05-01 10:00:00',
    updatedAt: '2024-05-01 10:00:00',
    updatedBy: 'admin_a@hana.com'
  },
  {
    id: 'PUSH_002',
    name: '자금 이체 실행 반려 알림',
    content: '[하나은행] 이체 실행 건이 반려되었습니다. 사유를 확인해 주세요.',
    sendingType: '반려',
    targetValue: 'user_02',
    isUsed: true,
    createdAt: '2024-05-02 14:30:00',
    updatedAt: '2024-05-02 14:30:00',
    updatedBy: 'admin_b@hana.com'
  },
  {
    id: 'PUSH_003',
    name: '기업 인증서 만료 안내',
    content: '[하나은행] 기업 인증서 만료가 7일 남았습니다. 갱신이 필요합니다.',
    sendingType: '결재대기',
    targetValue: 'ENT_HANA_01',
    isUsed: false,
    createdAt: '2024-05-03 09:15:00',
    updatedAt: '2024-05-04 11:20:00',
    updatedBy: 'admin_a@hana.com'
  }
];

export default function PushNotificationManagement() {
  const location = useLocation();
  const [data, setData] = useState<PushTemplate[]>(mockData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PushTemplate | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setEditItem(null);
      setIsModalOpen(true);
    }
  }, []);
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | 'bulk' | null>(null);

  // Search States
  const [searchTemplateCode, setSearchTemplateCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchSendingType, setSearchSendingType] = useState('ALL');
  const [searchIsUsed, setSearchIsUsed] = useState('ALL');

  // Form States
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    content: '',
    sendingType: '승인' as '승인' | '반려' | '결재대기',
    targetValue: '',
    isUsed: true
  });

  const filteredData = data.filter(item => {
    const matchesCode = searchTemplateCode === '' || item.id.includes(searchTemplateCode);
    const matchesName = searchName === '' || item.name.includes(searchName);
    const matchesSendingType = searchSendingType === 'ALL' || item.sendingType === searchSendingType;
    const matchesIsUsed = searchIsUsed === 'ALL' || (searchIsUsed === 'use' ? item.isUsed : !item.isUsed);
    return matchesCode && matchesName && matchesSendingType && matchesIsUsed;
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
        id: item.id,
        name: item.name,
        content: item.content,
        sendingType: item.sendingType,
        targetValue: item.targetValue,
        isUsed: item.isUsed
      });
    } else {
      setEditItem(null);
      setFormData({
        id: '',
        name: '',
        content: '',
        sendingType: '승인',
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
    if (!formData.name || !formData.content) {
      alert('필수 항목을 모두 입력해 주세요.');
      return;
    }

    if (editItem) {
      setData(data.map(d => d.id === editItem.id ? { ...d, ...formData, updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0] } : d));
    } else {
      const newId = formData.id || `PUSH_${String(data.length + 1).padStart(3, '0')}`;
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

  const resetSearch = () => {
    setSearchTemplateCode('');
    setSearchName('');
    setSearchSendingType('ALL');
    setSearchIsUsed('ALL');
  };

  return (
    <PageLayout>
      {/* Search Area */}
      <SearchBar onSearch={() => {}} onReset={resetSearch}>
        <SearchBar.Field label="템플릿 코드">
          <Input
            type="text"
            placeholder="코드 입력"
            value={searchTemplateCode}
            onChange={(e) => setSearchTemplateCode(e.target.value)}
            style={{ width: 160 }}
          />
        </SearchBar.Field>
        <SearchBar.Field label="템플릿명">
          <Input
            type="text"
            placeholder="템플릿명 입력"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 256 }}
          />
        </SearchBar.Field>
        <SearchBar.Field label="발송 유형">
          <Select
            value={searchSendingType}
            onChange={(e) => setSearchSendingType(e.target.value)}
            style={{ width: 128 }}
          >
            <option value="ALL">전체</option>
            <option value="승인">승인</option>
            <option value="반려">반려</option>
            <option value="결재대기">결재대기</option>
          </Select>
        </SearchBar.Field>
        <SearchBar.Field label="사용여부">
          <Select
            value={searchIsUsed}
            onChange={(e) => setSearchIsUsed(e.target.value)}
            style={{ width: 128 }}
          >
            <option value="ALL">전체</option>
            <option value="use">사용</option>
            <option value="unused">미사용</option>
          </Select>
        </SearchBar.Field>
      </SearchBar>

      {/* Grid Controls */}
      <DataTable.Controls total={filteredData.length}>
        <Button variant="primary" size="sm" onClick={() => openForm()}>등록</Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={selectedIds.length !== 1}
          onClick={() => {
            if (selectedIds.length !== 1) {
              alert('수정할 항목을 1개만 선택해 주세요.');
              return;
            }
            const item = data.find(d => d.id === selectedIds[0]);
            if (item) openForm(item);
          }}
        >수정</Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => {
            if (selectedIds.length === 0) {
              alert('삭제할 항목을 선택해 주세요.');
              return;
            }
            setShowDeleteWarning('bulk');
          }}
        >삭제</Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => {
            if (selectedIds.length === 0) {
              alert('사용 여부를 변경할 항목을 선택해 주세요.');
              return;
            }
            setData(data.map(item => selectedIds.includes(item.id) ? { ...item, isUsed: !item.isUsed } : item));
            setSelectedIds([]);
          }}
        >사용여부 변경</Button>
        <Button variant="ghost" size="sm">엑셀 다운로드</Button>
      </DataTable.Controls>

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
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-28">템플릿 코드</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-48">템플릿명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">메시지 내용</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-28">발송 유형</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-24">사용 여부</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-40">등록자</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-[#8B95A1] text-[14px]">
                    조건에 맞는 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`h-[52px] transition-colors hover:bg-[#F9FAFB] cursor-pointer ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : ''}`}
                    onClick={() => toggleSelect(item.id)}
                    onDoubleClick={() => {
                      setSelectedIds([item.id]);
                      const found = data.find(d => d.id === item.id);
                      if (found) openForm(found);
                    }}
                  >
                    <td className="px-4 text-center border-r border-[#E5E8EB]">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{idx + 1}</td>
                    <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB] font-mono">{item.id}</td>
                    <td className="px-4 border-r border-[#E5E8EB]">
                      <span className="text-[14px] font-semibold text-[#191F28] leading-snug break-all">{item.name}</span>
                    </td>
                    <td className="px-4 border-r border-[#E5E8EB]">
                      <p className="text-[14px] text-[#4E5968] line-clamp-1">{item.content}</p>
                    </td>
                    <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB]">
                      {item.sendingType}
                    </td>
                    <td className="px-4 text-center border-r border-[#E5E8EB]">
                      <StatusBadge status={item.isUsed ? 'ON' : 'OFF'} />
                    </td>
                    <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB]">
                      {item.updatedBy}
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
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-[14px] font-semibold text-[#191F28]">템플릿 코드</label>
                          <Input
                            size="sm"
                            fullWidth
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            disabled={!!editItem}
                            placeholder="템플릿 코드"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-[14px] font-semibold text-[#191F28]">발송 유형 <span className="text-[#F04452]">*</span></label>
                          <Select
                            size="sm"
                            fullWidth
                            value={formData.sendingType}
                            onChange={(e) => setFormData({ ...formData, sendingType: e.target.value as '승인' | '반려' | '결재대기' })}
                          >
                            <option value="승인">승인</option>
                            <option value="반려">반려</option>
                            <option value="결재대기">결재대기</option>
                          </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[14px] font-semibold text-[#191F28]">템플릿명 <span className="text-[#F04452]">*</span></label>
                      <Input
                        size="sm"
                        fullWidth
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] shrink-0 gap-3">
                  <Button variant="secondary" size="md" style={{ width: 120 }} onClick={closeForm}>취소</Button>
                  <Button variant="primary" size="md" style={{ width: 120 }} onClick={saveForm}>
                    {editItem ? '저장하기' : '등록하기'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!showDeleteWarning}
        variant="danger"
        title="PUSH 템플릿을 삭제하시겠습니까?"
        description={"삭제 시 자동 발송 로직이 중단될 수 있습니다.\n삭제 후에는 복구가 불가능합니다."}
        confirmLabel="삭제하기"
        onConfirm={deleteItems}
        onCancel={() => setShowDeleteWarning(null)}
      />
    </PageLayout>
  );
}
