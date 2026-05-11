import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Folder, FolderOpen, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button, DataTable, PageLayout, StatusBadge, Input } from './ui';

interface Menu {
  id: string;
  no: number;
  name: string;
  isUsed: boolean;
  parentId: string | null;
  hasChildren?: boolean;
}

const initialData: Menu[] = [
  { id: '1', no: 1, name: 'ROOT', isUsed: true, parentId: null, hasChildren: true },
  { id: '2', no: 2, name: '결재', isUsed: true, parentId: '1', hasChildren: true },
  { id: '3', no: 3, name: '결재관리', isUsed: true, parentId: '2', hasChildren: true },
  { id: '4', no: 4, name: '결재진행', isUsed: true, parentId: '3', hasChildren: false },
  { id: '5', no: 5, name: '결재완료', isUsed: true, parentId: '3', hasChildren: false },
  { id: '6', no: 6, name: '내역관리/리포트', isUsed: true, parentId: '1', hasChildren: true },
  { id: '7', no: 7, name: '거래내역관리', isUsed: true, parentId: '6', hasChildren: true },
  { id: '8', no: 8, name: '원화입출금내역', isUsed: false, parentId: '7', hasChildren: false },
  { id: '9', no: 9, name: '외화입출금내역', isUsed: false, parentId: '7', hasChildren: false },
  { id: '10', no: 10, name: '가상계좌수신내역', isUsed: true, parentId: '7', hasChildren: false },
  { id: '11', no: 110, name: '외담대내역', isUsed: true, parentId: '7', hasChildren: false },
  { id: '12', no: 111, name: '리포트', isUsed: true, parentId: '6', hasChildren: true },
  { id: '13', no: 112, name: '자금일보', isUsed: true, parentId: '12', hasChildren: false },
];

