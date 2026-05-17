import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, X, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Banner {
  id: string;
  no: number;
  title: string;
  targetType: 'ALL' | 'COMPANY' | 'ERP';
  targetDetails: string[];
  groupDetails: string[];
  positions: string[];
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  order: number;
  isVisible: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const mockBanners: Banner[] = [
  {
    id: '1',
    no: 1,
    title: '5월 프로모션 안내 배너',
    targetType: 'ALL',
    targetDetails: [],
    groupDetails: [],
    positions: ['PC 메인 대시보드'],
    imageUrl: 'banner_promo_05.png',
    linkUrl: 'https://example.com/promo/may',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    order: 1,
    isVisible: true,
    author: 'admin1',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-01',
  },
  {
    id: '2',
    no: 2,
    title: '결재 시스템 업데이트 안내',
    targetType: 'COMPANY',
    targetDetails: ['(주)토스페이먼츠', '야놀자'],
    groupDetails: ['VIP 그룹'],
    positions: ['PC 메인 대시보드', '모바일 결재관리 승인 완료 페이지'],
    imageUrl: 'banner_update_v2.png',
    linkUrl: '',
    startDate: '2024-05-05',
    endDate: '2024-12-31',
    order: 2,
    isVisible: true,
    author: 'admin2',
    createdAt: '2024-05-05',
    updatedAt: '2024-05-06',
  },
];

const mockCompanies = ['(주)토스페이먼츠', '야놀자', '우아한형제들', '당근마켓'];
const mockERPs = ['더존 iCUBE', '영림원 K-System', 'SAP ERP', '이카운트 ERP'];
const mockGroups = ['VIP 그룹', 'A 그룹', 'B 그룹', 'C 그룹'];

export default function BannerManagement() {
  const [data, setData] = useState<Banner[]>(mockBanners);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);

  // Warning Modals
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null); // null if closed, 'bulk' or id

  // Form State
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'COMPANY' | 'ERP'>('ALL');
  const [targetDetails, setTargetDetails] = useState<string[]>([]);
  const [groupDetails, setGroupDetails] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [linkUrl, setLinkUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [isVisible, setIsVisible] = useState(true);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter state
  const [searchTopic, setSearchTopic] = useState('title');
  const [keyword, setKeyword] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');

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
      alert('상태를 변경할 배너를 선택해주세요.');
      return;
    }

    const selectedItems = data.filter(item => selectedIds.includes(item.id));
    const allVisible = selectedItems.every(item => item.isVisible);
    const targetVisibility = !allVisible;

    if (window.confirm(`선택한 배너를 ${targetVisibility ? '노출' : '숨김'} 상태로 변경하시겠습니까?`)) {
      setData(prev => prev.map(item =>
        selectedIds.includes(item.id) ? { ...item, isVisible: targetVisibility } : item
      ));
      setSelectedIds([]);
    }
  };

  const openForm = (item?: Banner) => {
    if (item) {
      setEditItem(item);
      setTitle(item.title);
      setTargetType(item.targetType);
      setTargetDetails(item.targetDetails);
      setGroupDetails(item.groupDetails);
      setPositions(item.positions);
      setImageUrl(item.imageUrl);
      // URL 형태(http/https)면 URL 모드, 그 외에는 파일 모드로 초기화
      setImageInputMode(/^https?:\/\//i.test(item.imageUrl) ? 'url' : 'file');
      setLinkUrl(item.linkUrl);
      setStartDate(item.startDate);
      setEndDate(item.endDate);
      setOrder(item.order);
      setIsVisible(item.isVisible);
    } else {
      setEditItem(null);
      setTitle('');
      setTargetType('ALL');
      setTargetDetails([]);
      setGroupDetails([]);
      setPositions([]);
      setImageUrl('');
      setImageInputMode('file');
      setLinkUrl('');
      setStartDate('');
      setEndDate('');
      setOrder('');
      setIsVisible(true);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '배너명을 입력해주세요.';

    if (positions.length === 0) {
      newErrors.positions = '노출 위치를 1개 이상 선택해주세요.';
    }

    if (targetType === 'COMPANY' && targetDetails.length === 0) {
      newErrors.targetDetails = '기업을 1개 이상 선택해주세요.';
    }
    if (targetType === 'ERP' && targetDetails.length === 0) {
      newErrors.targetDetails = 'ERP를 1개 이상 선택해주세요.';
    }

    if (!imageUrl) newErrors.imageUrl = '배너 이미지를 첨부해주세요.';

    if (!startDate) newErrors.startDate = '시작일을 선택해주세요.';
    if (!endDate) newErrors.endDate = '종료일을 선택해주세요.';
    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = '종료일은 시작일보다 빠를 수 없습니다.';
    }

    if (order === '' || isNaN(Number(order)) || Number(order) < 1) {
       newErrors.order = '유효한 노출 순서를 숫자(1 이상)로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeForm = () => {
    // Check if dirty
    const isDirty = editItem
      ? title !== editItem.title || targetType !== editItem.targetType || JSON.stringify(targetDetails) !== JSON.stringify(editItem.targetDetails) || JSON.stringify(groupDetails) !== JSON.stringify(editItem.groupDetails) || JSON.stringify(positions) !== JSON.stringify(editItem.positions) || imageUrl !== editItem.imageUrl || linkUrl !== editItem.linkUrl || startDate !== editItem.startDate || endDate !== editItem.endDate || order !== editItem.order || isVisible !== editItem.isVisible
      : title !== '' || targetType !== 'ALL' || targetDetails.length > 0 || groupDetails.length > 0 || positions.length > 0 || imageUrl !== '' || linkUrl !== '' || startDate !== '' || endDate !== '' || order !== '';

    if (isDirty) {
      setShowCancelWarning(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const saveForm = () => {
    if (!validateForm()) return;

    const newObj: Banner = {
      id: editItem ? editItem.id : Math.random().toString(36).substr(2, 9),
      no: editItem ? editItem.no : (data.length > 0 ? Math.max(...data.map(d => d.no)) + 1 : 1),
      title: title.trim(),
      targetType,
      targetDetails: targetType === 'ALL' ? [] : targetDetails,
      groupDetails,
      positions,
      imageUrl,
      linkUrl: linkUrl.trim(),
      startDate,
      endDate,
      order: Number(order),
      isVisible,
      author: editItem ? editItem.author : 'admin1',
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Mocking upload behavior
          setImageUrl(file.name);
          if(errors.imageUrl) {
              const next = {...errors};
              delete next.imageUrl;
              setErrors(next);
          }
      }
  };

  const filteredData = data.filter(item => {
    let matchesKeyword = true;
    if (keyword) {
      matchesKeyword = item.title.toLowerCase().includes(keyword.toLowerCase());
    }

    let matchesVisibility = true;
    if (visibilityFilter === 'VISIBLE') matchesVisibility = item.isVisible;
    else if (visibilityFilter === 'HIDDEN') matchesVisibility = !item.isVisible;

    return matchesKeyword && matchesVisibility;
  });

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-bg-gray border border-border-gray px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">검색조건</span>
            <select
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="w-32 h-[40px] px-3 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary transition-all"
            >
              <option value="title">배너명</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">검색어</span>
            <input
              type="text"
              placeholder="검색어 입력"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-80 h-[40px] px-4 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">노출여부</span>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as 'ALL' | 'VISIBLE' | 'HIDDEN')}
              className="w-32 h-[40px] px-3 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary transition-all"
            >
              <option value="ALL">전체</option>
              <option value="VISIBLE">노출</option>
              <option value="HIDDEN">미노출</option>
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


      {/* Grid Controls (Total count and Buttons) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-body">
          <span className="text-text-main">총 </span>
          <span className="text-primary font-bold">{filteredData.length.toLocaleString()}</span>
          <span className="text-text-main"> 건</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleVisibility}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >
            사용여부 변경
          </button>
          <button
            onClick={() => openForm()}
            className="h-[36px] bg-primary hover:bg-primary-hover text-white px-5 rounded-md text-body font-bold transition-colors shadow-sm"
          >
             등록
          </button>
          <button
            onClick={() => {
              if (selectedIds.length !== 1) {
                alert('수정할 배너를 1개만 선택해 주세요.');
                return;
              }
              const item = data.find(d => d.id === selectedIds[0]);
              if (item) openForm(item);
            }}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >
            수정
          </button>
          <button
            onClick={() => {
              if (selectedIds.length === 0) {
                alert('삭제할 배너를 선택해 주세요.');
                return;
              }
              setShowDeleteWarning('bulk');
            }}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >삭제</button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px] whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-center w-12 border-r border-border-gray">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-16 border-r border-border-gray">No.</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">배너명</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-40 border-r border-border-gray">노출 위치</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-32 border-r border-border-gray">노출 대상</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-40 border-r border-border-gray">노출 기간</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-20 border-r border-border-gray">순서</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-20 border-r border-border-gray">노출 여부</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-20 border-r border-border-gray">등록자</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-28">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan={10} className="py-20 text-center text-text-sub text-body">
                    조건에 맞는 결과가 없습니다.
                   </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr
                  key={item.id}
                  className={`h-[52px] hover:bg-bg-gray transition-colors ${selectedIds.includes(item.id) ? 'bg-primary/5' : 'bg-white'}`}
                >
                  <td className="px-4 text-center border-r border-border-gray">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 text-center text-body-sm text-text-sub font-mono border-r border-border-gray">{item.no}</td>
                  <td className="px-4 text-body border-r border-border-gray">
                    <div className="font-medium text-text-main truncate max-w-[200px] xl:max-w-xs flex items-center gap-2">
                       <span className="truncate">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 text-body text-center text-text-body border-r border-border-gray">
                     <div className="flex flex-col gap-1 items-center">
                         {item.positions.length > 0 ? item.positions.map((p, i) => <div key={i} className="truncate w-full">{p}</div>) : '-'}
                     </div>
                  </td>
                  <td className="px-4 text-body text-center text-text-body border-r border-border-gray">
                    <div>{item.targetType === 'ALL' ? '전체기업' : item.targetType === 'COMPANY' ? '기업별' : 'ERP별'}</div>
                    {item.groupDetails.length > 0 && <div className="text-caption text-text-sub mt-1">({item.groupDetails.length}그룹)</div>}
                  </td>
                  <td className="px-4 text-center border-r border-border-gray">
                     <span className="text-body text-text-body inline-flex flex-col items-center gap-0.5 font-mono">
                       <span>{item.startDate} <span className="text-text-sub mx-0.5">~</span> {item.endDate}</span>
                     </span>
                  </td>
                  <td className="px-4 text-center text-body text-text-body font-mono border-r border-border-gray">{item.order}</td>
                  <td className="px-4 text-center border-r border-border-gray">
                    <span className={`text-body font-semibold ${item.isVisible ? 'text-primary' : 'text-text-sub'}`}>
                      {item.isVisible ? '노출' : '미노출'}
                    </span>
                  </td>
                  <td className="px-4 text-body text-center text-text-body truncate border-r border-border-gray">{item.author}</td>
                  <td className="px-4 text-center text-body text-text-sub font-mono tracking-tight">
                    {item.updatedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Banner Form Modal */}
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
                <h3 className="text-title-sm font-semibold text-text-main">배너 {editItem ? '수정' : '등록'}</h3>
                <button
                  onClick={closeForm}
                  className="p-2 text-text-sub hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* 1. 기본 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">기본 정보</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 배너명 */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-body font-semibold text-text-main">배너명 <span className="text-status-error">*</span></label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            if (!title.trim()) setErrors(prev => ({...prev, title: '배너명을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, title: ''}));
                        }}
                        placeholder="배너명을 입력하세요 (내부 관리용)"
                        className={`w-full h-[40px] px-4 bg-white border ${errors.title ? 'border-status-error' : 'border-border-input'} rounded-md text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all`}
                      />
                      {errors.title && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.title}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. 게시 설정 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">게시 설정</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 노출 위치 (게시 위치) */}
                    <div className="space-y-2 p-4 border border-border-gray rounded-lg bg-bg-gray">
                        <label className="block text-body font-semibold text-text-main text-body">노출 위치 <span className="text-status-error">*</span></label>
                        <div className="flex flex-col gap-2">
                            {[
                              { value: 'PC 메인 대시보드', label: 'PC 메인 대시보드' },
                              { value: '모바일 결재관리 승인 완료 페이지', label: '모바일 결재관리 승인 완료' },
                            ].map(({ value, label }) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={positions.includes(value)}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                              ? [...positions, value]
                                              : positions.filter(p => p !== value);
                                            setPositions(next);
                                            if (next.length > 0 && errors.positions) {
                                                const nextErrors = {...errors};
                                                delete nextErrors.positions;
                                                setErrors(nextErrors);
                                            }
                                        }}
                                        className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75] rounded"
                                    />
                                    <span className="text-body text-text-body group-hover:text-text-main transition-colors font-medium">
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.positions && <p className="text-caption text-status-error flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.positions}</p>}
                    </div>

                    {/* 게시 대상 */}
                    <div className="space-y-2 p-4 border border-border-gray rounded-lg bg-bg-gray">
                        <label className="block text-body font-semibold text-text-main text-body">게시 대상 <span className="text-status-error">*</span></label>
                        <div className="flex flex-col gap-2">
                            {['전체', '더존', '가비아'].map((label) => (
                                <label key={label} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={targetDetails.includes(label)}
                                        onChange={(e) => {
                                            const newDetails = e.target.checked
                                                ? [...targetDetails, label]
                                                : targetDetails.filter(d => d !== label);
                                            // Handle special logic for '전체'
                                            if (label === '전체' && e.target.checked) setTargetDetails(['전체']);
                                            else setTargetDetails(newDetails.filter(d => d !== '전체'));
                                        }}
                                        className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75] rounded"
                                    />
                                    <span className="text-body text-text-body group-hover:text-text-main transition-colors font-medium">
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.targetDetails && <p className="text-caption text-status-error flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.targetDetails}</p>}
                    </div>

                    {/* 노출 여부 */}
                    <div className="space-y-2 p-4 border border-border-gray rounded-lg bg-bg-gray">
                        <span className="text-body font-semibold text-text-main block">노출 여부 <span className="text-status-error">*</span></span>
                        <div className="flex items-center gap-6 h-[36px]">
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

                    {/* 노출 순서 */}
                    <div className="space-y-2 p-4 border border-border-gray rounded-lg bg-bg-gray">
                        <label className="block text-body font-semibold text-text-main text-body">노출 순서 <span className="text-status-error">*</span></label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                value={order}
                                onChange={(e) => {
                                    setOrder(e.target.value === '' ? '' : Number(e.target.value));
                                    if (e.target.value === '' || Number(e.target.value) < 1) {
                                        setErrors(prev => ({...prev, order: '유효한 순서를 입력해주세요 (1 이상).'}));
                                    } else {
                                        const next = {...errors};
                                        delete next.order;
                                        setErrors(next);
                                    }
                                }}
                                placeholder="1"
                                className={`w-20 h-[36px] px-3 bg-white border ${errors.order ? 'border-status-error' : 'border-border-input'} rounded text-body outline-none focus:border-primary text-center text-text-main transition-all`}
                            />
                            <span className="text-caption text-text-sub">낮은 숫자일수록 상단</span>
                        </div>
                        {errors.order && <p className="text-caption text-status-error flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.order}</p>}
                    </div>
                  </div>

                  {/* 노출 기간 (게시 기간) - 풀폭 */}
                  <div className="space-y-2 p-4 border border-border-gray rounded-lg bg-bg-gray">
                      <label className="block text-body font-semibold text-text-main text-body">노출 기간 <span className="text-status-error">*</span></label>
                      <div className="flex flex-row items-center gap-2">
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
                            className={`flex-1 h-[36px] px-3 bg-white border ${errors.startDate ? 'border-status-error' : 'border-border-input'} rounded text-body outline-none focus:border-primary text-text-main`}
                          />
                          <div className="text-text-sub text-body">~</div>
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
                              className={`flex-1 h-[36px] px-3 bg-white border ${errors.endDate ? 'border-status-error' : 'border-border-input'} rounded text-body outline-none focus:border-primary text-text-main`}
                          />
                      </div>
                      {errors.startDate && <p className="text-caption text-status-error flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.startDate}</p>}
                      {!errors.startDate && errors.endDate && <p className="text-caption text-status-error flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.endDate}</p>}
                  </div>
                </div>

                {/* 3. 배너 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">배너 상세</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 이미지 파일 / URL */}
                    <div className="space-y-1.5 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-body font-semibold text-text-main">배너 이미지 <span className="text-status-error">*</span></label>
                          {/* 파일/URL 모드 토글 */}
                          <div className="inline-flex rounded-md border border-border-input bg-white overflow-hidden text-body-sm">
                            <button
                              type="button"
                              onClick={() => {
                                setImageInputMode('file');
                                setImageUrl('');
                                if (errors.imageUrl) {
                                  const next = {...errors};
                                  delete next.imageUrl;
                                  setErrors(next);
                                }
                              }}
                              className={`px-3 h-[32px] font-medium transition-colors ${imageInputMode === 'file' ? 'bg-primary text-white' : 'bg-white text-text-body hover:bg-bg-gray'}`}
                            >
                              파일 업로드
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setImageInputMode('url');
                                setImageUrl('');
                                if (errors.imageUrl) {
                                  const next = {...errors};
                                  delete next.imageUrl;
                                  setErrors(next);
                                }
                              }}
                              className={`px-3 h-[32px] font-medium transition-colors border-l border-border-input ${imageInputMode === 'url' ? 'bg-primary text-white' : 'bg-white text-text-body hover:bg-bg-gray'}`}
                            >
                              이미지 URL
                            </button>
                          </div>
                        </div>

                        {imageInputMode === 'file' ? (
                          <div className={`mt-1 flex justify-center px-4 py-3 border-[1.5px] border-dashed rounded-lg ${errors.imageUrl ? 'border-status-error bg-status-error/5' : 'border-border-input bg-bg-gray'} hover:bg-bg-muted transition-colors`}>
                              <div className="text-center">
                                  {imageUrl ? (
                                      <div className="flex items-center gap-3 justify-center">
                                          <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded shrink-0">
                                              <ImageIcon className="w-5 h-5" />
                                          </div>
                                          <p className="text-body-sm text-text-main font-medium truncate max-w-[260px]">{imageUrl}</p>
                                          <label className="cursor-pointer text-body-sm text-primary font-semibold flex items-center gap-1 hover:underline shrink-0">
                                             <Upload className="w-3.5 h-3.5" />
                                             <span>변경</span>
                                             <input type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                          </label>
                                      </div>
                                  ) : (
                                      <div className="flex items-center justify-center gap-2">
                                          <Upload className="h-5 w-5 text-text-sub" />
                                          <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none text-body">
                                              <span>이미지 파일 업로드</span>
                                              <input type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                          </label>
                                          <span className="text-caption text-text-sub">· PNG/JPG, 권장 1200x400</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="url"
                              value={imageUrl}
                              onChange={(e) => {
                                setImageUrl(e.target.value);
                                if (e.target.value && errors.imageUrl) {
                                  const next = {...errors};
                                  delete next.imageUrl;
                                  setErrors(next);
                                }
                              }}
                              placeholder="https://example.com/banner.png"
                              className={`w-full h-[40px] px-4 bg-white border ${errors.imageUrl ? 'border-status-error' : 'border-border-input'} rounded-md text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all`}
                            />
                            {imageUrl && /^https?:\/\//i.test(imageUrl) && (
                              <div className="border border-border-gray rounded-md p-3 bg-bg-gray">
                                <p className="text-caption text-text-sub mb-2">미리보기</p>
                                <img
                                  src={imageUrl}
                                  alt="배너 미리보기"
                                  className="max-h-40 max-w-full object-contain rounded"
                                  onError={(e) => { (e.currentTarget.style.display = 'none'); }}
                                />
                              </div>
                            )}
                            <p className="text-caption text-text-sub">외부 이미지 URL을 직접 입력하세요. (http:// 또는 https://)</p>
                          </div>
                        )}
                        {errors.imageUrl && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.imageUrl}</p>}
                    </div>

                    {/* 클릭 시 이동 링크 */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-body font-semibold text-text-main">클릭 시 이동 링크</label>
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com/landing (선택 입력)"
                          className="w-full h-[40px] px-4 bg-white border border-border-input rounded-md text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all"
                        />
                        <p className="text-caption text-text-sub">사용자가 배너 클릭 시 이동할 URL입니다. 비워두면 클릭해도 이동하지 않습니다.</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-center h-[64px] px-6 border-t border-border-gray bg-bg-gray shrink-0 gap-3">
                <button
                  onClick={closeForm}
                  className="w-[120px] h-[40px] border border-border-input rounded-md bg-white text-body font-medium text-text-main hover:bg-bg-muted transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={saveForm}
                  className="w-[120px] h-[40px] bg-primary hover:bg-primary-hover text-white rounded-md text-body font-semibold transition-colors shadow-sm"
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


        {/* Delete Confirmation Modal */}
        <AnimatePresence>
            {showDeleteWarning && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-8 text-center"
                >
                    <div className="w-12 h-12 bg-status-error/10 text-status-error rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-title font-bold text-text-main mb-3">배너를 삭제하시겠습니까?</h3>
                    <p className="text-body text-text-body mb-10 leading-relaxed">삭제 후 복구할 수 없습니다.</p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => setShowDeleteWarning(null)}
                            className="flex-1 h-[44px] bg-white border border-border-input text-text-main rounded-md text-body font-semibold hover:bg-bg-gray transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={() => executeDelete(showDeleteWarning === 'bulk' ? selectedIds : [showDeleteWarning])}
                            className="flex-1 h-[44px] bg-status-error text-white rounded-md text-body font-semibold hover:bg-status-error-strong transition-colors shadow-sm"
                        >
                            삭제하기
                        </button>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>


        {/* Cancel Warning Modal */}
        <AnimatePresence>
            {showCancelWarning && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-8 text-center"
                >
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-title font-bold text-text-main mb-3">저장되지 않은 변경사항</h3>
                    <p className="text-body text-text-body mb-10 leading-relaxed">현재 입력한 내용이 저장되지 않습니다. 닫으시겠습니까?</p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => setShowCancelWarning(false)}
                            className="flex-1 h-[44px] bg-white border border-border-input text-text-main rounded-md text-body font-semibold hover:bg-bg-gray transition-colors"
                        >
                            계속 작성
                        </button>
                        <button
                            onClick={() => {
                                setShowCancelWarning(false);
                                setIsModalOpen(false);
                            }}
                            className="flex-1 h-[44px] bg-primary text-white rounded-md text-body font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                        >
                            닫기
                        </button>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    </div>
  );
}
