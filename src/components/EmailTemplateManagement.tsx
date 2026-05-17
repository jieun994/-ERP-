import React, { useState } from 'react';
import { AlertCircle, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, FilterBar, DataTable, StatusBadge, ConfirmModal, Input, Select, Textarea } from './ui';

type TemplateCategory = 'REQUIRED' | 'OPTIONAL';

interface EmailTemplate {
  id: string;
  no: number;
  templateCode: string;
  templateName: string;
  category: TemplateCategory;
  dispatchType: string;
  subject: string;
  body: string;
  isActive: boolean;
  author: string;
  updatedAt: string;
}

const DISPATCH_TYPES = ['가입 완료', '승인 완료', '반려 안내', '비밀번호 재설정', '기타 안내'];
const CATEGORY_LABELS: Record<TemplateCategory, string> = { REQUIRED: '필수', OPTIONAL: '선택' };

const DEFAULT_HEADER_HTML = `<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-bottom:1px solid #e5e8eb;">
  <tr><td style="padding:16px 24px;">
    <img src="/logo.png" alt="하나은행" height="28" style="vertical-align:middle;" />
    <span style="margin-left:8px;font-size:14px;font-weight:600;color:#191F28;">ERP 펜뱅킹</span>
  </td></tr>
</table>`;

const DEFAULT_FOOTER_HTML = `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-top:1px solid #e5e8eb;">
  <tr><td style="padding:24px;font-size:12px;color:#8b95a1;line-height:1.8;">
    본 메일은 발신전용 메일로 회신이 되지 않습니다.<br/>
    고객센터 상담시간(평일) 9:00 ~ 18:00 | 국내발신 1800-1111 | 해외발신 82-1800-1111<br/>
    서울특별시 중구 을지로 66 사업자번호 : 104-86-56659<br/>
    COPYRIGHT © 2017 by Hana Card. ALL RIGHTS RESERVED
  </td></tr>
</table>`;

const mockTemplates: EmailTemplate[] = [
  {
    id: '1', no: 1,
    templateCode: 'TPL_JOIN_COMP',
    templateName: '회원가입 완료 안내',
    category: 'REQUIRED',
    dispatchType: '가입 완료',
    subject: '[하나은행] #{userName}님, 회원가입이 완료되었습니다.',
    body: `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:32px 24px;font-size:15px;color:#191F28;line-height:1.8;">
    안녕하세요, #{userName}님.<br/><br/>
    하나은행 펜뱅킹 서비스에 가입해 주셔서 감사합니다.
  </td></tr>
</table>`,
    isActive: true, author: 'admin1', updatedAt: '2024-05-01',
  },
  {
    id: '2', no: 2,
    templateCode: 'TPL_PWD_RESET',
    templateName: '비밀번호 재설정 인증코드',
    category: 'REQUIRED',
    dispatchType: '비밀번호 재설정',
    subject: '[하나은행] 비밀번호 재설정 인증코드 안내',
    body: `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:32px 24px;font-size:15px;color:#191F28;line-height:1.8;">
    인증코드: <strong>#{authCode}</strong><br/>
    유효시간: #{expireMinutes}분
  </td></tr>
</table>`,
    isActive: true, author: 'admin2', updatedAt: '2024-05-05',
  },
  {
    id: '3', no: 3,
    templateCode: 'TPL_NOTICE_GUIDE',
    templateName: '기타 알림성 안내',
    category: 'OPTIONAL',
    dispatchType: '기타 안내',
    subject: '[하나은행] 알림 안내드립니다.',
    body: `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:32px 24px;font-size:15px;color:#191F28;line-height:1.8;">
    안녕하세요, #{userName}님.<br/><br/>
    안내드릴 사항이 있어 메일 드립니다.
  </td></tr>
</table>`,
    isActive: true, author: 'admin1', updatedAt: '2024-05-10',
  },
];

