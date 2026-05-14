import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Plus, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button, SearchBar, DataTable, StatusBadge, PageLayout, ConfirmModal, Input } from './ui';

interface CodeData {
  id: string;
  codeGroup: string;
  codeValue: string;
  codeName: string;
  description: string;
  isUsed: boolean;
  updatedAt: string;
}

interface GroupData {
  name: string;
  isUsed: boolean;
  description?: string;
}

const mockGroups: GroupData[] = [
  { name: 'SYS_STATUS', isUsed: true, description: '시스템 상태 그룹' },
  { name: 'USER_ROLE', isUsed: true, description: '사용자 권한 그룹' },
  { name: 'ERR_CODE', isUsed: false, description: '에러 코드 그룹' },
  { name: 'BANK_CODE', isUsed: true, description: '은행 코드 그룹' },
];

const mockData: CodeData[] = [
  { id: '1', codeGroup: 'SYS_STATUS', codeValue: 'ACTIVE', codeName: '정상', description: '시스템 정상 상태', isUsed: true, updatedAt: '2024-03-20' },
  { id: '2', codeGroup: 'SYS_STATUS', codeValue: 'INACTIVE', codeName: '중지', description: '시스템 중지 상태', isUsed: true, updatedAt: '2024-03-20' },
  { id: '3', codeGroup: 'USER_ROLE', codeValue: 'ADMIN', codeName: '관리자', description: '시스템 관리자 권한', isUsed: true, updatedAt: '2024-03-19' },
  { id: '4', codeGroup: 'USER_ROLE', codeValue: 'USER', codeName: '일반사용자', description: '일반 사용자 권한', isUsed: true, updatedAt: '2024-03-19' },
  { id: '5', codeGroup: 'ERR_CODE', codeValue: 'E001', codeName: '필수값 누락', description: '필수 파라미터 누락 오류', isUsed: false, updatedAt: '2024-03-18' },
  { id: '6', codeGroup: 'BANK_CODE', codeValue: '001', codeName: '한국은행', description: '한국은행 코드', isUsed: false, updatedAt: '2024-03-18' },
  { id: '7', codeGroup: 'BANK_CODE', codeValue: '002', codeName: '산업은행', description: 'KDB산업은행', isUsed: false, updatedAt: '2024-03-18' },
  { id: '8', codeGroup: 'BANK_CODE', codeValue: '003', codeName: '기업은행', description: 'IBK기업은행', isUsed: true, updatedAt: '2024-03-18' },
  { id: '9', codeGroup: 'BANK_CODE', codeValue: '004', codeName: '국민은행', description: 'KB국민은행', isUsed: true, updatedAt: '2024-03-18' },
  { id: '10', codeGroup: 'BANK_CODE', codeValue: '007', codeName: '수협은행', description: 'Sh수협은행', isUsed: true, updatedAt: '2024-03-18' },
];

