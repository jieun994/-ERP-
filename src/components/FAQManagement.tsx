import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button, FilterBar, DataTable, StatusBadge, ConfirmModal, Input, Select, Textarea } from './ui';

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
  const location = useLocation();
  const [data, setData] = useState<FAQ[]>(mockFAQs);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FAQ | null>(null);

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
    <div className="w-full pb-20">
      {/* Search Area */}
      <FilterBar
        onSearch={() => {}}
        onReset={() => {
          setKeyword('');
          setSearchTopic('question');
          setVisibilityFilter('ALL');
        }}
      >
        <FilterBar.Field label="검색조건">
          <Select
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            fullWidth
          >
            <option value="question">질문</option>
            <option value="answer">답변</option>
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
            onChange={(e) => setVisibilityFilter(e.target.value as 'ALL' | 'VISIBLE' | 'HIDDEN')}
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
          onClick={() => {
            if (selectedIds.length !== 1) {
              alert('수정할 FAQ를 1개만 선택해주세요.');
              return;
            }
            const item = data.find(d => d.id === selectedIds[0]);
            if (item) openForm(item);
          }}
          disabled={selectedIds.length !== 1}
        >수정</Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (selectedIds.length === 0) {
              alert('삭제할 FAQ를 선택해주세요.');
              return;
            }
            setShowDeleteWarning('bulk');
          }}
          disabled={selectedIds.length === 0}
        >삭제</Button>
        <Button variant="ghost" size="sm" onClick={handleToggleVisibility} disabled={selectedIds.length === 0}>사용여부 변경</Button>
      </DataTable.Controls>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-border-gray overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
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
                <th className="h-[52px] px-4 text-body font-semibold text-text-body border-r border-border-gray">질문</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-20 border-r border-border-gray">순서</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-24 border-r border-border-gray">노출 여부</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-24 border-r border-border-gray">등록자</th>
                <th className="h-[52px] px-4 text-body font-semibold text-text-body text-center w-32">최종수정일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredData.length === 0 ? (
                <tr>
                   <td colSpan={7} className="py-20 text-center text-text-sub text-body">
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
                    <div className="font-medium text-text-main truncate max-w-sm xl:max-w-md">
                       {item.question}
                    </div>
                  </td>
                  <td className="px-4 text-center text-body text-text-body font-mono border-r border-border-gray">{item.order}</td>
                  <td className="px-4 text-center border-r border-border-gray">
                    <StatusBadge status={item.isVisible ? '노출' : '미노출'} />
                  </td>
                  <td className="px-4 text-center text-body-sm text-text-body border-r border-border-gray">{item.author}</td>
                  <td className="px-4 text-center text-body-sm text-text-sub font-mono tracking-tight">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
                <h3 className="text-title-sm font-semibold text-text-main">FAQ {editItem ? '수정' : '등록'}</h3>
                <button
                  onClick={closeForm}
                  className="p-2 text-text-sub hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">


                {/* 기본정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">기본 정보</h4>
                  </div>

                  <div className="space-y-4">
                    {/* 질문 */}
                    <div className="space-y-1.5">
                        <label className="block text-body font-semibold text-text-main">질문 <span className="text-status-error">*</span></label>
                        <Input
                          fullWidth
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onBlur={() => {
                            if (!question.trim()) setErrors(prev => ({...prev, question: '질문을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, question: ''}));
                          }}
                          placeholder="자주 묻는 질문을 입력하세요."
                          error={!!errors.question}
                        />
                        {errors.question && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.question}</p>}
                    </div>

                    {/* 답변 */}
                    <div className="space-y-1.5">
                        <label className="block text-body font-semibold text-text-main">답변 <span className="text-status-error">*</span></label>
                        <Textarea
                          fullWidth
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          onBlur={() => {
                            if (!answer.trim()) setErrors(prev => ({...prev, answer: '답변을 입력해주세요.'}));
                            else setErrors(prev => ({...prev, answer: ''}));
                          }}
                          placeholder="상세 답변 내용을 입력하세요."
                          rows={8}
                          error={!!errors.answer}
                        />
                        {errors.answer && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.answer}</p>}
                    </div>
                  </div>
                </div>

                {/* 게시 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-body-lg font-semibold text-text-main">게시 설정</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 노출 여부 */}
                    <div className="space-y-1.5">
                        <label className="block text-body font-semibold text-text-main text-body">노출 여부 <span className="text-status-error">*</span></label>
                        <div className="flex items-center gap-6 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="isVisible" checked={isVisible} onChange={() => setIsVisible(true)} className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-body text-text-body group-hover:text-text-main transition-colors">노출 (ON)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="isVisible" checked={!isVisible} onChange={() => setIsVisible(false)} className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" />
                                <span className="text-body text-text-body group-hover:text-text-main transition-colors">숨김 (OFF)</span>
                            </label>
                        </div>
                    </div>

                    {/* 노출 순서 */}
                    <div className="space-y-1.5 pt-2">
                        <label className="block text-body font-semibold text-text-main text-body">노출 순서</label>
                        <div className="flex items-center gap-3 mt-1">
                            <Input
                                size="sm"
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
                                placeholder="예: 1"
                                error={!!errors.order}
                                className="text-center"
                                style={{ width: 96 }}
                            />
                            <span className="text-body-sm text-text-sub">낮은 숫자일수록 상단에 노출됩니다.</span>
                        </div>
                        {errors.order && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.order}</p>}
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-center h-[72px] px-6 border-t border-border-gray bg-bg-gray shrink-0 gap-3">
                <Button variant="secondary" size="md" style={{ width: 120 }} onClick={closeForm}>
                  취소
                </Button>
                <Button variant="primary" size="md" style={{ width: 120 }} onClick={saveForm}>
                  저장하기
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={!!showDeleteWarning}
          variant="danger"
          title="FAQ를 삭제하시겠습니까?"
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
          onConfirm={() => {
            setShowCancelWarning(false);
            setIsModalOpen(false);
          }}
          onCancel={() => setShowCancelWarning(false)}
        />
    </div>
  );
}
