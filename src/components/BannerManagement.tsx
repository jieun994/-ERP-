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
    positions: ['메인화면(대시보드)'],
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
    positions: ['메인화면(대시보드)', '모바일 결재관리'],
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
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">검색조건</span>
            <select 
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="w-32 h-[40px] px-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              <option value="title">배너명</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">검색어</span>
            <input 
              type="text" 
              placeholder="검색어 입력"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-80 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">노출여부</span>
            <select 
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as 'ALL' | 'VISIBLE' | 'HIDDEN')}
              className="w-32 h-[40px] px-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-[14px]">
          <span className="text-[#191F28]">총 </span>
          <span className="text-[#008d75] font-bold">{filteredData.length.toLocaleString()}</span>
          <span className="text-[#191F28]"> 건</span>
        </div>
        <div className="flex items-center gap-2">
          
          
          
          
          <button 
            onClick={handleToggleVisibility}
            className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"
          >
            사용여부 변경
          </button>
          <button 
            onClick={() => openForm()}
            className="h-[36px] bg-[#008d75] hover:bg-[#007a65] text-white px-5 rounded-md text-[14px] font-bold transition-colors shadow-sm"
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
            className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"
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
            className="h-[36px] border border-[#D1D6DB] px-4 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm"
          >삭제</button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center w-12 border-r border-[#E5E8EB]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-16 border-r border-[#E5E8EB]">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">배너명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-40 border-r border-[#E5E8EB]">노출 위치</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-32 border-r border-[#E5E8EB]">노출 대상</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-40 border-r border-[#E5E8EB]">노출 기간</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-20 border-r border-[#E5E8EB]">순서</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-20 border-r border-[#E5E8EB]">노출 여부</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-20 border-r border-[#E5E8EB]">등록자</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-28">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan={10} className="py-20 text-center text-[#8B95A1] text-[14px]">
                    조건에 맞는 결과가 없습니다.
                   </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr 
                  key={item.id} 
                  className={`h-[52px] hover:bg-[#F9FAFB] transition-colors ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : 'bg-white'}`}
                >
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono border-r border-[#E5E8EB]">{item.no}</td>
                  <td className="px-4 text-[14px] border-r border-[#E5E8EB]">
                    <div className="font-medium text-[#191F28] truncate max-w-[200px] xl:max-w-xs flex items-center gap-2">
                       <span className="truncate">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 text-[14px] text-center text-[#4E5968] border-r border-[#E5E8EB]">
                     <div className="flex flex-col gap-1 items-center">
                         {item.positions.length > 0 ? item.positions.map((p, i) => <div key={i} className="truncate w-full">{p}</div>) : '-'}
                     </div>
                  </td>
                  <td className="px-4 text-[14px] text-center text-[#4E5968] border-r border-[#E5E8EB]">
                    <div>{item.targetType === 'ALL' ? '전체기업' : item.targetType === 'COMPANY' ? '기업별' : 'ERP별'}</div>
                    {item.groupDetails.length > 0 && <div className="text-[12px] text-[#8B95A1] mt-1">({item.groupDetails.length}그룹)</div>}
                  </td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                     <span className="text-[14px] text-[#4E5968] inline-flex flex-col items-center gap-0.5 font-mono">
                       <span>{item.startDate} <span className="text-[#8B95A1] mx-0.5">~</span> {item.endDate}</span>
                     </span>
                  </td>
                  <td className="px-4 text-center text-[14px] text-[#4E5968] font-mono border-r border-[#E5E8EB]">{item.order}</td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <span className={`text-[14px] font-semibold ${item.isVisible ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
                      {item.isVisible ? '노출' : '미노출'}
                    </span>
                  </td>
                  <td className="px-4 text-[14px] text-center text-[#4E5968] truncate border-r border-[#E5E8EB]">{item.author}</td>
                  <td className="px-4 text-center text-[14px] text-[#8B95A1] font-mono tracking-tight">
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
                <h3 className="text-[16px] font-semibold text-[#191F28]">배너 {editItem ? '수정' : '등록'}</h3>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 배너명 */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-[14px] font-semibold text-[#191F28]">배너명 <span className="text-[#F04452]">*</span></label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            if (!title.trim()) setErrors(prev => ({...prev, title: '배너명을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, title: ''}));
                        }}
                        placeholder="배너명을 입력하세요 (내부 관리용)"
                        className={`w-full h-[40px] px-4 bg-white border ${errors.title ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all`}
                      />
                      {errors.title && <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.title}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. 게시 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">게시 설정</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* 게시 대상 */}
                   <div className="space-y-2">
                    <label className="block text-[14px] font-semibold text-[#191F28] mb-2 text-sm">게시 대상 <span className="text-[#F04452]">*</span></label>
                    <div className="flex items-center gap-4 mb-3">
                        {['ALL', 'COMPANY', 'ERP'].map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="targetType" 
                                    value={type}
                                    checked={targetType === type}
                                    onChange={() => {
                                        setTargetType(type as 'ALL' | 'COMPANY' | 'ERP');
                                        setTargetDetails([]);
                                        setErrors(prev => ({...prev, targetDetails: ''}));
                                    }}
                                    className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                                />
                                <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28] transition-colors font-medium">
                                    {type === 'ALL' ? '전체기업' : type === 'COMPANY' ? '기업별' : 'ERP별'}
                                </span>
                            </label>
                        ))}
                    </div>

                    {targetType === 'COMPANY' && (
                        <div className="mt-3 bg-white p-3 border border-[#D1D6DB] rounded-md max-h-40 overflow-y-auto space-y-2 shadow-inner">
                             {mockCompanies.map(comp => (
                                 <label key={comp} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                                        checked={targetDetails.includes(comp)}
                                        onChange={(e) => {
                                            const newDetails = e.target.checked 
                                                ? [...targetDetails, comp]
                                                : targetDetails.filter(d => d !== comp);
                                            setTargetDetails(newDetails);
                                            if (newDetails.length > 0) {
                                                const next = {...errors};
                                                delete next.targetDetails;
                                                setErrors(next);
                                            }
                                        }}
                                    />
                                    <span className="text-[13px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">{comp}</span>
                                 </label>
                             ))}
                        </div>
                    )}

                    {targetType === 'ERP' && (
                        <div className="mt-3 bg-white p-3 border border-[#D1D6DB] rounded-md max-h-40 overflow-y-auto space-y-2 shadow-inner">
                             {mockERPs.map(erp => (
                                 <label key={erp} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                                        checked={targetDetails.includes(erp)}
                                        onChange={(e) => {
                                            const newDetails = e.target.checked 
                                                ? [...targetDetails, erp]
                                                : targetDetails.filter(d => d !== erp);
                                            setTargetDetails(newDetails);
                                            if (newDetails.length > 0) {
                                                const next = {...errors};
                                                delete next.targetDetails;
                                                setErrors(next);
                                            }
                                        }}
                                    />
                                    <span className="text-[13px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">{erp}</span>
                                 </label>
                             ))}
                        </div>
                    )}
                    {errors.targetDetails && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.targetDetails}</p>}
                   </div>

                    {/* 노출 여부 */}
                    <div className="space-y-4 p-4 border border-[#E5E8EB] rounded-lg bg-[#F9FAFB]">
                        <span className="text-[14px] font-semibold text-[#191F28] block">노출 여부 <span className="text-[#F04452]">*</span></span>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="isVisible" checked={isVisible} onChange={() => setIsVisible(true)} className="w-[18px] h-[18px] border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-[14px] text-[#191F28]">노출</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="isVisible" checked={!isVisible} onChange={() => setIsVisible(false)} className="w-[18px] h-[18px] border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-[14px] text-[#191F28]">미노출</span>
                            </label>
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-[#E5E8EB] mt-4">
                            <label className="block text-[14px] font-semibold text-[#191F28] text-sm">노출 순서 <span className="text-[#F04452]">*</span></label>
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
                                    className={`w-24 h-[36px] px-3 bg-white border ${errors.order ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded text-[14px] outline-none focus:border-[#008d75] text-center text-[#191F28] transition-all`}
                                />
                                <span className="text-[13px] text-[#8B95A1]">낮은 숫자일수록 상단에 노출됩니다.</span>
                            </div>
                            {errors.order && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.order}</p>}
                        </div>
                    </div>
                  </div>
                </div>

                {/* 3. 배너 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">배너 상세</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 이미지 파일 */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-[14px] font-semibold text-[#191F28]">배너 이미지 <span className="text-[#F04452]">*</span></label>
                        <div className={`mt-1 flex justify-center px-6 pt-6 pb-6 border-[1.5px] border-dashed rounded-lg ${errors.imageUrl ? 'border-[#F04452] bg-[#F04452]/5' : 'border-[#D1D6DB] bg-[#F9FAFB]'} hover:bg-[#F2F4F6] transition-colors`}>
                            <div className="space-y-1 text-center">
                                {imageUrl ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 bg-[#008d7510] text-[#008d75] flex items-center justify-center rounded-lg mb-2">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <p className="text-[13px] text-[#191F28] font-medium truncate max-w-[200px]">{imageUrl}</p>
                                        <label className="cursor-pointer text-[13px] text-[#008d75] font-semibold flex items-center gap-1 hover:underline">
                                           <Upload className="w-3.5 h-3.5" />
                                           <span>변경하기</span>
                                           <input type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="mx-auto h-10 w-10 text-[#8B95A1]" />
                                        <div className="flex text-[14px] text-[#4E5968] justify-center mt-2">
                                            <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#008d75] hover:text-[#007a65] focus-within:outline-none">
                                                <span>이미지 파일 업로드</span>
                                                <input type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                            </label>
                                        </div>
                                        <p className="text-[12px] text-[#8B95A1] mt-1">PNG, JPG (권장 해상도 1200x400)</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {errors.imageUrl && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.imageUrl}</p>}
                    </div>
                  </div>
                </div>

                {/* 4. 운영 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">게시 기간 설정</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 노출 기간 */}
                    <div className="space-y-2 p-4 border border-[#E5E8EB] rounded-lg bg-[#F9FAFB] md:col-span-2">
                        <label className="block text-[14px] font-semibold text-[#191F28] mb-2 text-sm">노출 기간 <span className="text-[#F04452]">*</span></label>
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
                              className={`flex-1 h-[36px] px-3 bg-white border ${errors.startDate ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded text-[14px] outline-none focus:border-[#008d75] text-[#191F28]`} 
                            />
                            <div className="text-[#8B95A1] text-sm">~</div>
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
                                className={`flex-1 h-[36px] px-3 bg-white border ${errors.endDate ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded text-[14px] outline-none focus:border-[#008d75] text-[#191F28]`} 
                            />
                        </div>
                        {errors.startDate && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.startDate}</p>}
                        {!errors.startDate && errors.endDate && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.endDate}</p>}
                    </div>

                    {/* 다음 섹션 */}

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
                    <h3 className="text-[16px] font-bold text-[#191F28] mb-2">배너를 삭제하시겠습니까?</h3>
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
