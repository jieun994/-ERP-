import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Pin, X, Calendar, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notice {
  id: string;
  no: number;
  title: string;
  content: string;
  targetType: 'ALL' | 'COMPANY' | 'ERP';
  targetDetails:(string)[];
  positions: string[];
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
    positions: ['메인화면(대시보드)'],
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
    positions: ['메인화면(대시보드)', '모바일 결재관리'],
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
  const [data, setData] = useState<Notice[]>(mockNotices);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Notice | null>(null);

  // Warning Modals
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null); // null if closed, 'bulk' or id

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'COMPANY' | 'ERP'>('ALL');
  const [targetDetails, setTargetDetails] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>(['메인화면(대시보드)', '모바일 결재관리']);
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
      setTargetType(item.targetType);
      setTargetDetails(item.targetDetails);
      setPositions(item.positions);
      setStartDate(item.startDate);
      setEndDate(item.endDate);
      setIsPinned(item.isPinned);
      setIsVisible(item.isVisible);
    } else {
      setEditItem(null);
      setTitle('');
      setContent('');
      setTargetType('ALL');
      setTargetDetails([]);
      setPositions([]);
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
      ? title !== editItem.title || content !== editItem.content || targetType !== editItem.targetType || JSON.stringify(targetDetails) !== JSON.stringify(editItem.targetDetails) || JSON.stringify(positions) !== JSON.stringify(editItem.positions) || startDate !== editItem.startDate || endDate !== editItem.endDate || isPinned !== editItem.isPinned || isVisible !== editItem.isVisible
      : title !== '' || content !== '' || targetType !== 'ALL' || targetDetails.length > 0 || positions.length > 0 || startDate !== '' || endDate !== '';

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
      positions,
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
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">검색조건</span>
            <select 
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="w-40 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>
          </div>
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">검색어</span>
            <input 
              type="text" 
              placeholder="검색어 입력"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">노출여부</span>
            <select 
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="w-40 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              <option value="ALL">전체</option>
              <option value="VISIBLE">노출</option>
              <option value="HIDDEN">미노출</option>
            </select>
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


      {/* Grid Controls (Total count and Buttons) */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[14px]">
          <span className="text-[#4E5968]">총 </span>
          <span className="text-[#008d75] font-bold">{filteredData.length.toLocaleString()}</span>
          <span className="text-[#4E5968]"> 건</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleVisibility}
            className="h-[32px] px-3 bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            노출여부 변경
          </button>
          
          <button 
            onClick={() => openForm()}
            className="h-[32px] bg-[#008d75] hover:bg-black text-white px-4 rounded-md text-[13px] font-medium transition-colors shadow-sm"
          >
             등록
          </button>
          <button 
            onClick={() => {
              if (selectedIds.length !== 1) {
                alert('수정할 공지사항을 1개만 선택해주세요.');
                return;
              }
              const item = data.find(d => d.id === selectedIds[0]);
              if (item) openForm(item);
            }}
            className="h-[32px] px-3 bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            수정
          </button>
          <button 
            onClick={() => {
              if (selectedIds.length === 0) {
                alert('삭제할 공지사항을 선택해주세요.');
                return;
              }
              setShowDeleteWarning('bulk');
            }}
            className="h-[32px] px-3 bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors"
          >삭제</button>
          
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-[#E5E8EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB]">
                <th className="h-[52px] px-4 text-center w-12 border-r border-[#E5E8EB]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-16 border-r border-[#E5E8EB]">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] border-r border-[#E5E8EB]">제목</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-32 border-r border-[#E5E8EB]">게시 대상</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-40 border-r border-[#E5E8EB]">노출 위치</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-40 border-r border-[#E5E8EB]">노출 기간</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-24 border-r border-[#E5E8EB]">노출 여부</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-24 border-r border-[#E5E8EB]">등록자</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-32">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan={9} className="py-20 text-center text-[#8B95A1] text-[14px]">
                    조건에 맞는 결과가 없습니다.
                   </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr 
                  key={item.id} 
                  className={`h-[52px] hover:bg-[#F9FAFB] transition-colors ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : ''}`}
                >
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono border-r border-[#E5E8EB]">{item.no}</td>
                  <td className="px-4 text-[14px] border-r border-[#E5E8EB]">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[#191F28] truncate max-w-[400px]">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 text-[14px] text-center text-[#4E5968] border-r border-[#E5E8EB]">
                    {item.targetType === 'ALL' ? '전체' : item.targetType === 'COMPANY' ? '가비아' : '더존'}
                  </td>
                  <td className="px-4 text-[14px] text-center text-[#4E5968] border-r border-[#E5E8EB]">
                    <div className="truncate max-w-[150px] mx-auto">
                        {item.positions.join(', ') || '-'}
                    </div>
                  </td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                     <span className="text-[13px] text-[#4E5968]">
                       {item.startDate} ~ {item.endDate}
                     </span>
                  </td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <span className={`text-[14px] font-medium ${item.isVisible ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
                      {item.isVisible ? '노출' : '미노출'}
                    </span>
                  </td>
                  <td className="px-4 text-[14px] text-center text-[#4E5968] border-r border-[#E5E8EB]">{item.author}</td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono tracking-tight">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeForm}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0">
                <h3 className="text-[16px] font-semibold text-[#191F28]">공지사항 {editItem ? '수정' : '등록'}</h3>
                <button 
                  onClick={closeForm}
                  className="p-2 text-[#8B95A1] hover:text-[#191F28] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto w-full space-y-8 flex-1 bg-white">
                
                {/* 1. 기본 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">기본 정보</h4>
                  </div>

                  <div className="space-y-4">
                    {/* 제목 */}
                    <div className="space-y-1.5">
                    <label className="block text-[14px] font-semibold text-[#191F28]">제목 <span className="text-[#F04452]">*</span></label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            if (!title.trim()) setErrors(prev => ({...prev, title: '제목을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, title: ''}));
                        }}
                        placeholder="공지사항 제목을 입력하세요."
                        className={`w-full h-[40px] px-4 bg-white border ${errors.title ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all`}
                    />
                    {errors.title && <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.title}</p>}
                    </div>

                    {/* 내용 */}
                    <div className="space-y-1.5">
                    <label className="block text-[14px] font-semibold text-[#191F28]">내용 <span className="text-[#F04452]">*</span></label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={() => {
                            if (!content.trim()) setErrors(prev => ({...prev, content: '내용을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, content: ''}));
                        }}
                        placeholder="공지사항 내용을 입력하세요. (첨부파일 미지원)"
                        rows={8}
                        className={`w-full px-4 py-3 bg-white border ${errors.content ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all resize-none`}
                    />
                    {errors.content && <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.content}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. 노출 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">게시 설정</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 게시 대상 */}
                   <div className="space-y-2 p-4 border border-[#E5E8EB] rounded-lg bg-[#F9FAFB]">
                    <label className="block text-[14px] font-semibold text-[#191F28] mb-2 text-sm">게시 대상 <span className="text-[#F04452]">*</span></label>
                    <select
                        className="w-full h-[40px] px-3 border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75]"
                        value={targetType}
                        onChange={(e) => {
                            setTargetType(e.target.value as 'ALL' | 'COMPANY' | 'ERP');
                            setTargetDetails([]);
                            setErrors(prev => ({...prev, targetDetails: ''}));
                        }}
                     >
                        <option value="ALL">전체</option>
                        <option value="ERP">더존</option>
                        <option value="COMPANY">가비아</option>
                     </select>

                    {(targetType === 'COMPANY' || targetType === 'ERP') && (
                        <div className="mt-2 bg-white p-3 border border-[#D1D6DB] rounded-md max-h-40 overflow-y-auto space-y-2 shadow-inner">
                             {(targetType === 'COMPANY' ? mockCompanies : mockERPs).map(item => (
                                 <label key={item} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                                        checked={targetDetails.includes(item)}
                                        onChange={(e) => {
                                            const newDetails = e.target.checked 
                                                ? [...targetDetails, item]
                                                : targetDetails.filter(d => d !== item);
                                            setTargetDetails(newDetails);
                                            if (newDetails.length > 0) setErrors(prev => ({...prev, targetDetails: ''}));
                                        }}
                                    />
                                    <span className="text-[13px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">{item}</span>
                                 </label>
                             ))}
                        </div>
                    )}
                    {errors.targetDetails && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.targetDetails}</p>}
                   </div>

                    {/* 노출 설정 */}
                   <div className="space-y-4 p-4 border border-[#E5E8EB] rounded-lg bg-[#F9FAFB]">
                        <div className="space-y-2">
                            <label className="block text-[14px] font-semibold text-[#191F28] text-sm">노출 위치</label>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                {['메인화면(대시보드)', '모바일 결재관리'].map(pos => (
                                <label key={pos} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                                        checked={positions.includes(pos)}
                                        onChange={(e) => {
                                            if (e.target.checked) setPositions(prev => [...prev, pos]);
                                            else setPositions(prev => prev.filter(p => p !== pos));
                                        }}
                                    />
                                    <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">{pos}</span>
                                </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                             <div className="flex flex-col gap-3">
                                <label className="flex items-center justify-between px-3 py-2 bg-white border border-[#D1D6DB] rounded-md w-full">
                                    <span className="text-[13px] font-medium text-[#4E5968]">노출 여부</span>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="radio" name="isVisible" checked={isVisible} onChange={() => setIsVisible(true)} className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" />
                                            <span className="text-[13px] text-[#191F28]">노출</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="radio" name="isVisible" checked={!isVisible} onChange={() => setIsVisible(false)} className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" />
                                            <span className="text-[13px] text-[#191F28]">미노출</span>
                                        </label>
                                    </div>
                                </label>
                            </div>
                        </div>
                   </div>
                  </div>
                </div>

                {/* 3. 노출 기간 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">게시 기간 설정</h4>
                  </div>
                  
                  <div className="p-4 border border-[#E5E8EB] rounded-lg bg-[#F9FAFB] max-w-sm">
                    <label className="block text-[14px] font-semibold text-[#191F28] mb-3 text-sm">노출 기간 <span className="text-[#F04452]">*</span></label>
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
                            className={`w-full h-[36px] px-3 bg-white border ${errors.startDate ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded text-[14px] outline-none focus:border-[#008d75] text-[#191F28]`} 
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
                            className={`w-full h-[36px] px-3 bg-white border ${errors.endDate ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded text-[14px] outline-none focus:border-[#008d75] text-[#191F28]`} 
                            />
                        </div>
                    </div>
                    {errors.startDate && <p className="text-[12px] text-[#F04452] mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.startDate}</p>}
                    {!errors.startDate && errors.endDate && <p className="text-[12px] text-[#F04452] mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.endDate}</p>}
                  </div>
                </div>

              </div>

              <div className="h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={closeForm}
                  className="h-[40px] px-6 border border-[#D1D6DB] rounded-md bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F2F4F6] transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={saveForm}
                  className="h-[40px] px-8 bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[14px] font-semibold transition-colors"
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
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowDeleteWarning(null)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 text-center"
                >
                    <div className="w-12 h-12 bg-[#F0445210] text-[#F04452] rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-[16px] font-bold text-[#191F28] mb-2">공지사항을 삭제하시겠습니까?</h3>
                    <p className="text-[14px] text-[#4E5968] mb-6 font-medium">삭제 후 복구할 수 없습니다.</p>
                    <div className="flex gap-2 justify-center">
                        <button 
                            onClick={() => setShowDeleteWarning(null)}
                            className="px-5 h-[40px] bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] transition-colors"
                        >
                            취소
                        </button>
                        <button 
                            onClick={() => executeDelete(showDeleteWarning === 'bulk' ? selectedIds : [showDeleteWarning])}
                            className="px-5 h-[40px] bg-[#F04452] text-white rounded-md text-[14px] font-semibold hover:bg-[#d93a46] transition-colors shadow-sm"
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
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowCancelWarning(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 text-center"
                >
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-[16px] font-bold text-[#191F28] mb-2">저장되지 않은 변경사항</h3>
                    <p className="text-[14px] text-[#4E5968] mb-6 font-medium">현재 입력한 내용이 저장되지 않습니다. 닫으시겠습니까?</p>
                    <div className="flex gap-2 justify-center">
                        <button 
                            onClick={() => setShowCancelWarning(false)}
                            className="px-5 h-[40px] bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[14px] font-medium hover:bg-[#F9FAFB] transition-colors"
                        >
                            계속 작성
                        </button>
                        <button 
                            onClick={() => {
                                setShowCancelWarning(false);
                                setIsModalOpen(false);
                            }}
                            className="px-5 h-[40px] bg-[#008d75] text-white rounded-md text-[14px] font-semibold hover:bg-[#007a65] transition-colors shadow-sm"
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
