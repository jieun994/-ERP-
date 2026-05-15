import React, { useState } from 'react';
import { ChevronRight, Check, X, AlertCircle, FileSpreadsheet, Plus, Trash2, AlertTriangle, Clock, Pencil, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnterpriseBlock, ExcelRow } from './register/types';
import { Button, Input, StatusBadge } from './ui';

// Simplified Stepper
const STEPS = ['기업 기본정보 등록', 'VAN/펌뱅킹 ID 등록', '기업 인터페이스/파라미터 설정', '기타 설정'];

// 사용 ERP사 옵션
const ERP_VENDORS = ['더존', 'SAP', 'Oracle', '영림원', 'ECOUNT', '자체개발', '기타'];


// ... (imports)

import EnterpriseInterfaceSettings from './EnterpriseInterfaceSettings';
import EnterpriseUsageSettings from './EnterpriseUsageSettings';
import { MOCK_TENANTS } from './tenant/tenants';
// ─── VAN/펌뱅킹 데이터 타입 ───────────────────────────────────────────────
type BankAccount = { bank: string; account: string };
type ScrapType = 'iron' | 'copper' | 'gold' | 'nonFerrous';

type CompanyVanInfo = {
  van: string;
  // 펌뱅킹 ID
  wonId: string;        // 원화
  foreignId: string;    // 외화
  giroId: string;       // 지로
  salaryIds: string[];  // 급여 (여러 개 가능)
  // 기타계좌
  scrapAccounts: Record<ScrapType, BankAccount>;
};

/**
 * 기업별 VAN/펌뱅킹 입력 상태
 *
 * waiting  (대기)   : 한 번도 탭에 진입하지 않았거나, 진입했지만 아무 값도 입력하지 않은 상태
 * done     (완료)   : 값이 하나라도 입력된 상태. 다른 기업 탭으로 이동하는 시점에 확정됨
 * skipped  (건너뜀) : 사용자가 명시적으로 "건너뛰기"를 선택한 상태. 빈 값으로 처리됨
 *
 * ※ 실제 저장(서버 전송)은 최종 단계 완료 시 일괄 처리됨
 */
type StoredStatus = 'waiting' | 'done' | 'skipped';

const EMPTY_VAN_INFO: CompanyVanInfo = {
  van: '',
  wonId: '',
  foreignId: '',
  giroId: '',
  salaryIds: [''],
  scrapAccounts: {
    iron:       { bank: '', account: '' },
    copper:     { bank: '', account: '' },
    gold:       { bank: '', account: '' },
    nonFerrous: { bank: '', account: '' },
  },
};

// 펌뱅킹 ID 단일 입력 항목 (급여는 별도 처리 — 다중 입력)
const PUMBANKING_SINGLE_FIELDS: { key: 'wonId' | 'foreignId' | 'giroId'; label: string }[] = [
  { key: 'wonId',     label: '원화 펌뱅킹 ID' },
  { key: 'foreignId', label: '외화 펌뱅킹 ID' },
  { key: 'giroId',    label: '지로 펌뱅킹 ID' },
];

// 스크랩 계좌 구분
const SCRAP_TYPES: { key: ScrapType; label: string }[] = [
  { key: 'iron',       label: '철'   },
  { key: 'copper',     label: '구리' },
  { key: 'gold',       label: '금'   },
  { key: 'nonFerrous', label: '비철' },
];

// 은행 목록
const BANK_LIST = [
  '하나은행', 'KB국민은행', '신한은행', '우리은행', 'IBK기업은행',
  'NH농협은행', 'SC제일은행', '카카오뱅크', '토스뱅크', '케이뱅크',
  '새마을금고', '우체국', '수협은행',
];

function hasVanValues(info: CompanyVanInfo) {
  if (info.van.trim()) return true;
  if (info.wonId.trim() || info.foreignId.trim() || info.giroId.trim()) return true;
  if (info.salaryIds.some(s => s.trim())) return true;
  if (SCRAP_TYPES.some(({ key }) => {
    const a = info.scrapAccounts[key];
    return a.bank.trim() || a.account.trim();
  })) return true;
  return false;
}

// 건너뛰기 확인 모달용 요약 — 입력된 값만 표시
function flattenVanInfoForDisplay(info: CompanyVanInfo): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  if (info.van.trim()) out.push({ label: 'VAN ID', value: info.van });
  if (info.wonId.trim())     out.push({ label: '원화 펌뱅킹 ID', value: info.wonId });
  if (info.foreignId.trim()) out.push({ label: '외화 펌뱅킹 ID', value: info.foreignId });
  if (info.giroId.trim())    out.push({ label: '지로 펌뱅킹 ID', value: info.giroId });
  const filledSalary = info.salaryIds.filter(s => s.trim());
  filledSalary.forEach((s, i) => {
    out.push({ label: filledSalary.length > 1 ? `급여 펌뱅킹 ID ${i + 1}` : '급여 펌뱅킹 ID', value: s });
  });
  SCRAP_TYPES.forEach(({ key, label }) => {
    const a = info.scrapAccounts[key];
    if (a.bank.trim() || a.account.trim()) {
      out.push({ label: `스크랩(${label})`, value: `${a.bank || '-'} / ${a.account || '-'}` });
    }
  });
  return out;
}

function EntStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    waiting: '대기', inProgress: '진행중', done: '완료', skipped: '건너뜀', editing: '수정중',
  };
  // 프리셋에 없는 상태(건너뜀/수정중)는 colorClass로 지정
  const overrides: Record<string, string | undefined> = {
    skipped: 'bg-gray-100 text-gray-500 border border-gray-200',
    editing: 'bg-blue-50 text-blue-700 border border-blue-200',
  };
  const label = labels[status] || '대기';
  return <StatusBadge status={label} colorClass={overrides[status]} />;
}

// ─── VAN/펌뱅킹 등록 메인 컴포넌트 ──────────────────────────────────────────
const VanFirmBankingRegistration = ({ enterprises, vanRecords, setVanRecords }) => {
  const [vanData, setVanData] = useState<Record<string, CompanyVanInfo>>(() => {
    const data: Record<string, CompanyVanInfo> = {};
    enterprises.forEach(e => {
      data[e.id] = {
        van: '',
        wonId: '', foreignId: '', giroId: '',
        salaryIds: [''],
        scrapAccounts: {
          iron:       { bank: '', account: '' },
          copper:     { bank: '', account: '' },
          gold:       { bank: '', account: '' },
          nonFerrous: { bank: '', account: '' },
        },
      };
    });
    return data;
  });

  const [selectedEntId, setSelectedEntId] = useState<string>(enterprises[0]?.id || '');
  const [currentRow, setCurrentRow] = useState<CompanyVanInfo>(() => ({
    ...EMPTY_VAN_INFO,
    salaryIds: [''],
    scrapAccounts: { ...EMPTY_VAN_INFO.scrapAccounts },
  }));
  const [entStatuses, setEntStatuses] = useState<Record<string, StoredStatus>>(() => {
    const s: Record<string, StoredStatus> = {};
    enterprises.forEach(e => { s[e.id] = 'waiting'; });
    return s;
  });
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (enterprises.length === 0) {
    return (
      <div className="py-20 text-center text-text-sub">
        <p className="text-body">표시할 기업 정보가 없습니다.</p>
        <p className="text-body-sm mt-1">1단계에서 기업을 먼저 추가해주세요.</p>
      </div>
    );
  }

  // 깊은 복사가 필요한 EMPTY_VAN_INFO 생성기
  const makeEmptyVanInfo = (): CompanyVanInfo => ({
    van: '',
    wonId: '',
    foreignId: '',
    giroId: '',
    salaryIds: [''],
    scrapAccounts: {
      iron:       { bank: '', account: '' },
      copper:     { bank: '', account: '' },
      gold:       { bank: '', account: '' },
      nonFerrous: { bank: '', account: '' },
    },
  });

  // 탭 전환 시 현재 값 자동저장 후 새 기업 로드
  const switchEnterprise = (newId: string) => {
    if (newId === selectedEntId) return;

    const updatedVanData = { ...vanData, [selectedEntId]: { ...currentRow } };
    setVanData(updatedVanData);

    const newStatus: StoredStatus = hasVanValues(currentRow)
      ? 'done'
      : entStatuses[selectedEntId] === 'skipped' ? 'skipped' : 'waiting';
    setEntStatuses(prev => ({ ...prev, [selectedEntId]: newStatus }));

    setSelectedEntId(newId);
    setCurrentRow({ ...(updatedVanData[newId] || makeEmptyVanInfo()) });
  };

  // 단일 필드(VAN, 원화/외화/지로 ID 등) 변경
  const setSingleField = (field: 'van' | 'wonId' | 'foreignId' | 'giroId', value: string) => {
    setCurrentRow(prev => ({ ...prev, [field]: value }));
  };

  // 급여 펌뱅킹 ID (다중) 관련 핸들러
  const updateSalaryId = (index: number, value: string) => {
    setCurrentRow(prev => {
      const arr = [...prev.salaryIds];
      arr[index] = value;
      return { ...prev, salaryIds: arr };
    });
  };
  const addSalaryId = () => {
    setCurrentRow(prev => ({ ...prev, salaryIds: [...prev.salaryIds, ''] }));
  };
  const removeSalaryId = (index: number) => {
    setCurrentRow(prev => {
      const arr = prev.salaryIds.filter((_, i) => i !== index);
      return { ...prev, salaryIds: arr.length ? arr : [''] };
    });
  };

  // 스크랩 계좌 관련 핸들러
  const updateScrapAccount = (type: ScrapType, field: 'bank' | 'account', value: string) => {
    setCurrentRow(prev => ({
      ...prev,
      scrapAccounts: {
        ...prev.scrapAccounts,
        [type]: { ...prev.scrapAccounts[type], [field]: value },
      },
    }));
  };

  // 현재 기업 저장
  const handleSave = () => {
    const updatedVanData = { ...vanData, [selectedEntId]: { ...currentRow } };
    setVanData(updatedVanData);
    setEntStatuses(prev => ({ ...prev, [selectedEntId]: 'done' }));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // 현재 기업의 입력 값을 모두 비움 (다른 기업 데이터에는 영향 없음)
  const handleReset = () => {
    setCurrentRow(makeEmptyVanInfo());
  };

  // 건너뛰기: 값이 있으면 확인 팝업, 없으면 바로 처리
  const handleSkipClick = () => {
    if (hasVanValues(currentRow)) {
      setSkipConfirm({ show: true, entId: selectedEntId });
    } else {
      doSkip(selectedEntId);
    }
  };

  const doSkip = (entId: string) => {
    const updatedVanData = { ...vanData, [entId]: makeEmptyVanInfo() };
    setVanData(updatedVanData);
    setEntStatuses(prev => ({ ...prev, [entId]: 'skipped' }));
    if (entId === selectedEntId) setCurrentRow(makeEmptyVanInfo());
    setSkipConfirm({ show: false, entId: '' });

    // 다음 미완료 기업으로 자동 이동
    const idx = enterprises.findIndex(e => e.id === entId);
    const next = enterprises.find(
      (e, i) => i > idx && entStatuses[e.id] !== 'done' && e.id !== entId
    );
    if (next) switchEnterprise(next.id);
  };

  const getDisplayStatus = (id: string) => {
    return entStatuses[id] || 'waiting';
  };

  const sidebarSubText: Record<string, string> = {
    waiting:    '미진입',
    inProgress: '입력 중',
    done:       '입력 완료',
    skipped:    '건너뜀',
    editing:    '수정 중',
  };

  return (
    <div className="relative">

      {/* ── 건너뛰기 확인 팝업 ───────────────────────────────────────
        ※ 공용 ConfirmModal은 description이 string만 받으므로,
          입력값 리스트를 함께 보여줘야 하는 본 케이스는 커스텀 마크업을 유지하되
          타이포/컬러/버튼은 ConfirmModal 스펙에 맞춰 정렬한다. */}
      {/* ── 본문: 사이드바 + 콘텐츠 ───────────────────────────────── */}
      <div className="flex gap-6" style={{ minHeight: 460 }}>

        {/* 사이드바 */}
        <div className="w-[200px] flex-shrink-0 bg-white border border-border-gray rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border-gray bg-bg-gray">
            <span className="text-body-lg font-semibold text-text-main">등록 기업 목록</span>
          </div>
          <div className="overflow-y-auto">
            {enterprises.map(ent => {
              const status   = getDisplayStatus(ent.id);
              const isActive = ent.id === selectedEntId;
              return (
                <button
                  key={ent.id}
                  onClick={() => switchEnterprise(ent.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 border-l-2 transition-colors border-b border-bg-muted ${
                    isActive
                      ? 'bg-primary/5 border-l-[#008d75]'
                      : 'border-l-transparent hover:bg-bg-gray'
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`text-body font-semibold truncate ${isActive ? 'text-primary' : 'text-text-main'}`}>
                      {ent.name}
                    </div>
                    <div className="text-body-sm text-text-sub mt-0.5">
                      {sidebarSubText[status]}
                    </div>
                  </div>
                  <EntStatusBadge status={status} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

          {/* 콘텐츠 헤더 */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div className="text-body-lg font-bold text-gray-900">
              {enterprises.find(e => e.id === selectedEntId)?.name}
            </div>
            <button
              onClick={handleReset}
              className="flex-shrink-0 flex items-center gap-1.5 text-body-sm text-gray-500 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* 재수정 배너 */}
          {entStatuses[selectedEntId] === 'done' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-body-sm text-blue-700">
              <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
              이전에 입력한 내용을 수정하고 있습니다.
            </div>
          )}

          {/* VAN 정보 */}
          <div>
            <h3 className="text-body-lg font-semibold text-gray-700 mb-1">VAN 정보</h3>
            <p className="text-body-sm text-gray-500 mb-4">결제 대행에 사용되는 VAN ID를 입력합니다.</p>
            <div className="max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-body font-semibold text-text-main mb-1.5">VAN ID</label>
                  <Input
                    type="text"
                    fullWidth
                    placeholder="VAN ID 입력"
                    value={currentRow.van}
                    onChange={e => setSingleField('van', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* 펌뱅킹 ID */}
          <div>
            <h3 className="text-body-lg font-semibold text-gray-700 mb-1">펌뱅킹 ID</h3>
            <p className="text-body-sm text-gray-500 mb-5">업무 유형별 펌뱅킹 ID를 입력합니다. 사용하는 항목만 입력하면 됩니다.</p>

            <div className="max-w-3xl">
              {/* 원화 / 외화 / 지로 — 3열 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {PUMBANKING_SINGLE_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-body font-semibold text-text-main mb-1.5">{label}</label>
                    <Input
                      type="text"
                      fullWidth
                      placeholder="펌뱅킹 ID 입력"
                      value={currentRow[key]}
                      onChange={e => setSingleField(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* 급여 — 다중 입력 */}
              <div className="pt-5 border-t border-bg-muted">
                <div className="flex items-baseline gap-2 mb-2">
                  <label className="text-body font-semibold text-text-main">급여 펌뱅킹 ID</label>
                  <span className="text-body-sm text-text-sub">여러 개 등록 가능</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex flex-col gap-2">
                    {currentRow.salaryIds.map((id, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            type="text"
                            fullWidth
                            placeholder={`펌뱅킹 ID ${i + 1}`}
                            value={id}
                            onChange={e => updateSalaryId(i, e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSalaryId(i)}
                          disabled={currentRow.salaryIds.length === 1 && !id.trim()}
                          className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-text-sub hover:text-status-error hover:bg-bg-gray disabled:text-border-gray disabled:cursor-not-allowed rounded-md transition-colors"
                          title="삭제"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSalaryId}
                      className="self-start flex items-center gap-1 text-body-sm text-primary hover:text-primary-dark font-semibold mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      펌뱅킹 ID 추가
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* 기타계좌 */}
          <div>
            <h3 className="text-body-lg font-semibold text-gray-700 mb-1">기타계좌</h3>
            <p className="text-body-sm text-gray-500 mb-5">스크랩 계좌 정보를 입력합니다. 사용하는 항목만 입력하면 됩니다.</p>

            <div className="max-w-3xl">
              {/* 스크랩 계좌 */}
              <div>
                <p className="text-body font-semibold text-text-main mb-2">스크랩 계좌</p>
                <div className="border border-border-gray rounded-md overflow-hidden">
                  {/* 컬럼 헤더 */}
                  <div className="grid grid-cols-[80px_1fr_1fr] gap-3 px-4 py-2 bg-bg-gray border-b border-border-gray">
                    <span className="text-body-sm font-semibold text-text-sub">구분</span>
                    <span className="text-body-sm font-semibold text-text-sub">은행</span>
                    <span className="text-body-sm font-semibold text-text-sub">계좌번호</span>
                  </div>
                  {/* 데이터 행 */}
                  <div className="divide-y divide-[#E5E8EB]">
                    {SCRAP_TYPES.map(({ key, label }) => {
                      const acc = currentRow.scrapAccounts[key];
                      return (
                        <div key={key} className="grid grid-cols-[80px_1fr_1fr] gap-3 px-4 py-3 items-center bg-white">
                          <span className="text-body font-semibold text-text-main">{label}</span>
                          <select
                            value={acc.bank}
                            onChange={e => updateScrapAccount(key, 'bank', e.target.value)}
                            className="w-full h-[42px] px-3 border border-border-gray rounded-md text-body bg-white text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-[#008d75]"
                          >
                            <option value="">은행 선택</option>
                            {BANK_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          <Input
                            type="text"
                            fullWidth
                            placeholder="계좌번호 입력"
                            value={acc.account}
                            onChange={e => updateScrapAccount(key, 'account', e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 하단: 저장 버튼 + 안내 */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-body-sm text-text-body">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {hasVanValues(currentRow)
                ? '입력 내용은 저장 후 최종 단계 완료 시 일괄 등록됩니다.'
                : '입력할 값이 없으면 저장 시 건너뛰기로 처리됩니다.'}
            </div>
            <Button variant="primary" size="md" onClick={handleSave}>
              {savedFeedback ? '✓ 저장됨' : '저장'}
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default function EnterpriseRegister({ initialConfig, onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [registerMode, setRegisterMode] = useState('manual');

  // State for accumulated enterprises (List)
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [vanRecords, setVanRecords] = useState<any[]>([]);

  // State for form
  const [tenantCode, setTenantCode] = useState('');
  const [tenantStatus, setTenantStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [tenantMessage, setTenantMessage] = useState('');
  const [formState, setFormState] = useState({ id: '', name: '', bizNumber: '', corpNumber: '', erpVendor: '', masterEmail: '' });
  const [formErrors, setFormErrors] = useState<any>({});
  const [tenantError, setTenantError] = useState('');
  const [pageError, setPageError] = useState('');
  const [editingId, setEditingId] = useState(null); // ID of enterprise being edited

  // Table selections
  const [selectedIds, setSelectedIds] = useState([]);

  // Excel state
  const [excelData, setExcelData] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [excelError, setExcelError] = useState('');

  // 테넌트 선택 검증 (셀렉트 박스 변경에 따른 미선택 체크)
  const validateTenantSelected = () => {
    if (!tenantCode.trim()) {
      setTenantStatus('error');
      setTenantMessage('테넌트를 선택해주세요.');
      return false;
    }
    setTenantStatus('success');
    setTenantMessage('');
    return true;
  };

  const handleAddOrUpdate = () => {
    setPageError('');
    // Basic validation
    const errors: any = {};
    if (!formState.name.trim()) errors.name = '기업명을 입력해주세요.';
    if (!formState.bizNumber.trim()) errors.bizNumber = '사업자등록번호를 입력해주세요.';
    else if (formState.bizNumber.length !== 10) errors.bizNumber = '사업자등록번호는 10자리 숫자로 입력해주세요.';
    if (!formState.erpVendor.trim()) errors.erpVendor = '사용 ERP사를 선택해주세요.';
    if (!formState.masterEmail.trim()) {
      errors.masterEmail = '마스터 이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.masterEmail)) {
      errors.masterEmail = '올바른 이메일 형식이 아닙니다.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingId) {
      setEnterprises(enterprises.map(e => e.id === editingId ? { ...formState, id: editingId } : e));
      setEditingId(null);
    } else {
      setEnterprises([...enterprises, { ...formState, id: Date.now().toString() }]);
    }
    setFormState({ id: '', name: '', bizNumber: '', corpNumber: '', erpVendor: '', masterEmail: '' });
    setFormErrors({});
  };

  const handleEditClick = (ent) => {
    setPageError('');
    setFormState(ent);
    setEditingId(ent.id);
  };

  const handleCancelEdit = () => {
    setFormState({ id: '', name: '', bizNumber: '', corpNumber: '', erpVendor: '', masterEmail: '' });
    setEditingId(null);
    setFormErrors({});
  };

  const handleDeleteSelected = () => {
    setPageError('');
    setEnterprises(enterprises.filter(e => !selectedIds.includes(e.id)));
    setSelectedIds([]);
  };

  const validateExcelRows = (rows: any[]) => {
    // 시스템에 이미 등록된 번호 (mock — 실제 구현 시 API로 조회)
    const SYSTEM_BIZ_NUMBERS  = ['9999999999'];
    const SYSTEM_CORP_NUMBERS = ['9999999999999'];

    // 파일 내 중복 집계
    const bizCount: Record<string, number>  = {};
    const corpCount: Record<string, number> = {};
    rows.forEach(r => {
      if (r.bizNumber)  bizCount[r.bizNumber]   = (bizCount[r.bizNumber]   || 0) + 1;
      if (r.corpNumber) corpCount[r.corpNumber]  = (corpCount[r.corpNumber] || 0) + 1;
    });

    return rows.map(row => {
      const errors: Record<string, string> = {};

      // 기업명 필수
      if (!row.name?.trim()) errors.name = '기업명을 입력해주세요.';

      // 사업자등록번호 필수 + 형식 + 중복
      if (!row.bizNumber?.trim()) {
        errors.bizNumber = '사업자등록번호를 입력해주세요.';
      } else if (!/^\d{10}$/.test(row.bizNumber)) {
        errors.bizNumber = '10자리 숫자로 입력해주세요.';
      } else if (SYSTEM_BIZ_NUMBERS.includes(row.bizNumber)) {
        errors.bizNumber = '시스템에 이미 등록된 사업자등록번호입니다.';
      } else if (bizCount[row.bizNumber] > 1) {
        errors.bizNumber = '파일 내 중복된 사업자등록번호입니다.';
      }

      // 법인등록번호 선택 + 형식 + 중복
      if (row.corpNumber?.trim()) {
        if (!/^\d{13}$/.test(row.corpNumber)) {
          errors.corpNumber = '13자리 숫자로 입력해주세요.';
        } else if (SYSTEM_CORP_NUMBERS.includes(row.corpNumber)) {
          errors.corpNumber = '시스템에 이미 등록된 법인등록번호입니다.';
        } else if (corpCount[row.corpNumber] > 1) {
          errors.corpNumber = '파일 내 중복된 법인등록번호입니다.';
        }
      }

      // 사용 ERP사 필수
      if (!row.erpVendor?.trim()) errors.erpVendor = '사용 ERP사를 입력해주세요.';

      // 마스터 이메일 필수 + 형식
      if (!row.masterEmail?.trim()) {
        errors.masterEmail = '마스터 이메일을 입력해주세요.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.masterEmail)) {
        errors.masterEmail = '올바른 이메일 형식이 아닙니다.';
      }

      return { ...row, errors: Object.keys(errors).length > 0 ? errors : undefined };
    });
  };

  const handleUploadExcel = () => {
    setPageError('');
    // Mock 파일 파싱 결과 — 실제 구현 시 xlsx 라이브러리로 파일 읽기
    const rawRows = [
      { id: '1', name: '혁신기업(주)', bizNumber: '1234567890', corpNumber: '1234567890123', erpVendor: '더존',  masterEmail: 'admin@innovation.co.kr' },
      { id: '2', name: '미래상사',     bizNumber: '1234567890', corpNumber: '',              erpVendor: 'SAP',   masterEmail: 'master@mirae.com' },
      { id: '3', name: '테스트컴퍼니', bizNumber: '11122233',   corpNumber: '',              erpVendor: '영림원', masterEmail: 'invalid-email' },
      { id: '4', name: '',             bizNumber: '5555555555', corpNumber: '9999999999999', erpVendor: '',      masterEmail: '' },
    ];
    setIsUploaded(true);
    setExcelData(validateExcelRows(rawRows));
  };

  const handleDeleteErrorRows = () => {
    setExcelData((prev: any[]) => prev.filter(d => !d.errors));
  };

  const handleNextStep = () => {
    setPageError('');
    if (currentStep === 1) {
      if (!validateTenantSelected()) {
        setPageError('테넌트를 선택해주세요.');
        return;
      }
      if (registerMode === 'manual' && enterprises.length === 0) {
        setPageError('등록된 기업이 없습니다. 기업을 하나 이상 추가해주세요.');
        return;
      }
      if (registerMode === 'excel' && (!isUploaded || excelData.length === 0)) {
        setPageError('엑셀 파일이 업로드되지 않았습니다. 파일을 업로드해주세요.');
        return;
      }
    }
    setCurrentStep(Math.min(4, currentStep + 1));
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-border-gray p-8">
      {/* 1. Stepper & Instruction */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          {STEPS.map((step, idx) => (
            <div key={step} className={`flex items-center gap-2 text-body font-semibold ${idx + 1 === currentStep ? 'text-primary' : 'text-text-sub'}`}>
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${idx + 1 === currentStep ? 'bg-primary text-white' : 'bg-bg-muted text-text-sub'}`}>{idx + 1}</span>
              {step}
            </div>
          ))}
        </div>

      </div>

      {/* 2. Registration Content based on Step */}
      <div className="pb-6">
        {currentStep === 1 && (
          <>
            {/* Common Tenant Select */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <label className="text-body font-semibold text-text-main">테넌트 <span className="text-status-error">*</span></label>
                    <span className="text-caption text-text-sub">테넌트 조회에서 등록한 항목 중 선택</span>
                  </div>
                  <div className="flex flex-col w-full max-w-sm gap-1">
                    <select
                      value={tenantCode}
                      onChange={e => {
                        setTenantCode(e.target.value);
                        setTenantStatus(e.target.value ? 'success' : 'idle');
                        setTenantMessage('');
                      }}
                      className={`w-full h-[42px] px-3 border rounded-md text-body bg-white outline-none focus:ring-1 focus:ring-[#008d75] focus:border-primary ${
                        tenantStatus === 'error' ? 'border-status-error' : 'border-border-gray'
                      } ${tenantCode ? 'text-text-main' : 'text-text-sub'}`}
                    >
                      <option value="">테넌트 선택</option>
                      {MOCK_TENANTS.filter(t => t.isUsed).map(t => (
                        <option key={t.id} value={t.tenantCode}>
                          {t.tenantName}({t.tenantCode})
                        </option>
                      ))}
                    </select>
                    {tenantStatus === 'error' && tenantMessage && (
                      <p className="text-caption flex items-center gap-1 text-status-error">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {tenantMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-b border-border-gray mb-6">
              {['직접 입력', '엑셀 업로드'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRegisterMode(mode === '직접 입력' ? 'manual' : 'excel')}
                  className={`pb-3 text-body font-semibold ${registerMode.startsWith(mode === '직접 입력' ? 'manual' : 'excel') ? 'text-primary border-b-2 border-primary' : 'text-text-sub'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {registerMode === 'manual' ? (
              <>
                <div className="bg-white border border-border-gray rounded-xl shadow-sm mb-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5 mb-6">
                    <div>
                      <label className="block text-body font-semibold text-text-main mb-1.5">기업명 <span className="text-status-error">*</span></label>
                      <Input
                        fullWidth
                        error={!!formErrors.name}
                        placeholder="기업명 입력"
                        value={formState.name}
                        onChange={e => {setFormState({...formState, name: e.target.value}); setFormErrors({...formErrors, name: ''})}}
                      />
                      {formErrors.name && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-body font-semibold text-text-main mb-1.5">사업자등록번호 <span className="text-status-error">*</span></label>
                      <Input
                        fullWidth
                        error={!!formErrors.bizNumber}
                        placeholder="10자리 숫자 입력"
                        value={formState.bizNumber}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setFormState({...formState, bizNumber: value});
                          setFormErrors({...formErrors, bizNumber: ''});
                        }}
                      />
                      {formErrors.bizNumber && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{formErrors.bizNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-body font-semibold text-text-main mb-1.5">법인등록번호</label>
                      <Input
                        fullWidth
                        placeholder="13자리 숫자 입력(선택)"
                        value={formState.corpNumber}
                        onChange={e => setFormState({...formState, corpNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-body font-semibold text-text-main mb-1.5">사용 ERP사 <span className="text-status-error">*</span></label>
                      <select
                        value={formState.erpVendor}
                        onChange={e => {
                          setFormState({...formState, erpVendor: e.target.value});
                          setFormErrors({...formErrors, erpVendor: ''});
                        }}
                        className={`w-full h-[42px] px-3 border rounded-md text-body bg-white outline-none focus:border-primary focus:ring-1 focus:ring-[#008d75] ${
                          formErrors.erpVendor ? 'border-status-error' : 'border-border-gray'
                        } ${formState.erpVendor ? 'text-text-main' : 'text-text-sub'}`}
                      >
                        <option value="">선택</option>
                        {ERP_VENDORS.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {formErrors.erpVendor && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{formErrors.erpVendor}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-body font-semibold text-text-main mb-1.5">마스터 이메일 <span className="text-status-error">*</span></label>
                      <Input
                        fullWidth
                        type="email"
                        error={!!formErrors.masterEmail}
                        placeholder="example@company.com"
                        value={formState.masterEmail}
                        onChange={e => {
                          setFormState({...formState, masterEmail: e.target.value});
                          setFormErrors({...formErrors, masterEmail: ''});
                        }}
                      />
                      {formErrors.masterEmail && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{formErrors.masterEmail}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border-gray pt-4 mt-2">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={editingId ? handleCancelEdit : () => setFormState({ id: '', name: '', bizNumber: '', corpNumber: '', erpVendor: '', masterEmail: '' })}
                    >
                      취소
                    </Button>
                    <Button variant="primary" size="md" onClick={handleAddOrUpdate}>
                      {editingId ? '수정' : '등록'}
                    </Button>
                  </div>
                </div>
                {/* Registered Enterprise List (Manual) */}
                <div className="bg-white">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-body-lg font-semibold text-text-main mb-1">기업 목록</h3>
                      <p className="text-body-sm text-text-sub">추가한 항목은 아래 목록에서 확인하고 삭제할 수 있습니다.</p>
                    </div>
                    <Button variant="danger-outline" size="sm" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>삭제</Button>
                  </div>
                  <table className="w-full text-left text-body table-fixed">
                    <colgroup>
                      <col style={{ width: '44px' }} />
                      <col style={{ width: '45%' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '27%' }} />
                    </colgroup>
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-3 text-center"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? enterprises.map(e => e.id) : [])} checked={selectedIds.length === enterprises.length && enterprises.length > 0}/></th>
                        <th className="p-3">기업명</th>
                        <th className="p-3">사업자등록번호</th>
                        <th className="p-3">법인등록번호</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {enterprises.length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-gray-500">추가된 기업이 없습니다. 상단 폼에서 기업 정보를 입력한 뒤 추가해 주세요.</td></tr>
                      ) : (
                        enterprises.map(ent => (
                          <tr key={ent.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditClick(ent)}>
                            <td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(ent.id)} onChange={(e) => { e.stopPropagation(); setSelectedIds(selectedIds.includes(ent.id) ? selectedIds.filter(id => id !== ent.id) : [...selectedIds, ent.id]) }} /></td>
                            <td className="p-3 font-semibold truncate">{ent.name}</td>
                            <td className="p-3 truncate">{ent.bizNumber}</td>
                            <td className="p-3 truncate">{ent.corpNumber || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div>
                 {!isUploaded ? (
                    <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-5"><FileSpreadsheet className="w-8 h-8" /></div>
                      <h3 className="text-gray-900 font-bold text-title-sm mb-2">엑셀 파일을 업로드하여 일괄 등록하세요</h3>
                      <Button variant="primary" size="lg" onClick={handleUploadExcel}>파일 업로드 (.xlsx, .xls)</Button>
                    </div>
                 ) : (
                   <div>
                     {/* 헤더 */}
                     <div className="flex justify-between items-end mb-4">
                       <div>
                         <h3 className="text-title-sm font-bold text-gray-900 mb-1">기업 목록 (엑셀)</h3>
                         <div className="flex items-center gap-3 text-body-sm">
                           <span className="text-gray-500">총 {excelData.length}개</span>
                           <span className="text-primary font-semibold">
                             정상 {excelData.filter((d: any) => !d.errors).length}개
                           </span>
                           {excelData.some((d: any) => d.errors) && (
                             <span className="text-red-500 font-semibold">
                               오류 {excelData.filter((d: any) => d.errors).length}개
                             </span>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {excelData.some((d: any) => d.errors) && (
                           <button
                             onClick={handleDeleteErrorRows}
                             className="px-4 py-2 border border-red-300 rounded-md text-caption font-semibold text-red-600 hover:bg-red-50"
                           >
                             오류 행 삭제
                           </button>
                         )}
                         <button
                           onClick={() => setIsUploaded(false)}
                           className="px-4 py-2 border border-gray-300 rounded-md text-caption font-semibold text-gray-600 hover:bg-gray-50"
                         >
                           다른 파일 업로드
                         </button>
                       </div>
                     </div>

                     {/* 테이블 */}
                     <table className="w-full text-left text-body-sm table-fixed">
                       <colgroup>
                         <col style={{ width: '38%' }} />
                         <col style={{ width: '27%' }} />
                         <col style={{ width: '27%' }} />
                         <col style={{ width: '8%' }} />
                       </colgroup>
                       <thead className="bg-gray-50 text-gray-600">
                         <tr>
                           <th className="p-3">기업명</th>
                           <th className="p-3">사업자등록번호</th>
                           <th className="p-3">법인등록번호</th>
                           <th className="p-3"></th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {excelData.map((d: any) => {
                           const hasError = !!d.errors;
                           return (
                             <tr key={d.id} className={hasError ? 'bg-red-50' : 'hover:bg-gray-50'}>
                               <td className="p-3">
                                 <div className={`font-semibold truncate ${d.errors?.name ? 'text-red-500' : ''}`}>
                                   {d.name || '(미입력)'}
                                 </div>
                                 {d.errors?.name && (
                                   <div className="text-caption text-red-500 mt-0.5">{d.errors.name}</div>
                                 )}
                               </td>
                               <td className="p-3">
                                 <div className={`truncate ${d.errors?.bizNumber ? 'text-red-500' : ''}`}>
                                   {d.bizNumber || '(미입력)'}
                                 </div>
                                 {d.errors?.bizNumber && (
                                   <div className="text-caption text-red-500 mt-0.5">{d.errors.bizNumber}</div>
                                 )}
                               </td>
                               <td className="p-3">
                                 <div className={`truncate ${d.errors?.corpNumber ? 'text-red-500' : ''}`}>
                                   {d.corpNumber || '-'}
                                 </div>
                                 {d.errors?.corpNumber && (
                                   <div className="text-caption text-red-500 mt-0.5">{d.errors.corpNumber}</div>
                                 )}
                               </td>
                               <td className="p-3 text-center">
                                 {hasError && (
                                   <button
                                     onClick={() => setExcelData((prev: any[]) => prev.filter((r: any) => r.id !== d.id))}
                                     className="text-gray-400 hover:text-red-500 transition-colors"
                                     title="이 행 삭제"
                                   >
                                     <X className="w-4 h-4" />
                                   </button>
                                 )}
                               </td>
                             </tr>
                           );
                         })}
                       </tbody>
                     </table>
                   </div>
                 )}
              </div>
            )}
          </>
        )}
        {currentStep === 2 && (
          <VanFirmBankingRegistration enterprises={enterprises} vanRecords={vanRecords} setVanRecords={setVanRecords} />
        )}
        {currentStep === 3 && (
          <EnterpriseInterfaceSettings enterprises={enterprises} />
        )}
        {currentStep === 4 && (
          <EnterpriseUsageSettings enterprises={enterprises} />
        )}
      </div>

      {/* Footer */}
      {pageError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-body-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {pageError}
        </div>
      )}
      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
        {currentStep > 1 ? (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          >
            이전 단계
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          {currentStep === 2 && (
            <Button variant="secondary" size="md" onClick={handleNextStep}>
              건너뛰기
            </Button>
          )}
          <Button variant="primary" size="md" onClick={handleNextStep}>
            {currentStep === 4 ? '등록 완료' : '다음 단계'}
          </Button>
        </div>
      </div>
    </div>
  );
}
