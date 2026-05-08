import React, { useState } from 'react';
import { Search, Plus, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQ {
  id: string;
  no: number;
  category: string;
  question: string;
  answer: string;
  order: number;
  isVisible: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const FAQ_CATEGORIES = ['서비스 이용', '결제/정산', '가입/인증', '시스템 연동', '기타'];

const mockFAQs: FAQ[] = [
  {
    id: '1',
    no: 1,
    category: '결제/정산',
    question: '결제 수수료는 어떻게 되나요?',
    answer: '결제 수수료는 계약된 요율에 따라 다릅니다. 상세 요율은 계약서를 참고해 주시기 바랍니다.',
    order: 1,
    isVisible: true,
    author: 'admin1',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-01',
  },
  {
    id: '2',
    no: 2,
    category: '시스템 연동',
    question: '연동 매뉴얼은 어디서 다운로드할 수 있나요?',
    answer: '개발자 센터의 문서 메뉴에서 최신 API 연동 매뉴얼을 다운로드하실 수 있습니다.',
    order: 2,
    isVisible: true,
    author: 'admin2',
    createdAt: '2024-05-05',
    updatedAt: '2024-05-06',
  },
];

export default function FAQManagement() {
  const [data, setData] = useState<FAQ[]>(mockFAQs);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FAQ | null>(null);

  // Warning Modals
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null); // null if closed, 'bulk' or id

  // Form State
  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [isVisible, setIsVisible] = useState(true);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter state
  const [searchTopic, setSearchTopic] = useState('question');
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
      alert('상태를 변경할 FAQ를 선택해주세요.');
      return;
    }
    
    const selectedItems = data.filter(item => selectedIds.includes(item.id));
    const allVisible = selectedItems.every(item => item.isVisible);
    const targetVisibility = !allVisible;

    if (window.confirm(`선택한 FAQ를 ${targetVisibility ? '노출' : '숨김'} 상태로 변경하시겠습니까?`)) {
      setData(prev => prev.map(item => 
        selectedIds.includes(item.id) ? { ...item, isVisible: targetVisibility } : item
      ));
      setSelectedIds([]);
    }
  };

  const openForm = (item?: FAQ) => {
    if (item) {
      setEditItem(item);
      setCategory(item.category);
      setQuestion(item.question);
      setAnswer(item.answer);
      setOrder(item.order);
      setIsVisible(item.isVisible);
    } else {
      setEditItem(null);
      setCategory('');
      setQuestion('');
      setAnswer('');
      setOrder('');
      setIsVisible(true);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!question.trim()) newErrors.question = '질문을 입력해주세요.';
    if (!answer.trim()) newErrors.answer = '답변을 입력해주세요.';
    if (order !== '' && (isNaN(Number(order)) || Number(order) < 1)) {
       newErrors.order = '유효한 노출 순서를 숫자(1 이상)로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeForm = () => {
    const isDirty = editItem 
      ? category !== editItem.category || question !== editItem.question || answer !== editItem.answer || order !== editItem.order || isVisible !== editItem.isVisible
      : category !== '' || question !== '' || answer !== '' || order !== '';

    if (isDirty) {
      setShowCancelWarning(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const saveForm = () => {
    if (!validateForm()) return;

    const newObj: FAQ = {
      id: editItem ? editItem.id : Math.random().toString(36).substr(2, 9),
      no: editItem ? editItem.no : (data.length > 0 ? Math.max(...data.map(d => d.no)) + 1 : 1),
      category: category.trim(),
      question: question.trim(),
      answer: answer.trim(),
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

  const filteredData = data.filter(item => {
    let matchesKeyword = true;
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      if (searchTopic === 'question') matchesKeyword = item.question.toLowerCase().includes(lowerKeyword);
      else if (searchTopic === 'answer') matchesKeyword = item.answer.toLowerCase().includes(lowerKeyword);
      else matchesKeyword = item.question.toLowerCase().includes(lowerKeyword) || item.answer.toLowerCase().includes(lowerKeyword);
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
              <option value="question">질문</option>
              <option value="answer">답변</option>
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
          <button 
            onClick={() => {
              setKeyword('');
              setSearchTopic('question');
              setVisibilityFilter('ALL');
            }}
            className="w-[100px] h-[48px] bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] rounded-md text-[15px] font-bold transition-colors shadow-sm"
          >
            초기화
          </button>
        </div>
      </div>


      {/* Grid Controls */}
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
                alert('수정할 FAQ를 1개만 선택해주세요.');
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
                alert('삭제할 FAQ를 선택해주세요.');
                return;
              }
              setShowDeleteWarning('bulk');
            }}
            className="h-[32px] px-3 bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            삭제
          </button>
          
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-[#E5E8EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
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
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] border-r border-[#E5E8EB]">질문</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-20 border-r border-[#E5E8EB]">순서</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-24 border-r border-[#E5E8EB]">노출 여부</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-24 border-r border-[#E5E8EB]">등록자</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-[#4E5968] text-center w-32">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan={7} className="py-20 text-center text-[#8B95A1] text-[14px]">
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
                    <div className="font-medium text-[#191F28] truncate max-w-sm xl:max-w-md">
                       {item.question}
                    </div>
                  </td>
                  <td className="px-4 text-center text-[14px] text-[#4E5968] font-mono border-r border-[#E5E8EB]">{item.order}</td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <span className={`text-[14px] font-medium ${item.isVisible ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
                      {item.isVisible ? '노출' : '미노출'}
                    </span>
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB]">{item.author}</td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono tracking-tight">
                    {item.updatedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* FAQ Form Modal */}
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
              className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0">
                <h3 className="text-[16px] font-semibold text-[#191F28]">FAQ {editItem ? '수정' : '등록'}</h3>
                <button 
                  onClick={closeForm}
                  className="p-2 text-[#8B95A1] hover:text-[#191F28] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto w-full space-y-8 flex-1 bg-white">
                
                
                {/* 기본정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">기본 정보</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* 질문 */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-[#191F28]">질문 <span className="text-[#F04452]">*</span></label>
                        <input 
                        type="text" 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onBlur={() => {
                            if (!question.trim()) setErrors(prev => ({...prev, question: '질문을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, question: ''}));
                        }}
                        placeholder="자주 묻는 질문을 입력하세요."
                        className={`w-full h-[40px] px-4 bg-white border ${errors.question ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all`}
                        />
                        {errors.question && <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.question}</p>}
                    </div>

                    {/* 답변 */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-[#191F28]">답변 <span className="text-[#F04452]">*</span></label>
                        <textarea 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onBlur={() => {
                            if (!answer.trim()) setErrors(prev => ({...prev, answer: '답변을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, answer: ''}));
                        }}
                        placeholder="상세 답변 내용을 입력하세요."
                        rows={8}
                        className={`w-full px-4 py-3 bg-white border ${errors.answer ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all resize-none`}
                        />
                        {errors.answer && <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.answer}</p>}
                    </div>
                  </div>
                </div>

                {/* 게시 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                    <h4 className="text-[15px] font-semibold text-[#191F28]">게시 설정</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 노출 여부 */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-[#191F28] text-sm">노출 여부 <span className="text-[#F04452]">*</span></label>
                        <div className="flex items-center gap-6 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="isVisible" checked={isVisible} onChange={() => setIsVisible(true)} className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">노출 (ON)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="isVisible" checked={!isVisible} onChange={() => setIsVisible(false)} className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28] transition-colors">숨김 (OFF)</span>
                            </label>
                        </div>
                    </div>

                    {/* 노출 순서 */}
                    <div className="space-y-1.5 pt-2">
                        <label className="block text-[14px] font-semibold text-[#191F28] text-sm">노출 순서</label>
                        <div className="flex items-center gap-3 mt-1">
                            <input 
                                type="number" 
                                min="1"
                                value={order}
                                onChange={(e) => {
                                    setOrder(e.target.value === '' ? '' : Number(e.target.value));
                                    if (e.target.value !== '' && Number(e.target.value) < 1) {
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
                    <h3 className="text-[16px] font-bold text-[#191F28] mb-2">FAQ를 삭제하시겠습니까?</h3>
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
