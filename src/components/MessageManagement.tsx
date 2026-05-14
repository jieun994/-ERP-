import React, { useState, useEffect } from 'react';
import { Search, Plus, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button, SearchBar, DataTable, PageLayout, StatusBadge, ConfirmModal, Input } from './ui';

interface MessageData {
  id: string;
  no: number;
  messageGroup: string;
  messageCode: string;
  texts: Record<string, string>;
  isUsed: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageGroup {
  name: string;
  description: string;
  isUsed: boolean;
}

const mockLangCodes = [
  { code: 'KO', name: '한국어' },
  { code: 'EN', name: '영어' },
  { code: 'JA', name: '일본어' },
];

const mockGroups: MessageGroup[] = [
  { name: 'ERR', description: '에러 메시지', isUsed: true },
  { name: 'MSG', description: '일반 안내 메시지', isUsed: true },
  { name: 'CONFIRM', description: '확인 요청 메시지', isUsed: true },
  { name: 'INFO', description: '정보 안내 메시지', isUsed: false },
];

const mockMessages: MessageData[] = [
  {
    id: '1', no: 1, messageGroup: 'ERR',
    messageCode: 'ERR_LOGIN_001',
    texts: { KO: '아이디 또는 비밀번호가 올바르지 않습니다.', EN: 'Invalid ID or Password.', JA: 'IDまたはパスワードが正しくありません。' },
    isUsed: true, author: 'admin1', createdAt: '2024-05-01', updatedAt: '2024-05-10',
  },
  {
    id: '2', no: 2, messageGroup: 'ERR',
    messageCode: 'ERR_AUTH_002',
    texts: { KO: '인증이 만료되었습니다. 다시 로그인해 주세요.', EN: 'Authentication expired. Please log in again.', JA: '認証の有効期限が切れました。再度ログインしてください。' },
    isUsed: true, author: 'admin1', createdAt: '2024-05-02', updatedAt: '2024-05-02',
  },
  {
    id: '3', no: 3, messageGroup: 'ERR',
    messageCode: 'ERR_NETWORK_001',
    texts: { KO: '네트워크 오류가 발생했습니다.', EN: 'A network error has occurred.', JA: 'ネットワークエラーが発生しました。' },
    isUsed: false, author: 'admin2', createdAt: '2024-05-03', updatedAt: '2024-05-03',
  },
  {
    id: '4', no: 4, messageGroup: 'MSG',
    messageCode: 'MSG_SAVE_SUCCESS',
    texts: { KO: '성공적으로 저장되었습니다.', EN: 'Saved successfully.', JA: '正常に保存されました。' },
    isUsed: true, author: 'admin1', createdAt: '2024-05-02', updatedAt: '2024-05-02',
  },
  {
    id: '5', no: 5, messageGroup: 'MSG',
    messageCode: 'MSG_DELETE_SUCCESS',
    texts: { KO: '삭제되었습니다.', EN: 'Deleted successfully.', JA: '削除されました。' },
    isUsed: true, author: 'admin1', createdAt: '2024-05-04', updatedAt: '2024-05-04',
  },
  {
    id: '6', no: 6, messageGroup: 'CONFIRM',
    messageCode: 'CONFIRM_DELETE',
    texts: { KO: '정말 삭제하시겠습니까?', EN: 'Are you sure you want to delete?', JA: '本当に削除しますか？' },
    isUsed: true, author: 'admin2', createdAt: '2024-05-05', updatedAt: '2024-05-05',
  },
  {
    id: '7', no: 7, messageGroup: 'CONFIRM',
    messageCode: 'CONFIRM_LOGOUT',
    texts: { KO: '로그아웃 하시겠습니까?', EN: 'Are you sure you want to log out?', JA: 'ログアウトしますか？' },
    isUsed: false, author: 'admin2', createdAt: '2024-05-06', updatedAt: '2024-05-06',
  },
];

export default function MessageManagement() {
  const location = useLocation();
  const [data, setData] = useState<MessageData[]>(mockMessages);
  const [groups, setGroups] = useState<MessageGroup[]>(mockGroups);
  const [activeGroup, setActiveGroup] = useState<string>('ERR');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Group editing
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  // Table selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editItem, setEditItem] = useState<MessageData | null>(null);
  const [formData, setFormData] = useState<Partial<MessageData>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setIsAddingNew(true);
      setFormData({});
      setIsModalOpen(true);
    }
  }, []);

  // Filtered groups (by search keyword)
  const filteredGroups = groups.filter(g => {
    if (!searchKeyword) return true;
    const kw = searchKeyword.toLowerCase();
    const matchesGroup = g.name.toLowerCase().includes(kw) || g.description.toLowerCase().includes(kw);
    const matchesCodes = data.some(d => d.messageGroup === g.name && (
      d.messageCode.toLowerCase().includes(kw) ||
      Object.values(d.texts).some(t => (t as string).toLowerCase().includes(kw))
    ));
    return matchesGroup || matchesCodes;
  });

  // Messages in active group
  const activeGroupData = data.filter(d => d.messageGroup === activeGroup);

  // Bulk status toggle
  const handleBatchToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('변경할 메시지를 선택해주세요.');
      return;
    }
    setData(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, isUsed: !d.isUsed } : d));
    setSelectedIds([]);
  };

  // Group status toggle
  const handleGroupStatusToggle = (groupName: string) => {
    setGroups(prev => prev.map(g => g.name === groupName ? { ...g, isUsed: !g.isUsed } : g));
  };

  // Table select
  const toggleSelectAll = () => {
    if (selectedIds.length === activeGroupData.length && activeGroupData.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeGroupData.map(d => d.id));
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Group add/edit
  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      alert('그룹명을 입력해주세요.');
      return;
    }
    if (editingGroup) {
      if (groups.some(g => g.name === newGroupName.trim() && g.name !== editingGroup)) {
        alert('이미 존재하는 그룹명입니다.');
        return;
      }
      setGroups(prev => prev.map(g => g.name === editingGroup
        ? { ...g, name: newGroupName.trim(), description: newGroupDesc.trim() }
        : g
      ));
      setData(prev => prev.map(d => d.messageGroup === editingGroup ? { ...d, messageGroup: newGroupName.trim() } : d));
      if (activeGroup === editingGroup) setActiveGroup(newGroupName.trim());
      setEditingGroup(null);
    } else {
      if (groups.some(g => g.name === newGroupName.trim())) {
        alert('이미 존재하는 그룹명입니다.');
        return;
      }
      setGroups(prev => [...prev, { name: newGroupName.trim(), description: newGroupDesc.trim(), isUsed: true }]);
      setActiveGroup(newGroupName.trim());
    }
    setNewGroupName('');
    setNewGroupDesc('');
    setIsAddingGroup(false);
  };

  const startEditGroup = (group: MessageGroup) => {
    setEditingGroup(group.name);
    setNewGroupName(group.name);
    setNewGroupDesc(group.description);
    setIsAddingGroup(true);
  };

  // Modal open
  const handleOpenAddModal = () => {
    if (!activeGroup) { alert('그룹을 먼저 선택해주세요.'); return; }
    setIsAddingNew(true);
    setEditItem(null);
    const initTexts: Record<string, string> = {};
    mockLangCodes.forEach(l => initTexts[l.code] = '');
    setFormData({ messageGroup: activeGroup, messageCode: '', texts: initTexts, isUsed: true });
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedIds.length !== 1) { alert('수정할 메시지를 1개만 선택해주세요.'); return; }
    const target = data.find(d => d.id === selectedIds[0]);
    if (target) {
      setIsAddingNew(false);
      setEditItem(target);
      setFormData({ ...target });
      setIsDirty(false);
      setIsModalOpen(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.messageCode?.trim()) { alert('메시지 코드를 입력해주세요.'); return; }
    if (!formData?.texts?.['KO']?.trim()) { alert('한국어 내용을 입력해주세요.'); return; }

    if (isAddingNew) {
      const isDuplicate = data.some(d => d.messageCode === formData.messageCode?.trim());
      if (isDuplicate) { alert('이미 존재하는 메시지 코드입니다.'); return; }
      const newObj: MessageData = {
        id: Math.random().toString(36).substring(2, 9),
        no: data.length + 1,
        messageGroup: activeGroup,
        messageCode: formData.messageCode!.trim(),
        texts: formData.texts as Record<string, string>,
        isUsed: formData.isUsed !== undefined ? formData.isUsed : true,
        author: 'admin1',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setData(prev => [newObj, ...prev]);
    } else if (editItem) {
      setData(prev => prev.map(d => d.id === editItem.id
        ? { ...d, ...formData, updatedAt: new Date().toISOString().split('T')[0] } as MessageData
        : d
      ));
    }
    setIsModalOpen(false);
    setIsDirty(false);
    setSelectedIds([]);
    alert(isAddingNew ? '등록되었습니다.' : '저장되었습니다.');
  };

  const handleCloseModal = () => {
    if (isDirty) setShowUnsavedWarning(true);
    else setIsModalOpen(false);
  };

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  return (
    <PageLayout className="space-y-6 flex flex-col">
      {/* Search Area */}
      <SearchBar onSearch={() => {}} onReset={() => setSearchKeyword('')}>
        <SearchBar.Field label="검색어">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="그룹명, 메시지 코드 또는 내용 입력"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ width: '100%', paddingRight: '2.5rem' }}
            />
            <Search className="w-4 h-4 text-text-sub absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </SearchBar.Field>
      </SearchBar>

      {/* Main Content Area */}
      <div className="flex gap-6 min-h-[600px]">

        {/* Left: Message Group List */}
        <div className="w-80 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-[1px] border-text-main h-10">
            <h3 className="text-body-lg font-bold text-text-main">메시지 그룹</h3>
            <button
              onClick={() => { setEditingGroup(null); setNewGroupName(''); setNewGroupDesc(''); setIsAddingGroup(true); }}
              className="flex items-center gap-1 text-caption bg-primary text-white px-3 h-7 rounded-md hover:bg-primary-hover transition-colors font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              등록
            </button>
          </div>

          <div className="bg-white border border-border-gray rounded-lg overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-y-auto max-h-[600px]">
              <AnimatePresence mode="wait">
                {isAddingGroup && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 border-b border-border-gray bg-bg-gray space-y-2"
                  >
                    <input
                      autoFocus
                      type="text"
                      className="w-full h-[36px] px-3 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary transition-all font-mono tracking-tight"
                      placeholder={editingGroup ? '그룹명 수정' : '신규 그룹명 (예: WARN)'}
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddGroup(); if (e.key === 'Escape') setIsAddingGroup(false); }}
                    />
                    <input
                      type="text"
                      className="w-full h-[34px] px-3 bg-white border border-border-input rounded-md text-body-sm text-text-main outline-none focus:border-primary transition-all"
                      placeholder="설명 (선택사항)"
                      value={newGroupDesc}
                      onChange={e => setNewGroupDesc(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setIsAddingGroup(false); setEditingGroup(null); setNewGroupName(''); setNewGroupDesc(''); }}
                        className="text-caption text-text-sub hover:text-text-body font-bold px-2 py-1"
                      >취소</button>
                      <button
                        onClick={handleAddGroup}
                        className="text-caption text-primary hover:text-primary-hover font-bold px-2 py-1"
                      >저장</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="divide-y divide-[#E5E8EB]">
                {filteredGroups.map(group => (
                  <div
                    key={group.name}
                    className={`group relative flex flex-col transition-colors cursor-pointer ${
                      activeGroup === group.name ? 'bg-primary/5' : 'hover:bg-bg-muted/25'
                    }`}
                    onClick={() => { setActiveGroup(group.name); setSelectedIds([]); }}
                  >
                    {activeGroup === group.name && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="flex items-center justify-between px-4 py-4">
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-body font-semibold truncate font-mono ${activeGroup === group.name ? 'text-primary' : 'text-text-main'}`}>
                            {group.name}
                          </span>
                          {!group.isUsed && (
                            <span className="text-caption bg-bg-muted text-text-sub px-1.5 py-0.5 rounded-md border border-border-gray font-medium shrink-0">미사용</span>
                          )}
                        </div>
                        {group.description && (
                          <p className="text-caption text-text-sub truncate">{group.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); startEditGroup(group); }}
                          className="px-2 py-1 text-caption text-text-body hover:text-text-main hover:bg-bg-muted rounded-md transition-colors font-medium border border-border-input"
                        >수정</button>
                        <button
                          onClick={e => { e.stopPropagation(); handleGroupStatusToggle(group.name); }}
                          className={`px-2 py-1 text-caption rounded-md transition-colors font-medium border ${
                            group.isUsed
                              ? 'text-status-error border-status-error/20 hover:bg-status-error/10'
                              : 'text-primary border-primary/20 hover:bg-primary/10'
                          }`}
                        >{group.isUsed ? '미사용' : '사용'}</button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredGroups.length === 0 && (
                  <div className="py-20 text-center text-text-sub text-body-sm">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Table */}
        <div className="flex-1 flex flex-col space-y-3">
          <div className="flex items-center pb-2 border-b-[1px] border-text-main h-10">
            <span className="text-body-lg font-bold text-text-main font-mono">{activeGroup || '그룹 선택'}</span>
            <div className="w-[1px] h-3 bg-border-gray mx-3" />
            <span className="text-text-sub text-body-sm font-normal">메시지 목록</span>
          </div>

          {/* Table Controls */}
          <DataTable.Controls total={activeGroupData.length}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              disabled={!activeGroup}
            >등록</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenEditModal}
              disabled={!activeGroup || selectedIds.length !== 1}
            >수정</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBatchToggleUse}
              disabled={selectedIds.length === 0}
            >사용여부 변경</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExcelDownload}
              disabled={!activeGroup}
            >엑셀 다운로드</Button>
          </DataTable.Controls>

          <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                    <th className="h-[52px] px-4 text-center w-12 border-r border-border-gray">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border-input accent-[#008d75] cursor-pointer"
                        checked={activeGroupData.length > 0 && selectedIds.length === activeGroupData.length}
                        onChange={toggleSelectAll}
                        disabled={activeGroupData.length === 0}
                      />
                    </th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center w-14 border-r border-border-gray">No</th>
                    <th className="h-[52px] px-4 text-body font-semibold w-48 border-r border-border-gray">메시지 코드</th>
                    <th className="h-[52px] px-4 text-body font-semibold min-w-[180px] border-r border-border-gray">한국어 (KO)</th>
                    <th className="h-[52px] px-4 text-body font-semibold min-w-[160px] border-r border-border-gray">영어 (EN)</th>
                    <th className="h-[52px] px-4 text-body font-semibold min-w-[160px] border-r border-border-gray">일본어 (JA)</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center w-28">사용여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8EB]">
                  {activeGroupData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-40 text-center text-text-sub text-body">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                          <RotateCcw className="w-10 h-10 text-border-input" />
                          <p className="font-medium">
                            {activeGroup ? '등록된 메시지가 없습니다.' : '메시지를 보실 그룹을 목록에서 선택해주세요.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activeGroupData.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`h-[52px] transition-colors hover:bg-bg-gray cursor-pointer ${
                          !item.isUsed ? 'bg-bg-gray/50' : 'bg-white'
                        } ${selectedIds.includes(item.id) ? 'bg-primary/5' : ''}`}
                        onClick={() => toggleSelect(item.id)}
                        onDoubleClick={() => {
                          setSelectedIds([item.id]);
                          const target = data.find(d => d.id === item.id);
                          if (target) {
                            setIsAddingNew(false);
                            setEditItem(target);
                            setFormData({ ...target });
                            setIsDirty(false);
                            setIsModalOpen(true);
                          }
                        }}
                      >
                        <td className="px-4 text-center border-r border-border-gray">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border-input accent-[#008d75] cursor-pointer"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 text-center border-r border-border-gray">
                          <span className="text-body-sm text-text-sub">{idx + 1}</span>
                        </td>
                        <td className="px-4 border-r border-border-gray">
                          <span className="text-body font-semibold text-text-main font-mono tracking-tight">{item.messageCode}</span>
                        </td>
                        <td className="px-4 border-r border-border-gray">
                          <span className="text-body text-text-main truncate max-w-[200px] block" title={item.texts['KO']}>
                            {item.texts['KO'] || '-'}
                          </span>
                        </td>
                        <td className="px-4 border-r border-border-gray">
                          <span className="text-body text-text-body truncate max-w-[180px] block" title={item.texts['EN']}>
                            {item.texts['EN'] || '-'}
                          </span>
                        </td>
                        <td className="px-4 border-r border-border-gray">
                          <span className="text-body text-text-body truncate max-w-[180px] block" title={item.texts['JA']}>
                            {item.texts['JA'] || '-'}
                          </span>
                        </td>
                        <td className="px-4 text-center">
                          <StatusBadge status={item.isUsed ? 'ON' : 'OFF'} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[600px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 h-[56px] border-b border-border-gray flex items-center justify-between bg-white shrink-0">
                <h3 className="font-semibold text-title-sm text-text-main">
                  {isAddingNew ? '메시지 등록' : '메시지 수정'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 text-text-sub hover:text-text-main transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto w-full space-y-8">
                <form onSubmit={handleSave} className="space-y-8">
                  {/* 기본 설정 */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <h4 className="text-body font-semibold text-text-main">기본 설정</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-body font-semibold text-text-main">
                          메시지 그룹 <span className="text-status-error">*</span>
                        </label>
                        <input
                          type="text"
                          disabled
                          value={formData?.messageGroup || ''}
                          className="w-full h-[36px] px-3 bg-bg-gray border border-border-gray rounded-md text-body text-text-sub outline-none cursor-not-allowed font-mono tracking-tight"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-body font-semibold text-text-main">
                          메시지 코드 <span className="text-status-error">*</span>
                        </label>
                        <input
                          type="text"
                          disabled={!isAddingNew}
                          value={formData?.messageCode || ''}
                          onChange={e => { setFormData({ ...formData, messageCode: e.target.value }); setIsDirty(true); }}
                          className={`w-full h-[36px] px-3 border rounded-md text-body outline-none transition-all font-mono tracking-tight ${
                            !isAddingNew
                              ? 'bg-bg-gray border-border-gray text-text-sub cursor-not-allowed'
                              : 'bg-white border-border-input text-text-main focus:border-primary'
                          }`}
                          placeholder="예: ERR_LOGIN_001"
                          required
                        />
                      </div>
                    </div>
                    <div className="">
                      <label className="block text-body font-semibold text-text-main mb-2">사용 여부</label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="modalIsUsed"
                            checked={formData?.isUsed === true}
                            onChange={() => { setFormData({ ...formData, isUsed: true }); setIsDirty(true); }}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-body text-text-body group-hover:text-text-main">사용</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="modalIsUsed"
                            checked={formData?.isUsed === false}
                            onChange={() => { setFormData({ ...formData, isUsed: false }); setIsDirty(true); }}
                            className="w-4 h-4 accent-[#008d75]"
                          />
                          <span className="text-body text-text-body group-hover:text-text-main">미사용</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 다국어 정보 입력 */}
                  <div className="space-y-6 pt-4 border-t border-border-gray">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <h4 className="text-body font-semibold text-text-main">다국어 정보 입력</h4>
                    </div>
                    <div className="space-y-5">
                      {mockLangCodes.map(lang => (
                        <div key={lang.code} className="space-y-1.5">
                          <label className="text-body font-semibold text-text-main block">
                            {lang.name} ({lang.code})
                            {lang.code === 'KO' && <span className="text-status-error ml-1">*</span>}
                          </label>
                          <textarea
                            rows={2}
                            value={formData?.texts?.[lang.code] || ''}
                            onChange={e => {
                              const newTexts = { ...formData?.texts, [lang.code]: e.target.value };
                              setFormData({ ...formData, texts: newTexts as Record<string, string> });
                              setIsDirty(true);
                            }}
                            className="w-full px-4 py-3 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary transition-all resize-none placeholder-[#8B95A1]"
                            placeholder={`${lang.name} 내용을 입력하세요.`}
                            required={lang.code === 'KO'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="h-[72px] px-6 border-t border-border-gray bg-bg-gray flex items-center justify-center gap-3 shrink-0">
                <Button
                  variant="secondary"
                  size="md"
                  style={{ width: 120 }}
                  type="button"
                  onClick={handleCloseModal}
                >취소</Button>
                <Button
                  variant="primary"
                  size="md"
                  style={{ width: 120 }}
                  onClick={handleSave}
                >{isAddingNew ? '등록하기' : '저장하기'}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unsaved Warning Modal */}
      <ConfirmModal
        open={showUnsavedWarning}
        variant="warning"
        title="저장되지 않은 변경사항"
        description={`현재 입력한 내용이 유실될 수 있습니다.\n그래도 닫으시겠습니까?`}
        confirmLabel="닫기"
        cancelLabel="계속 작성"
        onConfirm={() => {
          setShowUnsavedWarning(false);
          setIsModalOpen(false);
          setIsDirty(false);
        }}
        onCancel={() => setShowUnsavedWarning(false)}
      />
    </PageLayout>
  );
}