export default function CodeManagement() {
  const location = useLocation();
  const [data, setData] = useState<CodeData[]>(mockData);
  const [groups, setGroups] = useState<GroupData[]>(mockGroups);
  const [activeGroup, setActiveGroup] = useState<string>('SYS_STATUS');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Group Code related state
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  // Detailed Code related state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CodeData | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setIsModalOpen(true);
    }
  }, []);
  const [formData, setFormData] = useState<Partial<CodeData>>({
    codeGroup: '',
    codeValue: '',
    codeName: '',
    description: '',
    isUsed: true
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const filteredGroups = groups.filter((g) => {
    if (!searchKeyword) return true;
    const matchesGroup = g.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCodes = data.some(d => d.codeGroup === g.name && (
      d.codeValue.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      d.codeName.toLowerCase().includes(searchKeyword.toLowerCase())
    ));
    return matchesGroup || matchesCodes;
  });

  React.useEffect(() => {
    if (activeGroup === '' && filteredGroups.length > 0) {
      setActiveGroup(filteredGroups[0].name);
    }
  }, [filteredGroups, activeGroup]);

  const activeGroupData = data.filter(d => d.codeGroup === activeGroup);

  const toggleSelectAll = () => {
    if (selectedIds.length === activeGroupData.length && activeGroupData.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeGroupData.map(d => d.id));
    }
  };

  const handleBatchToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('변경할 코드를 선택해주세요.');
      return;
    }
    setData(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, isUsed: !d.isUsed } : d));
    setSelectedIds([]);
  };

  const handleGroupStatusToggle = (groupName: string) => {
    setGroups(prev => prev.map(g => g.name === groupName ? { ...g, isUsed: !g.isUsed } : g));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenAddModal = () => {
    if (!activeGroup) {
      alert('그룹을 먼저 선택해주세요.');
      return;
    }
    setEditItem(null);
    setFormData({
      codeGroup: activeGroup,
      codeValue: '',
      codeName: '',
      description: '',
      isUsed: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedIds.length !== 1) {
      alert('수정할 코드를 1개만 선택해주세요.');
      return;
    }
    const target = data.find(d => d.id === selectedIds[0]);
    if (target) {
      setEditItem(target);
      setFormData(target);
      setIsModalOpen(true);
    }
  };

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  const handleCloseModal = () => {
    const isChanged = editItem
      ? (editItem.codeName !== formData.codeName || editItem.description !== formData.description || editItem.isUsed !== formData.isUsed)
      : (formData.codeValue || formData.codeName || formData.description);

    if (isChanged && !showUnsavedWarning) {
      setShowUnsavedWarning(true);
    } else {
      setShowUnsavedWarning(false);
      setIsModalOpen(false);
    }
  };

  const saveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codeGroup || !formData.codeValue || !formData.codeName) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (!editItem) {
      const isDuplicate = data.some(d => d.codeGroup === formData.codeGroup && d.codeValue === formData.codeValue);
      if (isDuplicate) {
        alert('동일한 그룹에 동일한 코드값이 이미 존재합니다.');
        return;
      }
    }

    if (editItem) {
      setData(data.map(d => d.id === editItem.id ? { ...d, ...formData } as CodeData : d));
      alert('수정되었습니다.');
    } else {
      const newId = String(Date.now());
      setData([{ ...formData, id: newId, updatedAt: new Date().toISOString().split('T')[0] } as CodeData, ...data]);
      alert('등록되었습니다.');
    }

    setIsModalOpen(false);
    setSelectedIds([]);
  };

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
      setGroups(prev => prev.map(g => g.name === editingGroup ? { ...g, name: newGroupName.trim() } : g));
      setData(prev => prev.map(d => d.codeGroup === editingGroup ? { ...d, codeGroup: newGroupName.trim() } : d));
      setActiveGroup(newGroupName.trim());
      setEditingGroup(null);
    } else {
      if (groups.some(g => g.name === newGroupName.trim())) {
        alert('이미 존재하는 그룹명입니다.');
        return;
      }
      setGroups(prev => [...prev, { name: newGroupName.trim(), isUsed: true }]);
      setActiveGroup(newGroupName.trim());
    }

    setNewGroupName('');
    setIsAddingGroup(false);
  };

  const startEditGroup = (groupName: string) => {
    setEditingGroup(groupName);
    setNewGroupName(groupName);
    setIsAddingGroup(true);
  };

  return (
    <PageLayout>
      {/* Search Area */}
      <SearchBar
        onSearch={() => {}}
        onReset={() => setSearchKeyword('')}
      >
        <SearchBar.Field label="검색어">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="그룹명, 코드명, 코드값 입력"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && alert('조회하기')}
              style={{ width: 360, paddingRight: 40 }}
            />
            <Search className="w-4 h-4 text-text-sub absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </SearchBar.Field>
      </SearchBar>

      {/* Main Content Area: Master-Detail Layout */}
      <div className="flex gap-6 min-h-[600px]">
        {/* Left: Group Code List */}
        <div className="w-80 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-[1px] border-text-main h-10">
            <h3 className="text-body-lg font-bold text-text-main">그룹 코드</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingGroup(null);
                setNewGroupName('');
                setIsAddingGroup(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              등록
            </Button>
          </div>

          <div className="bg-white border border-border-gray rounded-lg overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-y-auto max-h-[600px]">
              <AnimatePresence mode="wait">
                {isAddingGroup && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 border-b border-border-gray bg-bg-gray space-y-3"
                  >
                    <input
                      autoFocus
                      type="text"
                      className="w-full h-[36px] px-3 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary transition-all"
                      placeholder={editingGroup ? "그룹명 수정" : "신규 그룹명 입력"}
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddGroup();
                        if (e.key === 'Escape') setIsAddingGroup(false);
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setIsAddingGroup(false);
                          setEditingGroup(null);
                          setNewGroupName('');
                        }}
                        className="text-caption text-text-sub hover:text-text-body font-bold px-2 py-1"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleAddGroup}
                        className="text-caption text-primary hover:text-primary-hover font-bold px-2 py-1"
                      >
                        저장
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="divide-y divide-[#E5E8EB]">
                {filteredGroups.map(group => (
                  <div
                    key={group.name}
                    className={`group relative flex flex-col transition-colors cursor-pointer ${
                      activeGroup === group.name
                        ? 'bg-primary/5'
                        : 'hover:bg-bg-muted/25'
                    }`}
                    onClick={() => {
                      setActiveGroup(group.name);
                      setSelectedIds([]);
                    }}
                  >
                    {activeGroup === group.name && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    )}
                    <div className="flex items-center justify-between px-4 py-4">
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-body font-medium truncate ${activeGroup === group.name ? 'text-primary' : 'text-text-main'}`}>
                            {group.name}
                          </span>
                          {!group.isUsed && (
                            <span className="text-caption bg-bg-muted text-text-sub px-1.5 py-0.5 rounded-md border border-border-gray font-medium">미사용</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                             e.stopPropagation();
                             startEditGroup(group.name);
                          }}
                          className="px-2 py-1 text-caption text-text-body hover:text-text-main hover:bg-bg-muted rounded-md transition-colors font-medium border border-border-input"
                        >
                          수정
                        </button>
                        <button
                          onClick={(e) => {
                             e.stopPropagation();
                             handleGroupStatusToggle(group.name);
                          }}
                          className={`px-2 py-1 text-caption rounded-md transition-colors font-medium border ${
                             group.isUsed
                               ? 'text-status-error border-status-error/20 hover:bg-status-error/10'
                               : 'text-primary border-primary/20 hover:bg-primary/10'
                          }`}
                        >
                          {group.isUsed ? '미사용' : '사용'}
                        </button>
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

        {/* Right: Detailed Code Table */}
        <div className="flex-1 flex flex-col space-y-3">
          <div className="flex items-center pb-2 border-b-[1px] border-text-main h-10">
            <span className="text-body-lg font-bold text-text-main">{activeGroup || '그룹 선택'}</span>
            <div className="w-[1px] h-3 bg-border-gray mx-3"></div>
            <span className="text-text-sub text-body-sm font-normal">상세 코드</span>
          </div>

          {/* Table Controls */}
          <DataTable.Controls total={activeGroupData.length}>
            <Button variant="primary" size="sm" disabled={!activeGroup} onClick={handleOpenAddModal}>등록</Button>
            <Button variant="ghost" size="sm" disabled={!activeGroup || selectedIds.length !== 1} onClick={handleOpenEditModal}>수정</Button>
            <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleBatchToggleUse}>사용여부 변경</Button>
            <Button variant="ghost" size="sm" disabled={!activeGroup} onClick={handleExcelDownload}>엑셀 다운로드</Button>
          </DataTable.Controls>

          <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                    <th className="h-[52px] px-4 text-center w-16 border-r border-border-gray">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 accent-[#008d75] cursor-pointer"
                        checked={activeGroupData.length > 0 && selectedIds.length === activeGroupData.length}
                        onChange={toggleSelectAll}
                        disabled={activeGroupData.length === 0}
                      />
                    </th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center w-40 border-r border-border-gray">코드값</th>
                    <th className="h-[52px] px-4 text-body font-semibold w-48 border-r border-border-gray">코드명</th>
                    <th className="h-[52px] px-4 text-body font-semibold min-w-[200px] border-r border-border-gray">설명</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center w-32 border-b border-border-gray">사용여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8EB]">
                  {activeGroupData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-40 text-center text-text-sub text-body">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                          <RotateCcw className="w-10 h-10 text-border-input" />
                          <p className="font-medium">{activeGroup ? '등록된 상세 코드가 없습니다.' : '상세 코드를 보실 그룹을 목록에서 선택해주세요.'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activeGroupData.map((item) => (
                      <tr
                        key={item.id}
                        className={`cursor-pointer h-[52px] transition-colors hover:bg-bg-gray ${!item.isUsed ? 'bg-bg-gray/50' : 'bg-white'} ${selectedIds.includes(item.id) ? 'bg-primary/5' : ''}`}
                        onClick={() => toggleSelect(item.id)}
                        onDoubleClick={() => { setSelectedIds([item.id]); handleOpenEditModal(); }}
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
                        <td className="px-4 text-center border-r border-border-gray">
                          <span className="text-body font-semibold text-text-main font-mono tracking-tight">{item.codeValue}</span>
                        </td>
                        <td className="px-4 border-r border-border-gray">
                          <span className="text-body text-text-main font-medium">{item.codeName}</span>
                        </td>
                        <td className="px-4 border-r border-border-gray">
                          <span className="text-body text-text-body truncate max-w-xs block" title={item.description}>{item.description || '-'}</span>
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

      {/* Modal / Popup for Detailed Code */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
            >
              <div className="px-6 h-[56px] border-b border-border-gray flex items-center justify-between bg-white shrink-0">
                <h3 className="font-semibold text-title-sm text-text-main">{editItem ? '코드 수정' : '신규 상세 코드 등록'}</h3>
                <button type="button" onClick={handleCloseModal} className="p-2 text-text-sub hover:text-text-main transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto w-full space-y-6">
                <form onSubmit={saveForm} className="space-y-6">
                  {/* 코드 그룹 정보 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-4 bg-primary rounded-full"></div>
                       <h4 className="text-body font-semibold text-text-main">상세 코드 정보</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-body font-semibold text-text-main">코드 그룹 <span className="text-status-error">*</span></label>
                        <input
                          required
                          type="text"
                          disabled
                          className="w-full h-[36px] px-3 bg-bg-gray border border-border-gray rounded-md text-body text-text-sub outline-none cursor-not-allowed font-mono"
                          value={formData.codeGroup}
                        />
                      </div>

                      <div className="space-y-1.5">
                         <label className="block text-body font-semibold text-text-main">코드값 <span className="text-status-error">*</span></label>
                         <input
                           required
                           type="text"
                           disabled={!!editItem}
                           className={`w-full h-[36px] px-3 border rounded-md text-body outline-none transition-all font-mono tracking-tight ${editItem ? 'bg-bg-gray border-border-gray text-text-sub cursor-not-allowed' : 'bg-white border-border-input text-text-main focus:border-primary'}`}
                           placeholder="예: ACTIVE"
                           value={formData.codeValue}
                           onChange={e => setFormData({...formData, codeValue: e.target.value})}
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="block text-body font-semibold text-text-main">코드명 <span className="text-status-error">*</span></label>
                         <input
                           required
                           type="text"
                           className="w-full h-[36px] px-3 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary transition-all"
                           placeholder="예: 정상"
                           value={formData.codeName}
                           onChange={e => setFormData({...formData, codeName: e.target.value})}
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="block text-body font-semibold text-text-main">설명</label>
                         <textarea
                           rows={3}
                           className="w-full px-4 py-3 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary transition-all resize-none placeholder-[#8B95A1]"
                           placeholder="코드에 대한 설명을 입력하세요."
                           value={formData.description}
                           onChange={e => setFormData({...formData, description: e.target.value})}
                         />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-border-gray mt-2 pt-4">
                         <input
                           type="checkbox"
                           id="isUsed"
                           className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 accent-[#008d75] cursor-pointer"
                           checked={formData.isUsed}
                           onChange={e => setFormData({...formData, isUsed: e.target.checked})}
                         />
                         <label htmlFor="isUsed" className="text-body text-text-body font-medium cursor-pointer hover:text-text-main transition-colors">이 코드 사용</label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="h-[72px] px-6 border-t border-border-gray bg-bg-gray flex items-center justify-center gap-3 shrink-0">
                <Button variant="secondary" size="md" style={{ width: 120 }} onClick={handleCloseModal}>취소</Button>
                <Button variant="primary" size="md" style={{ width: 120 }} onClick={saveForm as any}>
                  {editItem ? '저장하기' : '등록하기'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Warning Modal */}
      <ConfirmModal
        open={showUnsavedWarning}
        variant="warning"
        title="저장되지 않은 변경사항"
        description={"현재 입력한 내용이 유실될 수 있습니다.\n그래도 닫으시겠습니까?"}
        confirmLabel="닫기"
        cancelLabel="계속 작성"
        onConfirm={() => { setShowUnsavedWarning(false); setIsModalOpen(false); }}
        onCancel={() => setShowUnsavedWarning(false)}
      />
    </PageLayout>
  );
}
