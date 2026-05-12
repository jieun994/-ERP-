import React, { useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

type InterfaceMethod = 'REST' | 'OData' | 'RFC' | 'JCO';

type CompanyInterfaceInfo = {
  method: InterfaceMethod;
  apiUrl: string;
  authMethod: string;
  accessToken: string;
};

/**
 * 기업별 인터페이스 설정 상태
 *
 * waiting (대기) : 필수 항목(API URL, 인증 방식, Access Token)이 하나라도 비어있는 상태
 * done    (완료) : 필수 항목이 모두 입력된 상태
 *
 * ※ 실제 저장(서버 전송)은 최종 단계 완료 시 일괄 처리됨
 */
type EntStatus = 'waiting' | 'done';

const INTERFACE_METHODS: { value: InterfaceMethod; label: string }[] = [
  { value: 'REST',  label: 'REST' },
  { value: 'OData', label: 'OData' },
  { value: 'RFC',   label: 'RFC' },
  { value: 'JCO',   label: 'JCO client' },
];

const AUTH_METHODS = [
  { value: '',        label: '인증 방식 선택' },
  { value: 'none',    label: 'None' },
  { value: 'basic',   label: 'Basic Auth' },
  { value: 'bearer',  label: 'Bearer Token' },
  { value: 'oauth2',  label: 'OAuth 2.0' },
];

const EMPTY_INFO: CompanyInterfaceInfo = {
  method:      'REST',
  apiUrl:      '',
  authMethod:  '',
  accessToken: '',
};

function isComplete(info: CompanyInterfaceInfo): boolean {
  return !!(info.apiUrl.trim() && info.authMethod && info.accessToken.trim());
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface Enterprise {
  id: string;
  name: string;
}

export default function EnterpriseInterfaceSettings({ enterprises }: { enterprises: Enterprise[] }) {
  const [interfaceData, setInterfaceData] = useState<Record<string, CompanyInterfaceInfo>>(() => {
    const data: Record<string, CompanyInterfaceInfo> = {};
    enterprises.forEach(e => { data[e.id] = { ...EMPTY_INFO }; });
    return data;
  });

  const [selectedEntId, setSelectedEntId] = useState<string>(enterprises[0]?.id || '');
  const [currentRow, setCurrentRow] = useState<CompanyInterfaceInfo>({ ...EMPTY_INFO });

  if (enterprises.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-[14px]">표시할 기업 정보가 없습니다.</p>
        <p className="text-[12px] mt-1">1단계에서 기업을 먼저 추가해주세요.</p>
      </div>
    );
  }

  // 기업 탭 전환 시 현재 값을 state에 보관 후 새 기업 데이터 로드
  const switchEnterprise = (newId: string) => {
    if (newId === selectedEntId) return;
    setInterfaceData(prev => ({ ...prev, [selectedEntId]: { ...currentRow } }));
    setSelectedEntId(newId);
    setCurrentRow({ ...(interfaceData[newId] || EMPTY_INFO) });
  };

  const handleChange = <K extends keyof CompanyInterfaceInfo>(field: K, value: CompanyInterfaceInfo[K]) => {
    setCurrentRow(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setCurrentRow({ ...EMPTY_INFO });
  };

  const getStatus = (id: string): EntStatus => {
    const info = id === selectedEntId ? currentRow : (interfaceData[id] || EMPTY_INFO);
    return isComplete(info) ? 'done' : 'waiting';
  };

  const completedCount = enterprises.filter(e => getStatus(e.id) === 'done').length;
  const progressPct = Math.round((completedCount / Math.max(enterprises.length, 1)) * 100);

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75]';

  return (
    <div className="relative">

      {/* 진행 현황 바 */}
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

      {/* 본문: 사이드바 + 콘텐츠 */}
      <div className="flex gap-6" style={{ minHeight: 460 }}>

        {/* 사이드바 */}
        <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-[13px] font-semibold text-gray-700">등록 기업 목록</span>
          </div>
          <div className="overflow-y-auto">
            {enterprises.map(ent => {
              const status   = getStatus(ent.id);
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
                      {status === 'done' ? '입력 완료' : '미입력'}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${
                    status === 'done'
                      ? 'bg-[#008d75]/10 text-[#008d75] border-[#008d75]/20'
                      : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {status === 'done' ? '완료' : '대기'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-bold text-gray-900">
                {enterprises.find(e => e.id === selectedEntId)?.name}
              </div>
              <div className="text-[13px] text-gray-500 mt-0.5">
                인터페이스 방식을 선택하고 연동 정보를 입력하세요.
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex-shrink-0 flex items-center gap-1.5 text-[13px] text-gray-500 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6 flex-1">

            {/* 인터페이스 방식 */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-3">
                인터페이스 방식
              </label>
              <div className="flex items-center gap-6">
                {INTERFACE_METHODS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`method-${selectedEntId}`}
                      value={value}
                      checked={currentRow.method === value}
                      onChange={() => handleChange('method', value)}
                      className="w-4 h-4 accent-[#008d75] cursor-pointer"
                    />
                    <span className="text-[14px] text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100" />

            {/* 파라미터 입력 */}
            <div>
              <h3 className="text-[13px] font-semibold text-gray-700 mb-4">파라미터 입력</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    API URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="URL 입력"
                    value={currentRow.apiUrl}
                    onChange={e => handleChange('apiUrl', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    인증 방식 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={currentRow.authMethod}
                    onChange={e => handleChange('authMethod', e.target.value)}
                  >
                    {AUTH_METHODS.map(({ value, label }) => (
                      <option key={value} value={value} disabled={value === ''}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Access Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="토큰 입력"
                    value={currentRow.accessToken}
                    onChange={e => handleChange('accessToken', e.target.value)}
                  />
                </div>
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
}