export default function EmailTemplateManagement() {
  // 탭
  const [activeTab, setActiveTab] = useState<'layout' | 'templates'>('layout');

  // 공통 레이아웃
  const [headerHtml, setHeaderHtml] = useState(DEFAULT_HEADER_HTML);
  const [footerHtml, setFooterHtml] = useState(DEFAULT_FOOTER_HTML);
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);
  const [showLayoutSaveConfirm, setShowLayoutSaveConfirm] = useState(false);

  // 템플릿 목록
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<EmailTemplate[]>(mockTemplates);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState<'ALL' | TemplateCategory>('ALL');
  const [searchType, setSearchType] = useState('ALL');
  const [searchStatus, setSearchStatus] = useState('ALL');

  // 폼 상태
  const [editItem, setEditItem] = useState<EmailTemplate | null>(null);
  const [templateCode, setTemplateCode] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('OPTIONAL');
  const [dispatchType, setDispatchType] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  const filteredData = data.filter(item => {
    if (searchCode && !item.templateCode.toLowerCase().includes(searchCode.toLowerCase())) return false;
    if (searchName && !item.templateName.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (searchCategory !== 'ALL' && item.category !== searchCategory) return false;
    if (searchType !== 'ALL' && item.dispatchType !== searchType) return false;
    if (searchStatus !== 'ALL') {
      const isStatusActive = searchStatus === 'USE';
      if (item.isActive !== isStatusActive) return false;
    }
    return true;
  });

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredData.map(d => d.id));
    else setSelectedIds([]);
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleResetSearch = () => {
    setSearchCode(''); setSearchName(''); setSearchCategory('ALL'); setSearchType('ALL'); setSearchStatus('ALL');
  };
  const handleToggleVisibility = () => {
    if (selectedIds.length === 0) { alert('상태를 변경할 템플릿을 선택해주세요.'); return; }
    const selectedItems = data.filter(item => selectedIds.includes(item.id));
    const allVisible = selectedItems.every(item => item.isActive);
    const targetVisibility = !allVisible;
    if (window.confirm(`선택한 템플릿을 ${targetVisibility ? '사용' : '미사용'} 상태로 변경하시겠습니까?`)) {
      setData(prev => prev.map(item => selectedIds.includes(item.id) ? { ...item, isActive: targetVisibility } : item));
      setSelectedIds([]);
    }
  };
  const openForm = (item?: EmailTemplate) => {
    if (item) {
      setEditItem(item); setTemplateCode(item.templateCode); setTemplateName(item.templateName);
      setCategory(item.category);
      setDispatchType(item.dispatchType); setIsActive(item.isActive); setSubject(item.subject); setBody(item.body);
    } else {
      setEditItem(null); setTemplateCode(''); setTemplateName('');
      setCategory('OPTIONAL');
      setDispatchType(''); setIsActive(true); setSubject(''); setBody('');
    }
    setErrors({}); setViewMode('form');
  };
  const closeForm = () => {
    const isDirty = editItem
      ? templateCode !== editItem.templateCode || templateName !== editItem.templateName ||
        category !== editItem.category ||
        dispatchType !== editItem.dispatchType || isActive !== editItem.isActive ||
        subject !== editItem.subject || body !== editItem.body
      : templateCode !== '' || templateName !== '' || category !== 'OPTIONAL' || dispatchType !== '' || subject !== '' || body !== '';
    if (isDirty) setShowCancelWarning(true);
    else setViewMode('list');
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!templateCode.trim()) newErrors.templateCode = '템플릿 코드는 필수 항목입니다.';
    else if (!editItem && data.some(d => d.templateCode === templateCode.trim()))
      newErrors.templateCode = '이미 등록된 템플릿 코드입니다.';
    if (!templateName.trim()) newErrors.templateName = '템플릿명은 필수 항목입니다.';
    if (!dispatchType.trim()) newErrors.dispatchType = '발송 유형은 필수 항목입니다.';
    if (!subject.trim()) newErrors.subject = '이메일 제목은 필수 항목입니다.';
    if (!body.trim()) newErrors.body = '이메일 본문은 필수 항목입니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const saveForm = () => {
    if (!validateForm()) return;
    const newObj: EmailTemplate = {
      id: editItem ? editItem.id : Math.random().toString(36).substr(2, 9),
      no: editItem ? editItem.no : (data.length > 0 ? Math.max(...data.map(d => d.no)) + 1 : 1),
      templateCode: templateCode.trim(), templateName: templateName.trim(),
      category,
      dispatchType: dispatchType.trim(), subject: subject.trim(), body: body.trim(),
      isActive, author: editItem ? editItem.author : 'admin1',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    if (editItem) {
      setData(prev => prev.map(item => item.id === editItem.id ? newObj : item));
      setEditItem(newObj); alert('성공적으로 저장되었습니다.');
    } else {
      setData(prev => [newObj, ...prev]);
      setEditItem(newObj); alert('성공적으로 등록되었습니다.');
    }
  };

  return (
    <div className="w-full pb-20">

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-border-gray mb-6">
        {(['layout', 'templates'] as const).map((tab) => {
          const labels = { layout: '공통 레이아웃', templates: '템플릿 목록' };
          const isTabActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-body font-medium border-b-2 transition-colors -mb-px ${
                isTabActive ? 'text-primary border-primary' : 'text-text-sub border-transparent hover:text-text-body'
              }`}>
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* 공통 레이아웃 탭 */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 에디터 */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <label className="text-body font-semibold text-text-main">헤더 HTML</label>
                </div>
                <Textarea fullWidth value={headerHtml} rows={8} className="font-mono text-caption resize-y"
                  placeholder="헤더 HTML을 입력하세요"
                  onChange={(e) => { setHeaderHtml(e.target.value); setShowLayoutPreview(false); }} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <label className="text-body font-semibold text-text-main">푸터 HTML</label>
                </div>
                <Textarea fullWidth value={footerHtml} rows={8} className="font-mono text-caption resize-y"
                  placeholder="푸터 HTML을 입력하세요"
                  onChange={(e) => { setFooterHtml(e.target.value); setShowLayoutPreview(false); }} />
              </div>
              <p className="flex items-center gap-1.5 text-caption text-status-error">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                변경 시 모든 이메일 템플릿에 즉시 반영됩니다
              </p>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={() => setShowLayoutPreview(true)}>
                  <Eye className="w-4 h-4 mr-1.5" /> 미리보기
                </Button>
                <Button variant="primary" size="md"
                  onClick={() => setShowLayoutSaveConfirm(true)}>
                  저장하기
                </Button>

              </div>
            </div>
            {/* 미리보기 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <label className="text-body font-semibold text-text-main">미리보기</label>
                </div>

              </div>
              <div className="border border-border-gray rounded-lg overflow-hidden min-h-[420px] bg-bg-gray flex flex-col">
                {showLayoutPreview ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
                    <div className="flex-1 p-6">
                      <div className="bg-white border border-dashed border-border-input rounded-lg p-6 text-center text-body-sm text-text-sub">
                        [ 본문 영역 — 템플릿별로 재워집니다 ]
                      </div>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-body-sm text-text-sub">
                    미리보기 버튼을 눌러 확인하세요
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 목록 탭 */}
      {activeTab === 'templates' && (
        <>
          <FilterBar onSearch={() => {}} onReset={handleResetSearch}>
            <FilterBar.Field label="템플릿 코드">
              <Input type="text" placeholder="템플릿 코드 입력" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} fullWidth />
            </FilterBar.Field>
            <FilterBar.Field label="템플릿명">
              <Input type="text" placeholder="템플릿명 입력" value={searchName} onChange={(e) => setSearchName(e.target.value)} fullWidth />
            </FilterBar.Field>
            <FilterBar.Field label="구분">
              <Select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value as 'ALL' | TemplateCategory)} fullWidth>
                <option value="ALL">전체</option>
                <option value="REQUIRED">필수</option>
                <option value="OPTIONAL">선택</option>
              </Select>
            </FilterBar.Field>
            <FilterBar.Field label="발송 유형">
              <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} fullWidth>
                <option value="ALL">전체</option>
                {DISPATCH_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </Select>
            </FilterBar.Field>
            <FilterBar.Field label="사용 여부">
              <Select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} fullWidth>
                <option value="ALL">전체</option>
                <option value="USE">사용</option>
                <option value="UNUSE">미사용</option>
              </Select>
            </FilterBar.Field>
          </FilterBar>

          <DataTable.Controls total={filteredData.length}>
            <Button variant="primary" size="sm" onClick={() => openForm()}>등록</Button>
            <Button variant="ghost" size="sm" disabled={selectedIds.length !== 1}
              onClick={() => { if (selectedIds.length !== 1) { alert('수정할 템플릿을 1개만 선택해주세요.'); return; }
                const item = data.find(d => d.id === selectedIds[0]); if (item) openForm(item); }}>
              수정
            </Button>
            <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleToggleVisibility}>
              사용여부 변경
            </Button>
          </DataTable.Controls>

          <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px] whitespace-nowrap">
                <thead>
                  <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                    <th className="h-[52px] px-4 text-center border-r border-border-gray w-12">
                      <input type="checkbox" className="w-4 h-4 rounded border-border-input accent-[#008d75] cursor-pointer"
                        checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                        onChange={toggleSelectAll} />
                    </th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-20">No.</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-24">구분</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-48">템플릿 코드</th>
                    <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray w-auto">템플릿명</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-36">발송 유형</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-28">사용 여부</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-24">등록자</th>
                    <th className="h-[52px] px-4 text-body font-semibold text-center">최종수정일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8EB]">
                  {filteredData.length === 0 ? (
                    <tr><td colSpan={9} className="py-12 text-center text-text-sub text-body">
                      등록된 이메일 템플릿이 없습니다.
                    </td></tr>
                  ) : filteredData.map((item) => (
                    <tr key={item.id}
                      className={`cursor-pointer h-[52px] transition-colors hover:bg-bg-gray ${selectedIds.includes(item.id) ? 'bg-primary/5' : 'bg-white'}`}
                      onClick={() => toggleSelect(item.id)}
                      onDoubleClick={() => { setSelectedIds([item.id]); const found = data.find(d => d.id === item.id); if (found) openForm(found); }}>
                      <td className="px-4 text-center border-r border-border-gray">
                        <input type="checkbox" className="w-4 h-4 rounded border-border-input accent-[#008d75] cursor-pointer"
                          checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)}
                          onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td className="px-4 text-center text-body-sm text-text-sub border-r border-border-gray font-mono">{item.no}</td>
                      <td className="px-4 text-center border-r border-border-gray">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-caption font-semibold ${
                          item.category === 'REQUIRED'
                            ? 'bg-status-error/10 text-status-error'
                            : 'bg-bg-muted text-text-body'
                        }`}>
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </td>
                      <td className="px-4 text-center text-body font-mono font-medium text-text-main border-r border-border-gray">{item.templateCode}</td>
                      <td className="px-4 text-body border-r border-border-gray">
                        <div className="font-medium text-text-main truncate max-w-sm">{item.templateName}</div>
                      </td>
                      <td className="px-4 text-center text-body text-text-body border-r border-border-gray">{item.dispatchType}</td>
                      <td className="px-4 text-center border-r border-border-gray">
                        <StatusBadge status={item.isActive ? 'ON' : 'OFF'} />
                      </td>
                      <td className="px-4 text-center text-body-sm text-text-body border-r border-border-gray">{item.author}</td>
                      <td className="px-4 text-center text-body-sm text-text-sub font-mono tracking-tight">{item.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <AnimatePresence>
            {viewMode === 'form' && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
                    <h3 className="text-title-sm font-semibold text-text-main">이메일 템플릿 {editItem ? '수정' : '등록'}</h3>
                    <button onClick={closeForm} className="p-2 text-text-sub hover:text-text-main transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-body font-semibold text-text-main">기본 정보</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-body font-semibold text-text-main">템플릿명 <span className="text-status-error">*</span></label>
                          <Input size="sm" fullWidth type="text" value={templateName} error={!!errors.templateName}
                            placeholder="템플릿 목록에서 구분할 이름"
                            onChange={(e) => { setTemplateName(e.target.value); if (e.target.value) { const n={...errors}; delete n.templateName; setErrors(n); } }}
                            onBlur={() => { if (!templateName.trim()) setErrors(p => ({...p, templateName: '템플릿명은 필수입니다.'})); }} />
                          {errors.templateName && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.templateName}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="block text-body font-semibold text-text-main">템플릿 코드 <span className="text-status-error">*</span></label>
                            <Input size="sm" fullWidth type="text" value={templateCode} error={!!errors.templateCode}
                              disabled={!!editItem} placeholder="영문 대문자, 숫자, 언더바(_)"
                              className={`font-mono tracking-tight ${editItem ? 'bg-bg-gray text-text-sub cursor-not-allowed' : ''}`}
                              onChange={(e) => { setTemplateCode(e.target.value); if (e.target.value) { const n={...errors}; delete n.templateCode; setErrors(n); } }}
                              onBlur={() => { if (!templateCode.trim()) setErrors(p => ({...p, templateCode: '템플릿 코드는 필수입니다.'})); }} />
                            {errors.templateCode && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.templateCode}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-body font-semibold text-text-main">발송 유형 <span className="text-status-error">*</span></label>
                            <Select size="sm" fullWidth value={dispatchType} error={!!errors.dispatchType}
                              onChange={(e) => { setDispatchType(e.target.value); if (e.target.value) { const n={...errors}; delete n.dispatchType; setErrors(n); } }}>
                              <option value="">유형 선택</option>
                              {DISPATCH_TYPES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Select>
                            {errors.dispatchType && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.dispatchType}</p>}
                          </div>
                        </div>
                        <div className="space-y-2 pt-1">
                          <label className="block text-body font-semibold text-text-main">구분 <span className="text-status-error">*</span></label>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="category" checked={category === 'REQUIRED'} onChange={() => setCategory('REQUIRED')} className="w-4 h-4 accent-[#008d75]" />
                              <span className="text-body text-text-body group-hover:text-text-main">필수</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="category" checked={category === 'OPTIONAL'} onChange={() => setCategory('OPTIONAL')} className="w-4 h-4 accent-[#008d75]" />
                              <span className="text-body text-text-body group-hover:text-text-main">선택</span>
                            </label>
                          </div>
                          <p className="text-caption text-text-sub">필수 발송 이메일과 알림성 이메일을 구분하기 위한 값입니다.</p>
                        </div>
                        <div className="space-y-2 pt-1">
                          <label className="block text-body font-semibold text-text-main">사용 여부</label>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="isActive" checked={isActive} onChange={() => setIsActive(true)} className="w-4 h-4 accent-[#008d75]" />
                              <span className="text-body text-text-body group-hover:text-text-main">사용</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" name="isActive" checked={!isActive} onChange={() => setIsActive(false)} className="w-4 h-4 accent-[#008d75]" />
                              <span className="text-body text-text-body group-hover:text-text-main">미사용</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-border-gray">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-body font-semibold text-text-main">이메일 내용</h4>
                      </div>
                      <div className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="block text-body font-semibold text-text-main">이메일 제목 <span className="text-status-error">*</span></label>
                          <Input size="sm" fullWidth type="text" value={subject} error={!!errors.subject}
                            placeholder="수신자에게 표시될 메일 제목을 입력하세요"
                            onChange={(e) => { setSubject(e.target.value); if (e.target.value) { const n={...errors}; delete n.subject; setErrors(n); } }} />
                          {errors.subject && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.subject}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-body font-semibold text-text-main">이메일 본문 <span className="text-status-error">*</span></label>
                          <Textarea fullWidth value={body} rows={10} error={!!errors.body} className="font-mono text-caption resize-y"
                            placeholder="본문 HTML을 입력하세요. (예: <table>...</table>)"
                            onChange={(e) => { setBody(e.target.value); if (e.target.value) { const n={...errors}; delete n.body; setErrors(n); } }} />
                          {errors.body && <p className="text-caption text-status-error mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.body}</p>}
                        </div>
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

          <ConfirmModal
            open={showCancelWarning} variant="warning"
            title="저장되지 않은 변경사항"
            description={`현재 입력한 내용이 유실될 수 있습니다.\n그래도 목록으로 이동하시겠습니까?`}
            confirmLabel="이동하기" cancelLabel="계속 작성"
            onConfirm={() => { setShowCancelWarning(false); setViewMode('list'); }}
            onCancel={() => setShowCancelWarning(false)}
          />
        </>
      )}

      <ConfirmModal
        open={showLayoutSaveConfirm} variant="warning"
        title="공통 레이아웃 저장"
        description={`변경 사항이 모든 이메일 템플릿에 즉시 반영됩니다.\n저장하시겠습니까?`}
        confirmLabel="저장하기" cancelLabel="취소"
        onConfirm={() => { setShowLayoutSaveConfirm(false); alert('공통 레이아웃이 저장되었습니다.'); }}
        onCancel={() => setShowLayoutSaveConfirm(false)}
      />

    </div>
  );
}
