import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button, FilterBar, DataTable, StatusBadge, PageLayout, ConfirmModal, Input, Select } from './ui';

type NotifyType = '결재' | '업무' | '공지사항' | '일정' | '시스템' | '메시지';
type SendChannel = 'web' | 'inbox' | 'both';

interface PushTemplate {
  id: string;
  name: string;
  content: string;
  notifyType: NotifyType;
  sendChannel: SendChannel;
  targetValue: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

const SEND_CHANNEL_LABEL: Record<SendChannel, string> = {
  'web': '웹푸시',
  'inbox': '알림함',
  'both': '웹푸시 + 알림함'
};

const mockData: PushTemplate[] = [
  {
    id: 'PUSH_001',
    name: '결재 승인 완료 알림',
    content: '[하나은행] 요청하신 결재 건이 승인 완료되었습니다.',
    notifyType: '결재',
    sendChannel: 'both',
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
    notifyType: '결재',
    sendChannel: 'web',
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
    notifyType: '시스템',
    sendChannel: 'inbox',
    targetValue: 'ENT_HANA_01',
    isUsed: false,
    createdAt: '2024-05-03 09:15:00',
    updatedAt: '2024-05-04 11:20:00',
    updatedBy: 'admin_a@hana.com'
  },
  {
    id: 'PUSH_004',
    name: '결재 도착 알림',
    content: '[하나은행] 결재가 도착하였습니다. 확인 후 처리해 주세요.',
    notifyType: '결재',
    sendChannel: 'both',
    targetValue: 'user_03',
    isUsed: true,
    createdAt: '2024-05-05 08:00:00',
    updatedAt: '2024-05-05 08:00:00',
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
  const [searchNotifyType, setSearchNotifyType] = useState('ALL');
  const [searchSendChannel, setSearchSendChannel] = useState('ALL');
  const [searchIsUsed, setSearchIsUsed] = useState('ALL');

  // Form States
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    content: '',
    notifyType: '결재' as NotifyType,
    sendChannel: 'both' as SendChannel,
    targetValue: '',
    isUsed: true
  });

