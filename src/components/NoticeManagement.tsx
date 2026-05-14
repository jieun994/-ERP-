import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button, FilterBar, DataTable, StatusBadge, PageLayout, ConfirmModal, Select, Input, Textarea } from './ui';

interface Notice {
  id: string;
  no: number;
  title: string;
  content: string;
  targetType: 'ALL' | 'COMPANY' | 'ERP';
  targetDetails:(string)[];
  startDate: string;
  endDate: string;
  isPinned: boolean;
  isVisible: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const mockNotices: Notice[] = [
  {
    id: '1',
    no: 1,
    title: '[안내] 시스템 점검 사전 안내 (2024년 5월 10일)',
    content: '시스템 점검이 예정되어 있습니다. 이용에 불편을 드려 죄송합니다.',
    targetType: 'ALL',
    targetDetails: [],
    startDate: '2024-05-01',
    endDate: '2024-05-10',
    isPinned: true,
    isVisible: true,
    author: 'admin1',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-01',
  },
  {
    id: '2',
    no: 2,
    title: '신규 기업 등록 시 유의사항',
    content: '등록 신청 시 필요한 증빙 서류를 반드시 첨부해 주세요.',
    targetType: 'COMPANY',
    targetDetails: ['A그룹', 'B그룹'],
    startDate: '2024-05-05',
    endDate: '2024-12-31',
    isPinned: false,
    isVisible: true,
    author: 'admin2',
    createdAt: '2024-05-05',
    updatedAt: '2024-05-06',
  },
];

const mockCompanies = ['(주)토스페이먼츠', '야놀자', '우아한형제들', '당근마켓'];
const mockERPs = ['더존 iCUBE', '영림원 K-System', 'SAP ERP', '이카운트 ERP'];

export default function NoticeManagement() {
  const location = useLocation();
  const [data, setData] = useState<Notice[]>(mockNotices);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Notice | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setEditItem(null);
      setIsModalOpen(true);
    }
  }, []);

  // Warning Modals
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null); // null if closed, 'bulk' or id

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetTypes, setTargetTypes] = useState<('ALL' | 'COMPANY' | 'ERP')[]>(['ALL', 'ERP', 'COMPANY']);
  const targetType = targetTypes.includes('ALL') ? 'ALL' : (targetTypes.length === 1 ? targetTypes[0] : 'ALL');
  const [targetDetails, setTargetDetails] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter state
  const [searchTopic, setSearchTopic] = useState('title');
  const [keyword, setKeyword] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(data.map(d => d.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const executeDelete = (ids: string[]) => {
    setData(prev => prev.filter(item => !ids.includes(item.id)));
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    setShowDeleteWarning(null);
  };

  const handleToggleVisibility = () => {
    if (selectedIds.length === 0) {
      alert('상태를 변경할 공지사항을 선택해주세요.');
      return;
    }

    const selectedItems = data.filter(item => selectedIds.includes(item.id));
    const allVisible = selectedItems.every(item => item.isVisible);
    const targetVisibility = !allVisible;

    if (window.confirm(`선택한 공지를 ${targetVisibility ? '노출' : '숨김'} 상태로 변경하시겠습니까?`)) {
      setData(prev => prev.map(item =>
        selectedIds.includes(item.id) ? { ...item, isVisible: targetVisibility } : item
      ));
      setSelectedIds([]);
    }
  };

  const openForm = (item?: Notice) => {
    if (item) {
      setEditItem(item);
      setTitle(item.title);
      setContent(item.content);
      setTargetTypes([item.targetType]);
      setTargetDetails(item.targetDetails);
      setStartDate(item.startDate);
      setEndDate(item.endDate);
      setIsPinned(item.isPinned);
      setIsVisible(item.isVisible);
    } else {
      setEditItem(null);
      setTitle('');
      setContent('');
      setTargetTypes(['ALL', 'ERP', 'COMPANY']);
      setTargetDetails([]);
      setStartDate('');
      setEndDate('');
      setIsPinned(false);
      setIsVisible(true);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '제목을 입력해주세요.';
    if (!content.trim()) newErrors.content = '내용을 입력해주세요.';

    if (targetType === 'COMPANY' && targetDetails.length === 0) {
      newErrors.targetDetails = '기업을 1개 이상 선택해주세요.';
    }
    if (targetType === 'ERP' && targetDetails.length === 0) {
      newErrors.targetDetails = 'ERP를 1개 이상 선택해주세요.';
    }

    if (!startDate) newErrors.startDate = '시작일을 선택해주세요.';
    if (!endDate) newErrors.endDate = '종료일을 선택해주세요.';
    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = '종료일은 시작일보다 빠를 수 없습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeForm = () => {
    // Check if dirty
    const isDirty = editItem
      ? title !== editItem.title || content !== editItem.content || targetType !== editItem.targetType || JSON.stringify(targetDetails) !== JSON.stringify(editItem.targetDetails) || startDate !== editItem.startDate || endDate !== editItem.endDate || isPinned !== editItem.isPinned || isVisible !== editItem.isVisible
      : title !== '' || content !== '' || targetType !== 'ALL' || targetDetails.length > 0 || startDate !== '' || endDate !== '';

    if (isDirty) {
      setShowCancelWarning(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const saveForm = () => {
    if (!validateForm()) return;

    const newObj: Notice = {
      id: editItem ? editItem.id : Math.random().toString(36).substr(2, 9),
      no: editItem ? editItem.no : (data.length > 0 ? Math.max(...data.map(d => d.no)) + 1 : 1),
      title: title.trim(),
      content: content.trim(),
      targetType,
      targetDetails: targetType === 'ALL' ? [] : targetDetails,
      startDate,
      endDate,
      isPinned,
      isVisible,
      author: editItem ? editItem.author : 'admin1', // In real app, user from auth
      createdAt: editItem ? editItem.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editItem) {
      setData(prev => prev.map(item => item.id === editItem.id ? newObj : item));
    } else {
      setData(prev => [newObj, ...prev]);
    }

    setIsModalOpen(false);
  };

  const filteredData = data.filter(item => {
    const matchesKeyword = keyword ? item.title.toLowerCase().includes(keyword.toLowerCase()) : true;
    const matchesVisibility = visibilityFilter === 'ALL' ? true : (visibilityFilter === 'VISIBLE' ? item.isVisible : !item.isVisible);
    return matchesKeyword && matchesVisibility;
  });

  return (
    <PageLayout>
      {/* Search Area */}
      <FilterBar onSearch={() => {}} onReset={() => { setKeyword(''); setVisibilityFilter('ALL'); setSearchTopic('title'); }}>
        <FilterBar.Field label="검색조건">
          <Select
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            fullWidth
          >
            <option value="title">제목</option>
            <option value="content">내용</option>
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="검색어">
          <Input
            type="text"
            placeholder="검색어 입력"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            fullWidth
          />
        </FilterBar.Field>
        <FilterBar.Field label="노출여부">
          <Select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            fullWidth
          >
            <option value="ALL">전체</option>
            <option value="VISIBLE">노출</option>
            <option value="HIDDEN">미노출</option>
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
            if (selectedIds.length !== 1) { alert('수정할 공지사항을 1개만 선택해주세요.'); return; }
            const item = data.find(d => d.id === selectedIds[0]);
            if (item) openForm(item);
          }}
        >수정</Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => {
            if (selectedIds.length === 0) { alert('삭제할 공지사항을 선택해주세요.'); return; }
            setShowDeleteWarning('bulk');
          }}
        >삭제</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleToggleVisibility}>사용여부 변경</Button>
      </DataTable.Controls>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-border-gray overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px] whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray">
                <th className="h-[52px] px-4 text-center w-12 border-r border-border-gray">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-16 border-r border-border-gray">No.</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body border-r border-border-gray">제목</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-32 border-r border-border-gray">게시 대상</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-40 border-r border-border-gray">노출 기간</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-24 border-r border-border-gray">노출 여부</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-24 border-r border-border-gray">등록자</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-32">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan={8} className="py-20 text-center text-text-sub text-body">
                    조건에 맞는 결과가 없습니다.
                   </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer h-[52px] hover:bg-bg-gray transition-colors ${selectedIds.includes(item.id) ? 'bg-primary/5' : ''}`}
                  onClick={() => toggleSelect(item.id)}
                  onDoubleClick={() => { setSelectedIds([item.id]); const found = data.find(d => d.id === item.id); if (found) openForm(found); }}
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
                  <td className="px-4 text-center text-body-sm text-text-sub font-mono border-r border-border-gray">{item.no}</td>
                  <td className="px-4 text-body border-r border-border-gray">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-text-main truncate max-w-[400px]">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 text-body text-center text-text-body border-r border-border-gray">
                    {item.targetType === 'ALL' ? '전체' : item.targetType === 'COMPANY' ? '가비아' : '더존'}
                  </td>
                  <td className="px-4 text-center border-r border-border-gray">
                     <span className="text-body-sm text-text-body">
                       {item.startDate} ~ {item.endDate}
                     </span>
                  </td>
                  <td className="px-4 text-center border-r border-border-gray">
                    <StatusBadge status={item.isVisible ? '노출' : '미노출'} />
                  </td>
                  <td className="px-4 text-body text-center text-text-body border-r border-border-gray">{item.author}</td>
                  <td className="px-4 text-center text-body-sm text-text-sub font-mono tracking-tight">
                    {item.updatedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Notice Form Modal */}
       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
                <h3 className="text-title-sm font-semibold text-text-main">공지사항 {editItem ? '수정' : '등록'}</h3>
                <button
                  onClick={closeForm}
                  className="p-2 text-text-sub hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* 1. 기본 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">기본 정보</h4>
                  </div>

                  <div className="space-y-4">
                    {/* 제목 */}
                    <div className="space-y-1.5">
                    <label className="block text-body font-semibold text-text-main">제목 <span className="text-status-error">*</span></label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            if (!title.trim()) setErrors(prev => ({...prev, title: '제목을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, title: ''}));
                        }}
                        placeholder="공지사항 제목을 입력하세요."
                        className={`w-full h-[40px] px-4 bg-white border ${errors.title ? 'border-status-error' : 'border-border-input'} rounded-md text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all`}
                    />
                    {errors.title && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.title}</p>}
                    </div>

                    {/* 내용 */}
                    <div className="space-y-1.5">
                    <label className="block text-body font-semibold text-text-main">내용 <span className="text-status-error">*</span></label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={() => {
                            if (!content.trim()) setErrors(prev => ({...prev, content: '내용을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, content: ''}));
                        }}
                        placeholder="공지사항 내용을 입력하세요. (첨부파일 미지원)"
                        rows={8}
                        className={`w-full px-4 py-3 bg-white border ${errors.content ? 'border-status-error' : 'border-border-input'} rounded-md text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all resize-none`}
                    />
                    {errors.content && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.content}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. 노출 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">게시 설정</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 border border-border-gray rounded-lg bg-bg-gray">
                     <label className="block text-body font-semibold text-text-main mb-2 text-body">게시 대상 <span className="text-status-error">*</span></label>
                    <div className="flex items-center gap-4">
                      {['ALL', 'ERP', 'COMPANY'].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                                  checked={targetTypes.includes(type as 'ALL' | 'COMPANY' | 'ERP')}
                                  onChange={(e) => {
                                      if (type === 'ALL') {
                                        if (e.target.checked) setTargetTypes(['ALL', 'ERP', 'COMPANY']);
                                        else setTargetTypes([]);
                                      } else {
                                        if (e.target.checked) {
                                            const nextTypes = [...targetTypes.filter(t => t !== 'ALL'), type as 'ALL' | 'COMPANY' | 'ERP'];
                                            if (nextTypes.includes('ERP') && nextTypes.includes('COMPANY')) {
                                                setTargetTypes(['ALL', 'ERP', 'COMPANY']);
                                            } else {
                                                setTargetTypes(nextTypes);
                                            }
                                        } else {
                                            setTargetTypes(targetTypes.filter(t => t !== type && t !== 'ALL'));
                                        }
                                      }
                                      setErrors(prev => ({...prev, targetDetails: ''}));
                                  }}
                              />
                              <span className="text-body text-text-body">{type === 'ALL' ? '전체' : type === 'ERP' ? '더존' : '가비아'}</span>
                          </label>
                      ))}
                    </div>

                    {false && (
                        <div className="mt-2 bg-white p-3 border border-border-input rounded-md max-h-40 overflow-y-auto space-y-2 shadow-inner">
                             {(targetTypes.includes('COMPANY') ? mockCompanies : []).concat(targetTypes.includes('ERP') ? mockERPs : []).map(item => (
                                 <label key={item} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                                        checked={targetDetails.includes(item)}
                                        onChange={(e) => {
                                            const newDetails = e.target.checked
                                                ? [...targetDetails, item]
                                                : targetDetails.filter(d => d !== item);
                                            setTargetDetails(newDetails);
                                            if (newDetails.length > 0) setErrors(prev => ({...prev, targetDetails: ''}));
                                        }}
                                    />
                                    <span className="text-body-sm text-text-body group-hover:text-text-main transition-colors">{item}</span>
                                 </label>
                             ))}
                        </div>
                    )}
                    {errors.targetDetails && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.targetDetails}</p>}
                    </div>

                    {/* 노출 여부 */}
                    <div className="space-y-4 p-4 border border-border-gray rounded-lg bg-bg-gray">
                        <span className="text-body font-semibold text-text-main block">노출 여부 <span className="text-status-error">*</span></span>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="isVisible" checked={isVisible} onChange={() => setIsVisible(true)} className="w-[18px] h-[18px] border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-body text-text-main">노출</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="isVisible" checked={!isVisible} onChange={() => setIsVisible(false)} className="w-[18px] h-[18px] border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-body text-text-main">미노출</span>
                            </label>
                        </div>
                    </div>
                  </div>
                </div>

                {/* 3. 노출 기간 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">게시 기간 설정</h4>
                  </div>

                  <div className="p-4 border border-border-gray rounded-lg bg-bg-gray w-full">
                    <label className="block text-body font-semibold text-text-main mb-3 text-body">노출 기간 <span className="text-status-error">*</span></label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                if (e.target.value && endDate && e.target.value > endDate) {
                                    setErrors(prev => ({...prev, endDate: '종료일은 시작일보다 빠를 수 없습니다.'}));
                                } else {
                                    const next = {...errors};
                                    delete next.startDate;
                                    delete next.endDate;
                                    setErrors(next);
                                }
                            }}
                            className={`w-full h-[36px] px-3 bg-white border ${errors.startDate ? 'border-status-error' : 'border-border-input'} rounded text-body outline-none focus:border-primary text-text-main`}
                            />
                        </div>
                        <span className="text-gray-400">~</span>
                        <div className="flex-1">
                           <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                if (startDate && e.target.value && startDate > e.target.value) {
                                    setErrors(prev => ({...prev, endDate: '종료일은 시작일보다 빠를 수 없습니다.'}));
                                } else {
                                    const next = {...errors};
                                    delete next.startDate;
                                    delete next.endDate;
                                    setErrors(next);
                                }
                            }}
                            className={`w-full h-[36px] px-3 bg-white border ${errors.endDate ? 'border-status-error' : 'border-border-input'} rounded text-body outline-none focus:border-primary text-text-main`}
                            />
                        </div>
                    </div>
                    {errors.startDate && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.startDate}</p>}
                    {!errors.startDate && errors.endDate && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.endDate}</p>}
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-center h-[72px] px-6 border-t border-border-gray bg-bg-gray shrink-0 gap-3">
                <Button variant="secondary" size="md" style={{ width: 120 }} onClick={closeForm}>취소</Button>
                <Button variant="primary" size="md" style={{ width: 120 }} onClick={saveForm}>저장하기</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!showDeleteWarning}
        variant="danger"
        title="공지사항을 삭제하시겠습니까?"
        description="삭제 후 복구할 수 없습니다."
        confirmLabel="삭제하기"
        onConfirm={() => executeDelete(showDeleteWarning === 'bulk' ? selectedIds : [showDeleteWarning!])}
        onCancel={() => setShowDeleteWarning(null)}
      />

      {/* Cancel Warning Modal */}
      <ConfirmModal
        open={showCancelWarning}
        variant="warning"
        title="저장되지 않은 변경사항"
        description="현재 입력한 내용이 저장되지 않습니다. 닫으시겠습니까?"
        confirmLabel="닫기"
        cancelLabel="계속 작성"
        onConfirm={() => { setShowCancelWarning(false); setIsModalOpen(false); }}
        onCancel={() => setShowCancelWarning(false)}
      />
    </PageLayout>
  );
}
