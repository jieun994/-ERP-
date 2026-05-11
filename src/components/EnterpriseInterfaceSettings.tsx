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