  const filteredData = data.filter(item => {
    const matchesCode = searchTemplateCode === '' || item.id.includes(searchTemplateCode);
    const matchesName = searchName === '' || item.name.includes(searchName);
    const matchesNotifyType = searchNotifyType === 'ALL' || item.notifyType === searchNotifyType;
    const matchesSendChannel = searchSendChannel === 'ALL' || item.sendChannel === searchSendChannel;
    const matchesIsUsed = searchIsUsed === 'ALL' || (searchIsUsed === 'use' ? item.isUsed : !item.isUsed);
    return matchesCode && matchesName && matchesNotifyType && matchesSendChannel && matchesIsUsed;
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
        notifyType: item.notifyType,
        sendChannel: item.sendChannel,
        targetValue: item.targetValue,
        isUsed: item.isUsed
      });
    } else {
      setEditItem(null);
      setFormData({
        id: '',
        name: '',
        content: '',
        notifyType: '결재',
            sendChannel: 'both',
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
    setSearchNotifyType('ALL');
    setSearchSendChannel('ALL');
    setSearchIsUsed('ALL');
  };

  return (
    <PageLayout>
      {/* Search Area */}
      <FilterBar onSearch={() => {}} onReset={resetSearch}>
        <FilterBar.Field label="템플릿 코드">
          <Input
            type="text"
            placeholder="코드 입력"
            value={searchTemplateCode}
            onChange={(e) => setSearchTemplateCode(e.target.value)}
            fullWidth
          />
        </FilterBar.Field>
        <FilterBar.Field label="템플릿명">
          <Input
            type="text"
            placeholder="템플릿명 입력"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            fullWidth
          />
        </FilterBar.Field>
        <FilterBar.Field label="알림 유형">
          <Select
            value={searchNotifyType}
            onChange={(e) => setSearchNotifyType(e.target.value)}
            fullWidth
          >
            <option value="ALL">전체</option>
            <option value="결재">결재</option>
            <option value="업무">업무</option>
            <option value="공지사항">공지사항</option>
            <option value="일정">일정</option>
            <option value="시스템">시스템</option>
            <option value="메시지">메시지</option>
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="발송 채널">
          <Select
            value={searchSendChannel}
            onChange={(e) => setSearchSendChannel(e.target.value)}
            fullWidth
          >
            <option value="ALL">전체</option>
            <option value="web">웹푸시</option>
            <option value="inbox">알림함</option>
            <option value="both">웹푸시 + 알림함</option>
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="사용여부">
          <Select
            value={searchIsUsed}
            onChange={(e) => setSearchIsUsed(e.target.value)}
            fullWidth
          >
            <option value="ALL">전체</option>
            <option value="use">사용</option>
            <option value="unused">미사용</option>
          </Select>
        </FilterBar.Field>
      </FilterBar>

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
      <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-center border-r border-border-gray w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-16">No.</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-28">템플릿 코드</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray w-44">템플릿명</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-24">알림 유형</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-32">발송 채널</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">메시지 내용</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-24">사용 여부</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-40">등록자</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-text-sub text-body">
                    조건에 맞는 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`h-[52px] transition-colors hover:bg-bg-gray cursor-pointer ${selectedIds.includes(item.id) ? 'bg-primary/5' : ''}`}
                    onClick={() => toggleSelect(item.id)}
                    onDoubleClick={() => {
                      setSelectedIds([item.id]);
                      const found = data.find(d => d.id === item.id);
                      if (found) openForm(found);
                    }}
                  >
                    <td className="px-4 text-center border-r border-border-gray">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 accent-[#008d75] cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 text-center text-body-sm text-text-sub border-r border-border-gray font-mono">{idx + 1}</td>
                    <td className="px-4 text-center text-body-sm text-text-body border-r border-border-gray font-mono">{item.id}</td>
                    <td className="px-4 border-r border-border-gray">
                      <span className="text-body font-semibold text-text-main leading-snug break-all">{item.name}</span>
                    </td>
                    <td className="px-4 text-center text-body-sm text-text-body border-r border-border-gray">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-bg-muted text-text-body text-caption font-medium">
                        {item.notifyType}
                      </span>
                    </td>
                    <td className="px-4 text-center text-body-sm text-text-body border-r border-border-gray">
                      {SEND_CHANNEL_LABEL[item.sendChannel]}
                    </td>
                    <td className="px-4 border-r border-border-gray">
                      <p className="text-body text-text-body line-clamp-1">{item.content}</p>
                    </td>
                    <td className="px-4 text-center border-r border-border-gray">
                      <StatusBadge status={item.isUsed ? 'ON' : 'OFF'} />
                    </td>
                    <td className="px-4 text-center text-body-sm text-text-body border-r border-border-gray">
                      {item.updatedBy}
                    </td>
                    <td className="px-4 text-center text-body-sm text-text-sub font-mono leading-tight whitespace-nowrap">
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
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
                <h3 className="text-title-sm font-semibold text-text-main">PUSH 템플릿 {editItem ? '수정' : '등록'}</h3>
                <button onClick={closeForm} className="p-2 text-text-sub hover:text-text-main transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body font-semibold text-text-main">템플릿 정보</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-body font-semibold text-text-main">템플릿 코드</label>
                          <div className="h-9 px-3 flex items-center bg-bg-gray border border-border-input rounded-md text-body text-text-sub">
                            {editItem ? (
                              <span className="font-mono text-text-main">{formData.id}</span>
                            ) : (
                              <span className="text-text-sub">등록 시 자동 부여됩니다 (PUSH_###)</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-body font-semibold text-text-main">알림 유형 <span className="text-status-error">*</span></label>
                          <Select
                            size="sm"
                            fullWidth
                            value={formData.notifyType}
                            onChange={(e) => setFormData({ ...formData, notifyType: e.target.value as NotifyType })}
                          >
                            <option value="결재">결재</option>
                            <option value="업무">업무</option>
                            <option value="공지사항">공지사항</option>
                            <option value="일정">일정</option>
                            <option value="시스템">시스템</option>
                            <option value="메시지">메시지</option>
                          </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-body font-semibold text-text-main">템플릿명 <span className="text-status-error">*</span></label>
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
                      <label className="block text-body font-semibold text-text-main">발송 채널 <span className="text-status-error">*</span></label>
                      <div className="flex gap-6 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="sendChannel"
                            checked={formData.sendChannel === 'web'}
                            onChange={() => setFormData({ ...formData, sendChannel: 'web' })}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-body text-text-body group-hover:text-text-main">웹푸시</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="sendChannel"
                            checked={formData.sendChannel === 'inbox'}
                            onChange={() => setFormData({ ...formData, sendChannel: 'inbox' })}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-body text-text-body group-hover:text-text-main">알림함</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="sendChannel"
                            checked={formData.sendChannel === 'both'}
                            onChange={() => setFormData({ ...formData, sendChannel: 'both' })}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-body text-text-body group-hover:text-text-main">웹푸시 + 알림함</span>
                        </label>
                      </div>
                      <p className="text-caption text-text-sub pt-1">웹푸시는 브라우저 알림으로 즉시 노출되며, 알림함은 사용자 알림함에 누적됩니다.</p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="block text-body font-semibold text-text-main">사용여부</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="isUsed"
                            checked={formData.isUsed}
                            onChange={() => setFormData({ ...formData, isUsed: true })}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-body text-text-body group-hover:text-text-main">사용</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="isUsed"
                            checked={!formData.isUsed}
                            onChange={() => setFormData({ ...formData, isUsed: false })}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-body text-text-body group-hover:text-text-main">미사용</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="block text-body font-semibold text-text-main">메시지 템플릿 <span className="text-status-error">*</span></label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={4}
                        maxLength={100}
                        className="w-full px-4 py-3 bg-bg-gray border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary focus:bg-white transition-all resize-none placeholder-[#8B95A1]"
                        placeholder={'예: [하나은행] 결재가 도착했습니다.'}
                      />
                      <div className="flex justify-between pr-1">
                        <span className="text-caption text-text-sub">{'치환 변수: 수신자명, 기업명, 금액, 문서번호'}</span>
                        <span className="text-caption text-text-sub">{formData.content.length} / 100자</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center h-[72px] px-6 border-t border-border-gray bg-bg-gray shrink-0 gap-3">
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
