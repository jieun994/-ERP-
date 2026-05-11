import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, MinusCircle, RefreshCw } from 'lucide-react';
import { Button, PageLayout, SectionCard, StatusBadge, Select } from './ui';

type LinkStatus = 'normal' | 'error' | 'disconnected';

interface CompanyStatus {
  id: string;
  companyName: string;
  erpType: string;
  status: LinkStatus;
  lastLinkedAt: string;
}

interface SystemInfo {
  id: string;
  name: string;
  companies: CompanyStatus[];
}

const mockSystems: SystemInfo[] = [
  {
    id: 'biz-1',
    name: 'Biz-서비스 1',
    companies: [
      { id: '1', companyName: '(주)이트라이브', erpType: 'SAP ERP', status: 'normal', lastLinkedAt: '2024-05-11 14:30:00' },
      { id: '2', companyName: '(주)한국전자', erpType: '더존 iCUBE', status: 'error', lastLinkedAt: '2024-05-11 13:10:22' },
      { id: '3', companyName: '(주)대한물산', erpType: '영림원 K-System', status: 'normal', lastLinkedAt: '2024-05-11 14:28:05' },
      { id: '4', companyName: '(주)서울유통', erpType: 'SAP ERP', status: 'normal', lastLinkedAt: '2024-05-11 14:29:50' },
      { id: '5', companyName: '(주)미래산업', erpType: '더존 WEHAGO', status: 'disconnected', lastLinkedAt: '2024-05-10 18:00:00' },
    ],
  },
  {
    id: 'biz-2',
    name: 'Biz-서비스 2',
    companies: [
      { id: '6', companyName: '(주)태양에너지', erpType: '더존 iCUBE', status: 'normal', lastLinkedAt: '2024-05-11 14:30:00' },
      { id: '7', companyName: '(주)글로벌무역', erpType: 'Oracle ERP', status: 'normal', lastLinkedAt: '2024-05-11 14:25:33' },
      { id: '8', companyName: '(주)한강건설', erpType: '영림원 K-System', status: 'error', lastLinkedAt: '2024-05-11 12:45:10' },
      { id: '9', companyName: '(주)중앙식품', erpType: 'SAP ERP', status: 'disconnected', lastLinkedAt: '2024-05-09 09:00:00' },
    ],
  },
  {
    id: 'erp-int-1',
    name: 'ERP 인테그레이션 1',
    companies: [
      { id: '10', companyName: '(주)동방화학', erpType: 'SAP ERP', status: 'normal', lastLinkedAt: '2024-05-11 14:30:00' },
      { id: '11', companyName: '(주)남산제약', erpType: '더존 iCUBE', status: 'normal', lastLinkedAt: '2024-05-11 14:29:00' },
      { id: '12', companyName: '(주)하늘항공', erpType: 'Oracle ERP', status: 'normal', lastLinkedAt: '2024-05-11 14:28:44' },
    ],
  },
  {
    id: 'erp-int-2',
    name: 'ERP 인테그레이션 2',
    companies: [
      { id: '13', companyName: '(주)벽산전자', erpType: '영림원 K-System', status: 'error', lastLinkedAt: '2024-05-11 11:00:00' },
      { id: '14', companyName: '(주)청계유통', erpType: '더존 WEHAGO', status: 'normal', lastLinkedAt: '2024-05-11 14:30:00' },
      { id: '15', companyName: '(주)광명소재', erpType: 'SAP ERP', status: 'disconnected', lastLinkedAt: '2024-05-08 17:30:00' },
      { id: '16', companyName: '(주)강북산업', erpType: '더존 iCUBE', status: 'normal', lastLinkedAt: '2024-05-11 14:27:11' },
    ],
  },
];

const statusConfig: Record<LinkStatus, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  normal:       { label: '정상',   color: 'text-[#008d75]', bg: 'bg-[#008d7510]', border: 'border-[#008d7530]', Icon: CheckCircle2 },
  error:        { label: '오류',   color: 'text-red-600',   bg: 'bg-red-50',       border: 'border-red-200',     Icon: AlertCircle  },
  disconnected: { label: '미연결', color: 'text-[#8B95A1]', bg: 'bg-[#F2F4F6]',   border: 'border-[#E5E8EB]',   Icon: MinusCircle  },
};

