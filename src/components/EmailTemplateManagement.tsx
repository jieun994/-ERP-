import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmailTemplate {
  id: string;
  no: number;
  templateCode: string;
  templateName: string;
  dispatchType: string;
  subject: string;
  body: string;
  isActive: boolean;
  author: string;
  updatedAt: string;
}

const DISPATCH_TYPES = ['가입 완료', '승인 완료', '반려 안내', '비밀번호 재설정', '기타 안내'];
const ALLOWED_VARIABLES = ['#{userName}', '#{authCode}', '#{expireMinutes}', '#{approveDate}'];

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    no: 1,
    templateCode: 'TPL_JOIN_COMP',
    templateName: '회원가입 완료 안내',
    dispatchType: '가입 완료',
    subject: '[하나은행] #{userName}님, 회원가입이 완료되었습니다.',
    body: '안녕하세요, #{userName}님.\n\n하나은행 펌뱅킹 서비스에 가입해 주셔서 감사합니다.\n가입이 정상적으로 완료되었으며, 지금부터 서비스 이용이 가능합니다.\n\n감사합니다.',
    isActive: true,
    author: 'admin1',
    updatedAt: '2024-05-01',
  },
  {
    id: '2',
    no: 2,
    templateCode: 'TPL_PWD_RESET',
    templateName: '비밀번호 재설정 인증코드',
    dispatchType: '비밀번호 재설정',
    subject: '[하나은행] 비밀번호 재설정 인증코드 안내',
    body: '안녕하세요, #{userName}님.\n\n비밀번호 재설정을 위한 인증코드입니다.\n아래 인증코드를 화면에 입력해 주세요.\n\n인증코드: #{authCode}\n유효시간: #{expireMinutes}분\n\n감사합니다.',
    isActive: true,
    author: 'admin2',
    updatedAt: '2024-05-05',
  },
];

