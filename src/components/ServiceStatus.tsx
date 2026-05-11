import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, Activity, RefreshCw } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  status: 'normal' | 'warning' | 'error' | 'maintenance';
  uptime: string;
  responseTime: string;
  lastChecked: string;
  description: string;
}

const mockServices: ServiceItem[] = [
  { id: '1', name: 'VAN 연동 서비스', category: '결제', status: 'normal', uptime: '99.98%', responseTime: '120ms', lastChecked: '2024-05-11 14:30:00', description: 'VAN사 카드 결제 연동 서비스' },
  { id: '2', name: '펌뱅킹 서비스', category: '결제', status: 'normal', uptime: '99.95%', responseTime: '85ms', lastChecked: '2024-05-11 14:30:00', description: '기업 펌뱅킹 출금 서비스' },
  { id: '3', name: '오픈뱅킹 서비스', category: '결제', status: 'warning', uptime: '98.50%', responseTime: '350ms', lastChecked: '2024-05-11 14:30:00', description: '오픈뱅킹 API 연동 서비스' },
  { id: '4', name: '사용자 인증 서비스', category: '인증', status: 'normal', uptime: '99.99%', responseTime: '45ms', lastChecked: '2024-05-11 14:30:00', description: '로그인 및 OTP 인증 서비스' },
  { id: '5', name: 'ERP 연동 API', category: '연동', status: 'normal', uptime: '99.90%', responseTime: '200ms', lastChecked: '2024-05-11 14:30:00', description: '기업 ERP 시스템 연동 API' },
  { id: '6', name: '알림 발송 서비스', category: '알림', status: 'normal', uptime: '99.80%', responseTime: '95ms', lastChecked: '2024-05-11 14:30:00', description: '이메일 및 PUSH 알림 발송 서비스' },
  { id: '7', name: '파일 업로드 서비스', category: '파일', status: 'maintenance', uptime: '-', responseTime: '-', lastChecked: '2024-05-11 14:30:00', description: '엑셀/이미지 파일 업로드 서비스 (점검 중)' },
  { id: '8', name: '정산 배치 서비스', category: '배치', status: 'normal', uptime: '99.70%', responseTime: '-', lastChecked: '2024-05-11 14:30:00', description: '일별 정산 자동화 배치 서비스' },
  { id: '9', name: '로그 수집 서비스', category: '모니터링', status: 'error', uptime: '95.00%', responseTime: '-', lastChecked: '2024-05-11 14:30:00', description: '시스템 로그 수집 및 저장 서비스' },
];

const statusConfig = {
  normal: { label: '정상', color: 'text-[#008d75]', bg: 'bg-[#008d7510]', border: 'border-[#008d7530]', icon: CheckCircle2 },
  warning: { label: '주의', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle },
  error: { label: '오류', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle },
  maintenance: { label: '점검', color: 'text-[#8B95A1]', bg: 'bg-[#F2F4F6]', border: 'border-[#E5E8EB]', icon: Clock },
};

const categories = ['전체', ...Array.from(new Set(mockServices.map(s => s.category)))];

const summaryStats = {
  total: mockServices.length,
  normal: mockServices.filter(s => s.status === 'normal').length,
  warning: mockServices.filter(s => s.status === 'warning').length,
  error: mockServices.filter(s => s.status === 'error').length,
  maintenance: mockServices.filter(s => s.status === 'maintenance').length,
};

export default function ServiceStatus() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [lastRefreshed] = useState('2024-05-11 14:30:00');

  const filtered = selectedCategory === '전체'
    ? mockServices
    : mockServices.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[20px] font-bold text-[#191F28]">서비스 현황</h2>
            <p className="text-[13px] text-[#8B95A1] mt-1">마지막 갱신: {lastRefreshed}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28] text-[13px] font-medium rounded-lg transition-colors">
            <RefreshCw size={14} />
            새로고침
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E8EB]">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={15} className="text-[#8B95A1]" />
              <span className="text-[12px] text-[#8B95A1]">전체 서비스</span>
            </div>
            <p className="text-[24px] font-bold text-[#191F28]">{summaryStats.total}</p>
          </div>
          <div className="bg-[#008d7508] rounded-lg p-4 border border-[#008d7520]">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={15} className="text-[#008d75]" />
              <span className="text-[12px] text-[#008d75]">정상</span>
            </div>
            <p className="text-[24px] font-bold text-[#008d75]">{summaryStats.normal}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={15} className="text-yellow-600" />
              <span className="text-[12px] text-yellow-600">주의 / 오류</span>
            </div>
            <p className="text-[24px] font-bold text-yellow-600">{summaryStats.warning + summaryStats.error}</p>
          </div>
          <div className="bg-[#F2F4F6] rounded-lg p-4 border border-[#E5E8EB]">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={15} className="text-[#8B95A1]" />
              <span className="text-[12px] text-[#8B95A1]">점검 중</span>
            </div>
            <p className="text-[24px] font-bold text-[#8B95A1]">{summaryStats.maintenance}</p>
          </div>
        </div>
      </div>

      {/* 서비스 목록 */}
      <div className="bg-white rounded-xl border border-[#E5E8EB] p-6">
        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#191F28] text-white'
                  : 'bg-[#F2F4F6] text-[#8B95A1] hover:bg-[#E5E8EB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F2F4F6]">
                <th className="text-left text-[#8B95A1] font-medium px-4 py-3 rounded-l-lg">서비스명</th>
                <th className="text-left text-[#8B95A1] font-medium px-4 py-3">카테고리</th>
                <th className="text-center text-[#8B95A1] font-medium px-4 py-3">상태</th>
                <th className="text-center text-[#8B95A1] font-medium px-4 py-3">업타임</th>
                <th className="text-center text-[#8B95A1] font-medium px-4 py-3">응답시간</th>
                <th className="text-left text-[#8B95A1] font-medium px-4 py-3 rounded-r-lg">마지막 확인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F6]">
              {filtered.map(service => {
                const cfg = statusConfig[service.status];
                const Icon = cfg.icon;
                return (
                  <tr key={service.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#191F28]">{service.name}</p>
                      <p className="text-[12px] text-[#8B95A1] mt-0.5">{service.description}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#8B95A1]">{service.category}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <Icon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-[#191F28]">{service.uptime}</td>
                    <td className="px-4 py-3.5 text-center text-[#191F28]">{service.responseTime}</td>
                    <td className="px-4 py-3.5 text-[#8B95A1]">{service.lastChecked}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