export default function ServiceStatus() {
  const [selectedSystemId, setSelectedSystemId] = useState<string>(mockSystems[0].id);
  const [lastRefreshed] = useState('2024-05-11 14:30:00');

  const selectedSystem = mockSystems.find(s => s.id === selectedSystemId)!;
  const companies = selectedSystem.companies;

  const counts = {
    total:        companies.length,
    normal:       companies.filter(c => c.status === 'normal').length,
    error:        companies.filter(c => c.status === 'error').length,
    disconnected: companies.filter(c => c.status === 'disconnected').length,
  };

  return (
    <PageLayout bottomPadding={false}>
      <div className="space-y-6">

        <SectionCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[20px] font-bold text-[#191F28]">시스템 모니터링</h2>
              <p className="text-[13px] text-[#8B95A1] mt-1">마지막 갱신: {lastRefreshed}</p>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <RefreshCw size={14} />새로고침
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-[13px] font-medium text-[#4E5968] whitespace-nowrap">시스템 선택</span>
            <Select
              value={selectedSystemId}
              onChange={e => setSelectedSystemId(e.target.value)}
              style={{ width: 220 }}
            >
              {mockSystems.map(sys => (
                <option key={sys.id} value={sys.id}>{sys.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E8EB]">
              <p className="text-[12px] text-[#8B95A1] mb-1">전체 기업</p>
              <p className="text-[24px] font-bold text-[#191F28]">{counts.total}</p>
            </div>
            <div className="bg-[#008d7508] rounded-lg p-4 border border-[#008d7520]">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={13} className="text-[#008d75]" />
                <p className="text-[12px] text-[#008d75]">정상</p>
              </div>
              <p className="text-[24px] font-bold text-[#008d75]">{counts.normal}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle size={13} className="text-red-600" />
                <p className="text-[12px] text-red-600">오류</p>
              </div>
              <p className="text-[24px] font-bold text-red-600">{counts.error}</p>
            </div>
            <div className="bg-[#F2F4F6] rounded-lg p-4 border border-[#E5E8EB]">
              <div className="flex items-center gap-1.5 mb-1">
                <MinusCircle size={13} className="text-[#8B95A1]" />
                <p className="text-[12px] text-[#8B95A1]">미연결</p>
              </div>
              <p className="text-[24px] font-bold text-[#8B95A1]">{counts.disconnected}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-[#191F28]">
              {selectedSystem.name} &mdash; 기업별 연계 현황
            </h3>
            <span className="text-[12px] text-[#8B95A1]">총 {counts.total}개 기업</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F2F4F6]">
                  <th className="text-left text-[#8B95A1] font-medium px-4 py-3 rounded-l-lg w-[48px]">No.</th>
                  <th className="text-left text-[#8B95A1] font-medium px-4 py-3">기업명</th>
                  <th className="text-left text-[#8B95A1] font-medium px-4 py-3">ERP</th>
                  <th className="text-center text-[#8B95A1] font-medium px-4 py-3">연계 상태</th>
                  <th className="text-left text-[#8B95A1] font-medium px-4 py-3 rounded-r-lg">마지막 연계 시각</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F6]">
                {companies.map((company, index) => {
                  const cfg = statusConfig[company.status];
                  const Icon = cfg.Icon;
                  return (
                    <tr key={company.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3.5 text-[#8B95A1]">{index + 1}</td>
                      <td className="px-4 py-3.5 font-medium text-[#191F28]">{company.companyName}</td>
                      <td className="px-4 py-3.5 text-[#4E5968]">{company.erpType}</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Icon size={13} className={cfg.color} />
                          <StatusBadge
                            status={cfg.label}
                            colorClass={`${cfg.bg} ${cfg.color} ${cfg.border} border`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#8B95A1]">{company.lastLinkedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

      </div>
    </PageLayout>
  );
}
