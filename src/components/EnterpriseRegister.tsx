import React, { useState } from 'react';
import { ChevronRight, Check, X, AlertCircle, FileSpreadsheet, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, Clock, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnterpriseBlock, ExcelRow } from './register/types';

// Simplified Stepper
const STEPS = ['기업 기본정보 등록', 'VAN/펌뱅킹 ID 등록', '기업 인터페이스/파라미터 설정'];


// ... (imports)

import EnterpriseInterfaceSettings from './EnterpriseInterfaceSettings';
// ─── VAN/펌뱅킹 데이터 타입 ───────────────────────────────────────────────
type CompanyVanInfo = {
  van: string;
  repId: string;        repAccount: string;
  salaryId: string;     salaryAccount: string;
  bulkId: string;       bulkAccount: string;
  foreignId: string;    foreignAccount: string;
  giroId: string;       giroAccount: string;
  fxForeignId: string;  fxForeignAccount: string;
  fxWonId: string;      fxWonAccount: string;
  steelId: string;      steelAccount: string;
  subId: string;        subAccount: string;
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
  repId: '',       repAccount: '',
  salaryId: '',    salaryAccount: '',
  bulkId: '',      bulkAccount: '',
  foreignId: '',   foreignAccount: '',
  giroId: '',      giroAccount: '',
  fxForeignId: '', fxForeignAccount: '',
  fxWonId: '',     fxWonAccount: '',
  steelId: '',     steelAccount: '',
  subId: '',       subAccount: '',
};

type PumbankingSection = {
  idKey: keyof CompanyVanInfo;
  accountKey: keyof CompanyVanInfo;
  label: string;
};

const PUMBANKING_SECTIONS: PumbankingSection[] = [
  { idKey: 'repId',       accountKey: 'repAccount',       label: '대표계좌' },
  { idKey: 'salaryId',    accountKey: 'salaryAccount',    label: '급여계좌' },
  { idKey: 'bulkId',      accountKey: 'bulkAccount',      label: '대량이체' },
  { idKey: 'foreignId',   accountKey: 'foreignAccount',   label: '외화 출금' },
  { idKey: 'giroId',      accountKey: 'giroAccount',      label: '지로' },
  { idKey: 'fxForeignId', accountKey: 'fxForeignAccount', label: '환전(외화)' },
  { idKey: 'fxWonId',     accountKey: 'fxWonAccount',     label: '환전(원화)' },
  { idKey: 'steelId',     accountKey: 'steelAccount',     label: '철스크랩' },
  { idKey: 'subId',       accountKey: 'subAccount',       label: '하도급' },
];

const VAN_FIELD_LABELS: Record<string, string> = {
  van: 'VAN ID',
  repId: '대표계좌 펌뱅킹 ID',       repAccount: '대표계좌 계좌번호',
  salaryId: '급여계좌 펌뱅킹 ID',    salaryAccount: '급여계좌 계좌번호',
  bulkId: '대량이체 펌뱅킹 ID',      bulkAccount: '대량이체 계좌번호',
  foreignId: '외화 출금 펌뱅킹 ID',  foreignAccount: '외화 출금 계좌번호',
  giroId: '지로 펌뱅킹 ID',          giroAccount: '지로 계좌번호',
  fxForeignId: '환전(외화) 펌뱅킹 ID', fxForeignAccount: '환전(외화) 계좌번호',
  fxWonId: '환전(원화) 펌뱅킹 ID',   fxWonAccount: '환전(원화) 계좌번호',
  steelId: '철스크랩 펌뱅킹 ID',     steelAccount: '철스크랩 계좌번호',
  subId: '하도급 펌뱅킹 ID',         subAccount: '하도급 계좌번호',
};

function hasVanValues(info: CompanyVanInfo) {
  return Object.values(info).some(v => v.trim() !== '');
}

function EntStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    waiting:    'bg-gray-50 text-gray-400 border-gray-100',
    inProgress: 'bg-amber-50 text-amber-700 border-amber-100',
    done:       'bg-[#008d75]/10 text-[#008d75] border-[#008d75]/20',
    skipped:    'bg-gray-100 text-gray-400 border-gray-200',
    editing:    'bg-blue-50 text-blue-700 border-blue-100',
  };
  const labels: Record<string, string> = {
    waiting: '대기', inProgress: '진행중', done: '완료', skipped: '건너뜀', editing: '수정중',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${styles[status] || styles.waiting}`}>
      {labels[status] || '대기'}
    </span>
  );
}

// ─── VAN/펌뱅킹 등록 메인 컴포넌트 ──────────────────────────────────────────
const VanFirmBankingRegistration = ({ enterprises, vanRecords, setVanRecords }) => {
  const [vanData, setVanData] = useState<Record<string, CompanyVanInfo>>(() => {
    const data: Record<string, CompanyVanInfo> = {};
    enterprises.forEach(e => { data[e.id] = { ...EMPTY_VAN_INFO }; });
    return data;
  });

  const [selectedEntId, setSelectedEntId] = useState<string>(enterprises[0]?.id || '');
  const [currentRow, setCurrentRow] = useState<CompanyVanInfo>({ ...EMPTY_VAN_INFO });
  const [entStatuses, setEntStatuses] = useState<Record<string, StoredStatus>>(() => {
    const s: Record<string, StoredStatus> = {};
    enterprises.forEach(e => { s[e.id] = 'waiting'; });
    return s;
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['repId']));
  const [skipConfirm, setSkipConfirm] = useState<{ show: boolean; entId: string }>({ show: false, entId: '' });

  if (enterprises.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-[14px]">표시할 기업 정보가 없습니다.</p>
        <p className="text-[12px] mt-1">1단계에서 기업을 먼저 추가해주세요.</p>
      </div>
    );
  }

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
    setCurrentRow({ ...(updatedVanData[newId] || EMPTY_VAN_INFO) });
    setExpandedSections(new Set(['repId']));
  };

  const handleInputChange = (field: keyof CompanyVanInfo, value: string) => {
    setCurrentRow(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
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
    const updatedVanData = { ...vanData, [entId]: { ...EMPTY_VAN_INFO } };
    setVanData(updatedVanData);
    setEntStatuses(prev => ({ ...prev, [entId]: 'skipped' }));
    if (entId === selectedEntId) setCurrentRow({ ...EMPTY_VAN_INFO });
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

  const completedCount = enterprises.filter(e => entStatuses[e.id] === 'done').length;
  const skippedCount  = enterprises.filter(e => entStatuses[e.id] === 'skipped').length;
  const progressPct   = Math.round(((completedCount + skippedCount) / Math.max(enterprises.length, 1)) * 100);

  const skipConfirmEnt    = enterprises.find(e => e.id === skipConfirm.entId);
  const skipConfirmValues = skipConfirm.entId === selectedEntId
    ? currentRow
    : (vanData[skipConfirm.entId] || EMPTY_VAN_INFO);

  const sidebarSubText: Record<string, string> = {
    waiting:    '미진입',
    inProgress: '입력 중',
    done:       '입력 완료',
    skipped:    '건너뜀',
    editing:    '수정 중',
  };

  return (
    <div className="relative">

      {/* ── 건너뛰기 확인 팝업 ─────────────────────────────────────── */}
      {skipConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-[400px] p-6">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-2">이 기업을 건너뛰시겠습니까?</h3>
            <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
              <span className="font-semibold text-gray-700">{skipConfirmEnt?.name}</span>에 이미 입력된 값이 있습니다.<br />
              건너뛰면 아래 데이터가 모두 삭제됩니다.
            </p>
            <div className="bg-gray-50 rounded-md p-3 mb-4 text-[12px] divide-y divide-gray-100">
              {Object.entries(skipConfirmValues)
                .filter(([, v]) => (v as string).trim())
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5">
                    <span className="text-gray-500">{VAN_FIELD_LABELS[k]}</span>
                    <span className="font-medium text-gray-800 font-mono">{v as string}</span>
                  </div>
                ))}
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 text-[12px] text-amber-700 mb-5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>삭제 후에는 해당 기업을 다시 선택해 재입력해야 합니다.</span>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSkipConfirm({ show: false, entId: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md text-[13px] text-gray-700 hover:bg-gray-50"
              >
                취소 (입력 유지)
              </button>
              <button
                onClick={() => doSkip(skipConfirm.entId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-[13px] font-semibold"
              >
                삭제하고 건너뛰기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 진행 현황 바 ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[13px] text-gray-500 whitespace-nowrap">
          {enterprises.length}개 기업 중{' '}
          <span className="font-semibold text-gray-700">{completedCount}개</span> 완료
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#008d75] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[13px] text-gray-400 whitespace-nowrap">{progressPct}%</span>
      </div>

      {/* ── 본문: 사이드바 + 콘텐츠 ───────────────────────────────── */}
      <div className="flex gap-6" style={{ minHeight: 460 }}>

        {/* 사이드바 */}
        <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-[13px] font-semibold text-gray-700">등록 기업 목록</span>
          </div>
          <div className="overflow-y-auto">
            {enterprises.map(ent => {
              const status   = getDisplayStatus(ent.id);
              const isActive = ent.id === selectedEntId;
              return (
                <button
                  key={ent.id}
                  onClick={() => switchEnterprise(ent.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 border-l-2 transition-colors border-b border-gray-50 ${
                    isActive
                      ? 'bg-[#008d75]/5 border-l-[#008d75]'
                      : 'border-l-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`text-[13px] font-semibold truncate ${isActive ? 'text-[#008d75]' : 'text-gray-800'}`}>
                      {ent.name}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
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
            <div>
              <div className="text-[15px] font-bold text-gray-900">
                {enterprises.find(e => e.id === selectedEntId)?.name}
              </div>
              <div className="text-[13px] text-gray-500 mt-0.5">
                사용하는 항목만 입력하세요. 입력 내용은 최종 단계 완료 시 일괄 등록됩니다.
              </div>
            </div>
            <button
              onClick={handleSkipClick}
              className="flex-shrink-0 flex items-center gap-1.5 text-[13px] text-gray-500 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              ↩ 건너뛰기
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6 flex-1">

            {/* 재수정 배너 */}
            {entStatuses[selectedEntId] === 'done' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-[13px] text-blue-700">
                <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
                이전에 입력한 내용을 수정하고 있습니다.
              </div>
            )}

            {/* VAN ID */}
            <div>
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3">VAN 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">VAN ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75]"
                    placeholder="VAN ID 입력"
                    value={currentRow.van}
                    onChange={e => handleInputChange('van', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100" />

            {/* 펌뱅킹 ID */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-gray-700">펌뱅킹 ID</h3>
                <span className="text-[12px] text-gray-400">필요한 항목만 펼쳐 입력하세요</span>
              </div>
              <div className="flex flex-col gap-2">
                {PUMBANKING_SECTIONS.map(({ idKey, accountKey, label }) => {
                  const isOpen = expandedSections.has(idKey);
                  const hasVal = !!(currentRow[idKey] || currentRow[accountKey]);
                  return (
                    <div key={idKey} className="border border-gray-200 rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleSection(idKey)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
                          {label}
                          {hasVal && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#008d75]/10 text-[#008d75] border border-[#008d75]/20 font-medium">
                              입력됨
                            </span>
                          )}
                        </span>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 py-4 border-t border-gray-100 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">펌뱅킹 ID</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75]"
                                placeholder="펌뱅킹 ID 입력"
                                value={currentRow[idKey] as string}
                                onChange={e => handleInputChange(idKey, e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">계좌번호 <span className="font-normal text-gray-400">(선택)</span></label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75]"
                                placeholder="숫자 10~14자리"
                                value={currentRow[accountKey] as string}
                                onChange={e => handleInputChange(accountKey, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 안내 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-[13px] text-gray-500 mt-auto">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              입력 내용은 최종 단계 완료 시 일괄 등록됩니다.
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
  const [formState, setFormState] = useState({ id: '', name: '', bizNumber: '', corpNumber: '' });
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

  // Mock functions for functionality (same as before)
  const handleCheckTenant = () => {
    setPageError('');
    if (!tenantCode.trim()) {
      setTenantStatus('error');
      setTenantMessage('테넌트값을 입력해주세요.');
      return;
    }

    // Mock redundancy check
    if (tenantCode === 'fail') {
      setTenantStatus('error');
      setTenantMessage('이미 사용 중인 테넌트값입니다.');
    } else {
      setTenantStatus('success');
      setTenantMessage('사용 가능한 테넌트값입니다.');
    }
  };

  const handleAddOrUpdate = () => {
    setPageError('');
    // Basic validation
    const errors: any = {};
    if (!formState.name.trim()) errors.name = '기업명을 입력해주세요.';
    if (!formState.bizNumber.trim()) errors.bizNumber = '사업자등록번호를 입력해주세요.';
    else if (formState.bizNumber.length !== 10) errors.bizNumber = '사업자등록번호는 10자리 숫자로 입력해주세요.';

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
    setFormState({ id: '', name: '', bizNumber: '', corpNumber: '' });
    setFormErrors({});
  };

  const handleEditClick = (ent) => {
    setPageError('');
    setFormState(ent);
    setEditingId(ent.id);
  };

  const handleCancelEdit = () => {
    setFormState({ id: '', name: '', bizNumber: '', corpNumber: '' });
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

      return { ...row, errors: Object.keys(errors).length > 0 ? errors : undefined };
    });
  };

  const handleUploadExcel = () => {
    setPageError('');
    // Mock 파일 파싱 결과 — 실제 구현 시 xlsx 라이브러리로 파일 읽기
    const rawRows = [
      { id: '1', name: '혁신기업(주)', bizNumber: '1234567890', corpNumber: '1234567890123' },
      { id: '2', name: '미래상사',     bizNumber: '1234567890', corpNumber: '' },
      { id: '3', name: '테스트컴퍼니', bizNumber: '11122233',   corpNumber: '' },
      { id: '4', name: '',             bizNumber: '5555555555', corpNumber: '9999999999999' },
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
      if (tenantStatus !== 'success') {
        setPageError('테넌트 중복 확인이 완료되지 않았습니다.');
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
    setCurrentStep(Math.min(3, currentStep + 1));
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* 1. Stepper & Instruction */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          {STEPS.map((step, idx) => (
            <div key={step} className={`flex items-center gap-2 text-[14px] font-bold ${idx + 1 === currentStep ? 'text-[#008d75]' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${idx + 1 === currentStep ? 'bg-[#008d75] text-white' : 'bg-gray-100'}`}>{idx + 1}</span>
              {step}
            </div>
          ))}
        </div>

      </div>

      {/* 2. Registration Content based on Step */}
      {/* 2. Registration Content based on Step */}
      <div className="pb-6">
        {currentStep === 1 && (
          <>
            {/* Common Tenant Input */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">테넌트 <span className="text-red-500">*</span></label>
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col w-full max-w-sm gap-1">
                      <input
                        className={`w-full px-3 py-2 border rounded-md text-[14px] ${tenantStatus === 'error' ? 'border-[#F04452]' : 'border-gray-300'}`}
                        placeholder="테넌트값 입력"
                        value={tenantCode}
                        onChange={e => {
                          setTenantCode(e.target.value);
                          setTenantStatus('idle');
                        }}
                      />
                      {tenantMessage && (
                        <p className={`text-[12px] flex items-center gap-1 ${tenantStatus === 'error' ? 'text-[#F04452]' : 'text-[#008d75]'}`}>
                          {tenantStatus === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                          {tenantMessage}
                        </p>
                      )}
                    </div>
                    <button onClick={handleCheckTenant} className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-[13px] font-semibold">중복 확인</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-b border-gray-200 mb-6">
              {['직접 입력', '엑셀 업로드'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRegisterMode(mode === '직접 입력' ? 'manual' : 'excel')}
                  className={`pb-3 text-[14px] font-bold ${registerMode.startsWith(mode === '직접 입력' ? 'manual' : 'excel') ? 'text-[#008d75] border-b-2 border-[#008d75]' : 'text-gray-400'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {registerMode === 'manual' ? (
              <>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">기업명 <span className="text-[#F04452]">*</span></label>
                      <input className={`w-full px-3 py-2 border rounded-md text-[14px] ${formErrors.name ? 'border-[#F04452]' : 'border-gray-300'}`} placeholder="기업명 입력" value={formState.name} onChange={e => {setFormState({...formState, name: e.target.value}); setFormErrors({...formErrors, name: ''})}} />
                      {formErrors.name && <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">사업자등록번호 <span className="text-[#F04452]">*</span></label>
                      <input
                        className={`w-full px-3 py-2 border rounded-md text-[14px] ${formErrors.bizNumber ? 'border-[#F04452]' : 'border-gray-300'}`}
                        placeholder="10자리 숫자 입력"
                        value={formState.bizNumber}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setFormState({...formState, bizNumber: value});
                          setFormErrors({...formErrors, bizNumber: ''});
                        }}
                      />
                      {formErrors.bizNumber && <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{formErrors.bizNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">법인등록번호</label>
                      <input className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px]" placeholder="13자리 숫자 입력(선택)" value={formState.corpNumber} onChange={e => setFormState({...formState, corpNumber: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                    <button onClick={editingId ? handleCancelEdit : () => setFormState({ id: '', name: '', bizNumber: '', corpNumber: '' })} className="px-6 py-2 bg-white border border-[#008d75] rounded-md text-[14px] font-semibold text-[#008d75]">취소</button>
                    <button onClick={handleAddOrUpdate} className="px-6 py-2 bg-[#008d75] rounded-md text-[14px] font-semibold text-white">{editingId ? '수정' : '등록'}</button>
                  </div>
                </div>
                {/* Registered Enterprise List (Manual) */}
                <div className="bg-white">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-[16px] font-bold text-gray-900 mb-1">기업 목록</h3>
                      <p className="text-[13px] text-gray-500">추가한 항목은 아래 목록에서 확인하고 삭제할 수 있습니다.</p>
                    </div>
                    <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="px-4 py-2 border border-[#d32f2f] rounded-md text-[12px] font-semibold text-[#d32f2f] disabled:bg-gray-100 disabled:border-gray-300">삭제</button>
                  </div>
                  <table className="w-full text-left text-[13px] table-fixed">
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
                      <div className="w-16 h-16 bg-[#008d75]/10 text-[#008d75] rounded-full flex items-center justify-center mb-5"><FileSpreadsheet className="w-8 h-8" /></div>
                      <h3 className="text-gray-900 font-bold text-[16px] mb-2">엑셀 파일을 업로드하여 일괄 등록하세요</h3>
                      <button onClick={handleUploadExcel} className="px-6 py-3 bg-[#008d75] rounded-md text-[14px] font-semibold text-white">파일 업로드 (.xlsx, .xls)</button>
                    </div>
                 ) : (
                   <div>
                     {/* 헤더 */}
                     <div className="flex justify-between items-end mb-4">
                       <div>
                         <h3 className="text-[16px] font-bold text-gray-900 mb-1">기업 목록 (엑셀)</h3>
                         <div className="flex items-center gap-3 text-[13px]">
                           <span className="text-gray-500">총 {excelData.length}개</span>
                           <span className="text-[#008d75] font-semibold">
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
                             className="px-4 py-2 border border-red-300 rounded-md text-[12px] font-semibold text-red-600 hover:bg-red-50"
                           >
                             오류 행 삭제
                           </button>
                         )}
                         <button
                           onClick={() => setIsUploaded(false)}
                           className="px-4 py-2 border border-gray-300 rounded-md text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
                         >
                           다른 파일 업로드
                         </button>
                       </div>
                     </div>

                     {/* 테이블 */}
                     <table className="w-full text-left text-[13px] table-fixed">
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
                                   <div className="text-[11px] text-red-500 mt-0.5">{d.errors.name}</div>
                                 )}
                               </td>
                               <td className="p-3">
                                 <div className={`truncate ${d.errors?.bizNumber ? 'text-red-500' : ''}`}>
                                   {d.bizNumber || '(미입력)'}
                                 </div>
                                 {d.errors?.bizNumber && (
                                   <div className="text-[11px] text-red-500 mt-0.5">{d.errors.bizNumber}</div>
                                 )}
                               </td>
                               <td className="p-3">
                                 <div className={`truncate ${d.errors?.corpNumber ? 'text-red-500' : ''}`}>
                                   {d.corpNumber || '-'}
                                 </div>
                                 {d.errors?.corpNumber && (
                                   <div className="text-[11px] text-red-500 mt-0.5">{d.errors.corpNumber}</div>
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
      </div>

      {/* Footer */}
      {pageError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-[13px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {pageError}
        </div>
      )}
      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className="px-6 py-2.5 border border-gray-300 rounded-md text-[14px] font-bold text-gray-700"
          >
            이전 단계
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleNextStep}
          className="px-10 py-2.5 bg-[#008d75] rounded-md text-[14px] font-bold text-white shadow-sm"
        >
          {currentStep === 3 ? '등록 완료' : '다음 단계'}
        </button>
      </div>
    </div>
  );
}