export default function MenuManagement() {
  const location = useLocation();
  const [data, setData] = useState<Menu[]>(initialData);
  const [expandedIds, setExpandedIds] = useState<string[]>(['1', '2', '3', '6', '7', '12']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Menu | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsUsed, setEditIsUsed] = useState(true);

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      const first = initialData.find(m => m.parentId !== null) ?? initialData[0];
      setEditItem(first);
      setEditName(first.name);
      setEditIsUsed(first.isUsed);
      setIsEditModalOpen(true);
    }
  }, []);

  // Computed rows
  const getRenderableRows = () => {
    const result: (Menu & { level: number })[] = [];
    const levelMap = new Map<string, number>();

    levelMap.set('null', -1);

    for (const item of data) {
      const parentLevel = item.parentId === null ? -1 : (levelMap.get(item.parentId) ?? 0);
      const level = parentLevel + 1;
      levelMap.set(item.id, level);

      let isVisible = true;
      let currParent = item.parentId;
      while(currParent !== null) {
        if (!expandedIds.includes(currParent)) {
          isVisible = false;
          break;
        }
        const pItem = data.find(d => d.id === currParent);
        currParent = pItem ? pItem.parentId : null;
      }

      if (isVisible) {
        result.push({ ...item, level });
      }
    }
    return result;
  };

  const renderableRows = getRenderableRows();

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(ex => ex !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(renderableRows.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('사용여부를 변경할 메뉴를 선택해주세요.');
      return;
    }
    if (window.confirm(`선택한 ${selectedIds.length}개 메뉴의 사용여부를 변경하시겠습니까?\n(상위 메뉴 미사용 시 하위 메뉴도 함께 미사용 처리됩니다.)`)) {
      setData(prev => {
        let newData = [...prev];
        const updatedIds = new Set<string>();

        // Function to find all children IDs
        const getAllDescendantIds = (parentId: string, result: string[] = []) => {
          const children = prev.filter(d => d.parentId === parentId);
          children.forEach(child => {
            result.push(child.id);
            getAllDescendantIds(child.id, result);
          });
          return result;
        };

        selectedIds.forEach(id => {
          const item = prev.find(d => d.id === id);
          if (!item) return;

          const nextIsUsed = !item.isUsed;

          // Update the item itself
          newData = newData.map(d => d.id === id ? { ...d, isUsed: nextIsUsed } : d);

          // If turning OFF, turn off all descendants
          if (!nextIsUsed) {
            const descendants = getAllDescendantIds(id);
            newData = newData.map(d => descendants.includes(d.id) ? { ...d, isUsed: false } : d);
          }
        });

        return newData;
      });
      setSelectedIds([]);
      alert('변경되었습니다.');
    }
  };

  const handleOpenEdit = () => {
    if (selectedIds.length === 0) {
      alert('수정할 메뉴를 선택해주세요.');
      return;
    }
    if (selectedIds.length > 1) {
      alert('수정은 다건 선택을 지원하지 않습니다. 1개 항목만 선택해주세요.');
      return;
    }
    const item = data.find(d => d.id === selectedIds[0]);
    if (item) {
      setEditItem(item);
      setEditName(item.name);
      setEditIsUsed(item.isUsed);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editItem) return;

    // Validation
    if (!editName.trim()) {
      alert('메뉴명을 입력해주세요.');
      return;
    }

    setData(prev => {
      let newData = prev.map(item =>
        item.id === editItem.id
          ? { ...item, name: editName.trim(), isUsed: editIsUsed }
          : item
      );

      // If turning OFF, turn off all descendants
      if (!editIsUsed) {
        const getAllDescendantIds = (parentId: string, result: string[] = []) => {
          const children = prev.filter(d => d.parentId === parentId);
          children.forEach(child => {
            result.push(child.id);
            getAllDescendantIds(child.id, result);
          });
          return result;
        };
        const descendants = getAllDescendantIds(editItem.id);
        newData = newData.map(d => descendants.includes(d.id) ? { ...d, isUsed: false } : d);
      }

      return newData;
    });

    setIsEditModalOpen(false);
    setSelectedIds([]);
    alert('저장되었습니다.');
  };

  return (
    <PageLayout bottomPadding={false} className="space-y-0 pb-10">
      {/* Grid Controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenEdit}
          disabled={selectedIds.length !== 1}
        >수정</Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleUse}
          disabled={selectedIds.length === 0}
        >사용여부 변경</Button>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-[#E5E8EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-20 border-r border-[#E5E8EB]">No.</th>
                <th className="h-[52px] px-4 text-center w-16 border-r border-[#E5E8EB]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={renderableRows.length > 0 && selectedIds.length === renderableRows.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">메뉴명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-32">사용여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {renderableRows.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer h-[52px] hover:bg-[#F9FAFB] transition-colors ${
                    !item.isUsed ? 'bg-[#F9FAFB]' : 'bg-white'
                  } ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : ''}`}
                  onClick={() => toggleSelect(item.id)}
                  onDoubleClick={() => { setSelectedIds([item.id]); handleOpenEdit(); }}
                  >
                  <td className="px-4 text-center text-[14px] text-[#8B95A1] border-r border-[#E5E8EB]">{item.no}</td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 text-[14px] border-r border-[#E5E8EB]">
                    <div
                      className="flex items-center cursor-pointer select-none group"
                      style={{ paddingLeft: `${item.level * 24}px` }}
                      onClick={() => {
                        // toggle expand when clicking row name if it has children
                        if (item.hasChildren) {
                          setExpandedIds(prev =>
                            prev.includes(item.id) ? prev.filter(ex => ex !== item.id) : [...prev, item.id]
                          );
                        }
                      }}
                    >
                      {item.hasChildren ? (
                        <div
                          className="w-5 h-5 flex items-center justify-center mr-1"
                        >
                          {expandedIds.includes(item.id) ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[#8B95A1] group-hover:text-[#191F28] transition-colors" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#8B95A1] group-hover:text-[#191F28] transition-colors" />
                          )}
                        </div>
                      ) : (
                        <div className="w-5 h-5 mr-1 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-[#D1D6DB]" />
                        </div>
                      )}

                      <div className={`mr-2.5 flex items-center justify-center ${!item.isUsed ? 'text-[#D1D6DB]' : 'text-[#008d7580]'}`}>
                        {item.hasChildren ? (
                           expandedIds.includes(item.id) ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
                        ) : (
                           <FileText className="w-4 h-4 text-[#8B95A1]" />
                        )}
                      </div>

                      <span className={`font-medium ${!item.isUsed ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 text-center">
                    <StatusBadge status={item.isUsed ? 'ON' : 'OFF'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0 bg-white">
              <h2 className="text-[16px] font-semibold text-[#191F28]">메뉴 수정</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#8B95A1] hover:text-[#191F28] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-8 bg-white overflow-y-auto max-h-[70vh]">
              {/* Menu Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                  <h3 className="text-[15px] font-semibold text-[#191F28]">메뉴 정보</h3>
                </div>
                <div className="space-y-2 pl-3">
                  <label className="block text-[14px] font-semibold text-[#191F28]">
                    메뉴명 <span className="text-[#F04452]">*</span>
                  </label>
                  <Input
                    size="sm"
                    fullWidth
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="메뉴명 입력"
                  />
                </div>
              </div>

              {/* Use Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                  <h3 className="text-[15px] font-semibold text-[#191F28]">사용 여부</h3>
                </div>
                <div className="flex items-center gap-8 pl-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="useStatus"
                      checked={editIsUsed === true}
                      onChange={() => setEditIsUsed(true)}
                      className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                    />
                    <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">사용 (ON)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="useStatus"
                      checked={editIsUsed === false}
                      onChange={() => setEditIsUsed(false)}
                      className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                    />
                    <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">미사용 (OFF)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="md"
                style={{ width: 120 }}
                onClick={() => setIsEditModalOpen(false)}
              >
                닫기
              </Button>
              <Button
                variant="primary"
                size="md"
                style={{ width: 120 }}
                onClick={handleSaveEdit}
              >
                저장하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}