export default function EmailTemplateManagement() {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<EmailTemplate[]>(mockTemplates);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Search State
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchStatus, setSearchStatus] = useState('ALL');

  // Form State
  const [editItem, setEditItem] = useState<EmailTemplate | null>(null);
  const [templateCode, setTemplateCode] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [dispatchType, setDispatchType] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredData.map(d => d.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleResetSearch = () => {
    setSearchCode('');
    setSearchName('');
    setSearchType('');
    setSearchStatus('ALL');
  };

  const handleToggleVisibility = () => {
    if (selectedIds.length === 0) {
      alert('상태를 변경할 템플릿을 선택해주세요.');
      return;
    }
    
    const selectedItems = data.filter(item => selectedIds.includes(item.id));
    const allVisible = selectedItems.every(item => item.isActive);
    const targetVisibility = !allVisible;

    if (window.confirm(`선택한 템플릿을 ${targetVisibility ? '사용' : '미사용'} 상태로 변경하시겠습니까?`)) {
      setData(prev => prev.map(item => 
        selectedIds.includes(item.id) ? { ...item, isActive: targetVisibility } : item
      ));
      setSelectedIds([]);
    }
  };

  const openForm = (item?: EmailTemplate) => {
    if (item) {
      setEditItem(item);
      setTemplateCode(item.templateCode);
      setTemplateName(item.templateName);
      setDispatchType(item.dispatchType);
      setIsActive(item.isActive);
      setSubject(item.subject);
      setBody(item.body);
    } else {
      setEditItem(null);
      setTemplateCode('');
      setTemplateName('');
      setDispatchType('');
      setIsActive(true);
      setSubject('');
      setBody('');
    }
    setErrors({});
    setViewMode('form');
  };

  const closeForm = () => {
    const isDirty = editItem 
      ? templateCode !== editItem.templateCode || templateName !== editItem.templateName || dispatchType !== editItem.dispatchType || isActive !== editItem.isActive || subject !== editItem.subject || body !== editItem.body
      : templateCode !== '' || templateName !== '' || dispatchType !== '' || subject !== '' || body !== '';

    if (isDirty) {
      setShowCancelWarning(true);
    } else {
      setViewMode('list');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!templateCode.trim()) newErrors.templateCode = '템플릿 코드는 필수 항목입니다.';
    else if (!editItem && data.some(d => d.templateCode === templateCode.trim())) {
      newErrors.templateCode = '이미 등록된 템플릿 코드입니다.';
    }
    if (!templateName.trim()) newErrors.templateName = '템플릿명은 필수 항목입니다.';
    if (!dispatchType.trim()) newErrors.dispatchType = '발송 유형은 필수 항목입니다.';
    if (!subject.trim()) newErrors.subject = '이메일 제목은 필수 항목입니다.';
    if (!body.trim()) newErrors.body = '이메일 본문은 필수 항목입니다.';

    // Check invalid variables
    const checkVariables = (text: string) => {
      const regex = /#\{([^}]+)\}/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (!ALLOWED_VARIABLES.includes(`#{${match[1]}}`)) {
          return true;
        }
      }
      return false;
    };

    if (checkVariables(subject)) newErrors.subject = '허용되지 않은 변수가 포함되어 있습니다.';
    if (checkVariables(body)) newErrors.body = '허용되지 않은 변수가 포함되어 있습니다.';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Focus first error (simplified)
      return false;
    }
    return true;
  };

  const saveForm = () => {
    if (!validateForm()) return;

    const newObj: EmailTemplate = {
      id: editItem ? editItem.id : Math.random().toString(36).substr(2, 9),
      no: editItem ? editItem.no : (data.length > 0 ? Math.max(...data.map(d => d.no)) + 1 : 1),
      templateCode: templateCode.trim(),
      templateName: templateName.trim(),
      dispatchType: dispatchType.trim(),
      subject: subject.trim(),
      body: body.trim(),
      isActive,
      author: editItem ? editItem.author : 'admin1',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    if (editItem) {
      setData(prev => prev.map(item => item.id === editItem.id ? newObj : item));
      setEditItem(newObj);
      alert('성공적으로 저장되었습니다.');
    } else {
      setData(prev => [newObj, ...prev]);
      setEditItem(newObj);
      alert('성공적으로 등록되었습니다.');
    }
  };

  const filteredData = data.filter(item => {
    if (searchCode && !item.templateCode.toLowerCase().includes(searchCode.toLowerCase())) return false;
    if (searchName && !item.templateName.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (searchType && item.dispatchType !== searchType) return false;
    if (searchStatus !== 'ALL') {
      const isStatusActive = searchStatus === 'USE';
      if (item.isActive !== isStatusActive) return false;
    }
    return true;
  });

  return (
    <div className="space-y-0 pb-20">
      {/* Search Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
        <div className="flex flex-wrap items-center justify-start gap-x-12 gap-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">템플릿 코드</span>
            <input 
              type="text" 
              placeholder="템플릿 코드 입력"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-48 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">템플릿명</span>
            <input 
              type="text" 
              placeholder="템플릿명 입력"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-48 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">발송 유형</span>
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-40 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              <option value="">전체</option>
              {DISPATCH_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">사용 여부</span>
            <select 
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-32 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all"
            >
              <option value="ALL">전체</option>
              <option value="USE">사용</option>
              <option value="UNUSE">미사용</option>
            </select>
          </div>
          <div className="flex-1 flex justify-end gap-3">
            <button 
              onClick={handleResetSearch} 
              className="h-[40px] px-6 bg-white border border-[#D1D6DB] text-[#333333] hover:bg-gray-50 rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              초기화
            </button>
            <button 
              className="h-[40px] px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              조회하기
            </button>
          </div>
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
            onClick={() => openForm()}
            className="h-[32px] px-4 bg-[#008d75] text-white rounded-md text-[13px] font-semibold hover:bg-[#007a65] transition-colors shadow-sm"
          >등록</button>
          <button 
            onClick={handleToggleVisibility}
            className="h-[32px] px-4 bg-white border border-[#D1D6DB] rounded-md text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors shadow-sm"
          >
            사용여부 변경
          </button>
          <button 
            onClick={() => {
              if (selectedIds.length !== 1) {
                alert('수정할 템플릿을 1개만 선택해주세요.');
                return;
              }
              const item = data.find(d => d.id === selectedIds[0]);
              if (item) openForm(item);
            }}
            className="h-[32px] px-4 bg-white border border-[#D1D6DB] rounded-md text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors shadow-sm"
          >
            수정
          </button>
        </div>
      </div>

          {/* Grid */}
          <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px] whitespace-nowrap">
                <thead>
                  <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                    <th className="h-[52px] px-4 text-center border-r border-[#E5E8EB] w-12">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                        checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-20">No.</th>
                    <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-48">템플릿 코드</th>
                    <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-auto">템플릿명</th>
                    <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-36">발송 유형</th>
                    <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-28">사용 여부</th>
                    <th className="h-[52px] px-4 text-[14px] font-semibold text-center">최종수정일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8EB]">
                  {filteredData.length === 0 ? (
                    <tr>
                       <td colSpan={7} className="py-12 text-center text-[#8B95A1] text-[14px]">
                        등록된 이메일 템플릿이 없습니다.
                       </td>
                    </tr>
                  ) : filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`h-[52px] transition-colors hover:bg-[#F9FAFB] ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : 'bg-white'}`}
                    >
                      <td className="px-4 text-center border-r border-[#E5E8EB]">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{item.no}</td>
                      <td className="px-4 text-center text-[14px] font-mono font-medium text-[#191F28] border-r border-[#E5E8EB]">{item.templateCode}</td>
                      <td className="px-4 text-[14px] border-r border-[#E5E8EB]">
                        <div className="font-medium text-[#191F28] truncate max-w-sm">
                           {item.templateName}
                        </div>
                      </td>
                      <td className="px-4 text-center text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.dispatchType}</td>
                      <td className="px-4 text-center border-r border-[#E5E8EB]">
                        <span className={`text-[13px] font-bold ${item.isActive ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
                          {item.isActive ? '사용' : '미사용'}
                        </span>
                      </td>
                      <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono tracking-tight">
                        {item.updatedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

      <AnimatePresence>
      {viewMode === 'form' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0 bg-white">
              <h3 className="text-[16px] font-semibold text-[#191F28]">이메일 템플릿 {editItem ? '수정' : '등록'}</h3>
              <button onClick={closeForm} className="p-2 text-[#8B95A1] hover:text-[#191F28] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                  <h4 className="text-[14px] font-semibold text-[#191F28]">기본 정보</h4>
                </div>
                
                <div className="pl-3 space-y-4">
                  <div className="space-y-1.5">
                      <label className="block text-[14px] font-semibold text-[#191F28]">템플릿명 <span className="text-[#F04452]">*</span></label>
                      <input 
                        type="text" 
                        value={templateName}
                        onChange={(e) => {
                          setTemplateName(e.target.value);
                          if(e.target.value) {
                            const next = {...errors}; delete next.templateName; setErrors(next);
                          }
                        }}
                        onBlur={() => { if(!templateName.trim()) setErrors(prev => ({...prev, templateName: '템플릿명은 필수입니다.'})) }}
                        placeholder="템플릿 목록에서 구분할 이름"
                        className={`w-full h-[36px] px-3 bg-white border ${errors.templateName ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]`}
                      />
                      {errors.templateName && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.templateName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-[#191F28]">템플릿 코드 <span className="text-[#F04452]">*</span></label>
                        <input 
                          type="text" 
                          value={templateCode}
                          onChange={(e) => {
                            setTemplateCode(e.target.value);
                            if(e.target.value) {
                              const next = {...errors}; delete next.templateCode; setErrors(next);
                            }
                          }}
                          disabled={!!editItem}
                          onBlur={() => { if(!templateCode.trim()) setErrors(prev => ({...prev, templateCode: '템플릿 코드는 필수입니다.'})) }}
                          placeholder="영문 대문자, 숫자, 언더바(_)"
                          className={`w-full h-[36px] px-3 border ${errors.templateCode ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] outline-none transition-all font-mono tracking-tight ${editItem ? 'bg-[#F9FAFB] text-[#8B95A1] cursor-not-allowed' : 'bg-white text-[#191F28] focus:border-[#008d75]'}`}
                        />
                        {errors.templateCode && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.templateCode}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-[#191F28]">발송 유형 <span className="text-[#F04452]">*</span></label>
                        <select 
                          value={dispatchType}
                          onChange={(e) => {
                              setDispatchType(e.target.value);
                              if (e.target.value) {
                                  const next = {...errors};
                                  delete next.dispatchType;
                                  setErrors(next);
                              }
                          }}
                          className={`w-full h-[36px] px-3 bg-white border ${errors.dispatchType ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all`}
                        >
                          <option value="">유형 선택</option>
                          {DISPATCH_TYPES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {errors.dispatchType && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.dispatchType}</p>}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                      <label className="block text-[14px] font-semibold text-[#191F28]">사용 여부</label>
                      <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="isActive" checked={isActive} onChange={() => setIsActive(true)} className="w-4 h-4 accent-[#008d75]" />
                              <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">사용</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="isActive" checked={!isActive} onChange={() => setIsActive(false)} className="w-4 h-4 accent-[#008d75]" />
                              <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">미사용</span>
                          </label>
                      </div>
                  </div>
                </div>
              </div>

              {/* 내용 입력 영역 */}
              <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                  <h4 className="text-[14px] font-semibold text-[#191F28]">이메일 내용</h4>
                </div>
                
                <div className="pl-3 space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[14px] font-semibold text-[#191F28]">이메일 제목 <span className="text-[#F04452]">*</span></label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        if(e.target.value) { const next = {...errors}; delete next.subject; setErrors(next); }
                      }}
                      placeholder="수신자에게 표시될 메일 제목을 입력하세요"
                      className={`w-full h-[36px] px-3 bg-white border ${errors.subject ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]`}
                    />
                    {errors.subject && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.subject}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[14px] font-semibold text-[#191F28]">이메일 본문 <span className="text-[#F04452]">*</span></label>
                    <textarea 
                      value={body}
                      onChange={(e) => {
                        setBody(e.target.value);
                        if(e.target.value) { const next = {...errors}; delete next.body; setErrors(next); }
                      }}
                      placeholder="메일 본문을 입력하세요. 줄바꿈은 메일에서도 동일하게 적용됩니다."
                      rows={8}
                      className={`w-full px-4 py-3 bg-[#F9FAFB] border ${errors.body ? 'border-[#F04452]' : 'border-[#D1D6DB]'} rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] focus:bg-white transition-all resize-y placeholder-[#8B95A1]`}
                    />
                    {errors.body && <p className="text-[12px] text-[#F04452] mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {errors.body}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] shrink-0 gap-3">
              <button 
                onClick={closeForm}
                className="w-[120px] h-[40px] border border-[#D1D6DB] rounded-md bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F2F4F6] transition-colors"
              >
                취소
              </button>
              <button 
                onClick={saveForm}
                className="w-[120px] h-[40px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[14px] font-semibold transition-colors shadow-sm"
              >
                저장하기
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
                  <h3 className="text-[18px] font-bold text-[#191F28] mb-3">저장되지 않은 변경사항</h3>
                  <p className="text-[14px] text-[#4E5968] mb-10 leading-relaxed">현재 입력한 내용이 유실될 수 있습니다.<br/>그래도 목록으로 이동하시겠습니까?</p>
                  <div className="flex gap-2 justify-center">
                      <button 
                          onClick={() => setShowCancelWarning(false)}
                          className="flex-1 h-[44px] bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[14px] font-semibold hover:bg-[#F9FAFB] transition-colors"
                      >
                          계속 작성
                      </button>
                      <button 
                          onClick={() => {
                              setShowCancelWarning(false);
                              setViewMode('list');
                          }}
                          className="flex-1 h-[44px] bg-[#008d75] text-white rounded-md text-[14px] font-semibold hover:bg-[#007a65] transition-colors shadow-sm"
                      >
                          이동하기
                      </button>
                  </div>
              </motion.div>
          </div>
          )}
      </AnimatePresence>
    </div>
  );
}
