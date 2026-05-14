import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, FilterBar, DataTable, Input, Select } from './ui';
import { MOCK_TENANTS } from './tenant/tenants';

/* ------------------------------------------------------------------ */
/*  데이터 모델                                                        */
/* ------------------------------------------------------------------ */

interface FailureRecord {
  id: number;
  occurredAt: string;        // 발생일시
  tenantCode: string;        // 테넌트
  tenantName: string;
  erpVendor: string;         // ERP사
  system: string;            // 시스템 (Biz-서비스 1 / 2 등)
  source: SourceCode;        // 출처 (오류 발신처)
  enterpriseName: string;    // 기업명
  errorCode: string;         // 오류코드
  errorMessage: string;      // 오류 메시지
}

type SourceCode = 'BANK_API' | 'INTERNAL' | 'MIDDLEWARE' | 'EXTERNAL_GW';

/** 출처 메타데이터 — 색상 배지 + 담당팀 라우팅 */
const SOURCE_META: Record<SourceCode, { label: string; badge: string; team: string }> = {
  BANK_API:    { label: '은행 API',     badge: 'bg-red-50 text-red-700 border-red-200',           team: '은행 연계팀' },
  INTERNAL:    { label: '내부 모듈',    badge: 'bg-blue-50 text-blue-700 border-blue-200',        team: '플랫폼 개발팀' },
  MIDDLEWARE:  { label: '미들웨어',     badge: 'bg-purple-50 text-purple-700 border-purple-200',  team: '인프라팀' },
  EXTERNAL_GW: { label: '외부 게이트웨이', badge: 'bg-amber-50 text-amber-700 border-amber-200',     team: '대외 연계팀' },
};

/* ------------------------------------------------------------------ */
/*  목업 데이터                                                        */
/* ------------------------------------------------------------------ */

const ERP_VENDORS = ['더존비즈온', '영림원소프트랩', '이카운트'];
const SYSTEMS = ['Biz-서비스 1', 'Biz-서비스 2'];

const mockData: FailureRecord[] = [
  {
    id: 1,
    occurredAt: '2026-05-12 14:32:01',
    tenantCode: 'TOSS',
    tenantName: '(주)토스페이먼츠',
    erpVendor: '더존비즈온',
    system: 'Biz-서비스 1',
    source: 'BANK_API',
    enterpriseName: '(주)한국전자',
    errorCode: 'E4001',
    errorMessage: '수취인 예금주 성명 불일치',
  },
  {
    id: 2,
    occurredAt: '2026-05-12 11:15:22',
    tenantCode: 'WOOWAHAN',
    tenantName: '우아한형제들',
    erpVendor: '영림원소프트랩',
    system: 'Biz-서비스 2',
    source: 'INTERNAL',
    enterpriseName: '(주)미래산업',
    errorCode: 'E2010',
    errorMessage: '필수 항목 누락 (금액)',
  },
  {
    id: 3,
    occurredAt: '2026-05-11 17:50:44',
    tenantCode: 'INNOVATION',
    tenantName: '(주)혁신테크',
    erpVendor: '이카운트',
    system: 'Biz-서비스 1',
    source: 'MIDDLEWARE',
    enterpriseName: '(주)한강건설',
    errorCode: 'E5002',
    errorMessage: '미들웨어 응답 타임아웃 (5000ms 초과)',
  },
  {
    id: 4,
    occurredAt: '2026-05-11 12:10:05',
    tenantCode: 'TOSS',
    tenantName: '(주)토스페이먼츠',
    erpVendor: '더존비즈온',
    system: 'Biz-서비스 1',
    source: 'BANK_API',
    enterpriseName: '(주)직방',
    errorCode: 'E4005',
    errorMessage: '계좌 상태 오류 (해지)',
  },
  {
    id: 5,
    occurredAt: '2026-05-10 09:22:18',
    tenantCode: 'WOOWAHAN',
    tenantName: '우아한형제들',
    erpVendor: '영림원소프트랩',
    system: 'Biz-서비스 2',
    source: 'EXTERNAL_GW',
    enterpriseName: '(주)야놀자',
    errorCode: 'E9001',
    errorMessage: '대외 게이트웨이 인증 실패',
  },
];

/* ------------------------------------------------------------------ */
/*  컴포넌트                                                           */
/* ------------------------------------------------------------------ */

export default function FirmBankingFailureStatus() {
  const [searchParams, setSearchParams] = useState({
    startDate: '2026-04-13',
    endDate: '2026-05-13',
    tenantCode: 'ALL',
    erpVendor: 'ALL',
    system: 'ALL',
    source: 'ALL',
    enterpriseName: '',
    errorCode: '',
  });

  const [selectedRecord, setSelectedRecord] = useState<FailureRecord | null>(null);
  const [data] = useState<FailureRecord[]>(mockData);

  /* 요약 계산 (그리드 위 1줄 요약) */
  const summary = useMemo(() => {
    const tenants = new Set(data.map(d => d.tenantCode));
    const enterprises = new Set(data.map(d => d.enterpriseName));
    return { total: data.length, tenants: tenants.size, enterprises: enterprises.size };
  }, [data]);

  const handleSearch = () => {
    // 실제 구현 시 API 호출
  };

  const handleReset = () => {
    setSearchParams({
      startDate: '2026-04-13',
      endDate: '2026-05-13',
      tenantCode: 'ALL',
      erpVendor: 'ALL',
      system: 'ALL',
      source: 'ALL',
      enterpriseName: '',
      errorCode: '',
    });
  };

  return (
    <div className="w-full pb-20">
      {/* ────────── 검색 영역 ────────── */}
      <FilterBar cols={3} onSearch={handleSearch} onReset={handleReset}>
        <FilterBar.DateRange
          startDate={searchParams.startDate}
          endDate={searchParams.endDate}
          onChange={(s, e) => setSearchParams({ ...searchParams, startDate: s, endDate: e })}
          colSpan={2}
        />

        <FilterBar.Field label="테넌트">
          <Select
            value={searchParams.tenantCode}
            onChange={e => setSearchParams({ ...searchParams, tenantCode: e.target.value })}
            fullWidth
          >
            <option value="ALL">전체</option>
            {MOCK_TENANTS.map(t => (
              <option key={t.tenantCode} value={t.tenantCode}>{t.tenantName}</option>
            ))}
          </Select>
        </FilterBar.Field>

        <FilterBar.Field label="ERP사">
          <Select
            value={searchParams.erpVendor}
            onChange={e => setSearchParams({ ...searchParams, erpVendor: e.target.value })}
            fullWidth
          >
            <option value="ALL">전체</option>
            {ERP_VENDORS.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </Select>
        </FilterBar.Field>

        <FilterBar.Field label="시스템">
          <Select
            value={searchParams.system}
            onChange={e => setSearchParams({ ...searchParams, system: e.target.value })}
            fullWidth
          >
            <option value="ALL">전체</option>
            {SYSTEMS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </FilterBar.Field>

        <FilterBar.Field label="출처">
          <Select
            value={searchParams.source}
            onChange={e => setSearchParams({ ...searchParams, source: e.target.value })}
            fullWidth
          >
            <option value="ALL">전체</option>
            {(Object.keys(SOURCE_META) as SourceCode[]).map(code => (
              <option key={code} value={code}>{SOURCE_META[code].label}</option>
            ))}
          </Select>
        </FilterBar.Field>

        <FilterBar.Field label="기업명">
          <Input
            type="text"
            placeholder="기업명 입력"
            value={searchParams.enterpriseName}
            onChange={e => setSearchParams({ ...searchParams, enterpriseName: e.target.value })}
            fullWidth
          />
        </FilterBar.Field>

        <FilterBar.Field label="오류코드">
          <Input
            type="text"
            placeholder="오류코드 입력"
            value={searchParams.errorCode}
            onChange={e => setSearchParams({ ...searchParams, errorCode: e.target.value })}
            fullWidth
          />
        </FilterBar.Field>
      </FilterBar>

      {/* ────────── 그리드 컨트롤 ────────── */}
      <DataTable.Controls total={data.length}>
        <span className="text-caption text-text-sub mr-3">
          영향 테넌트 <span className="font-bold text-text-main">{summary.tenants}</span>개 ·
          영향 기업 <span className="font-bold text-text-main">{summary.enterprises}</span>개
        </span>
        <Button variant="ghost" size="sm">엑셀 다운로드</Button>
      </DataTable.Controls>

      {/* ────────── 그리드 ────────── */}
      <div className="bg-white border-t-2 border-text-main rounded-b-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1280px]">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-main">
                <th className="h-[52px] px-4 text-body font-bold text-center w-14">No.</th>
                <th className="h-[52px] px-4 text-body font-bold text-center w-44">발생일시</th>
                <th className="h-[52px] px-4 text-body font-bold w-40">테넌트</th>
                <th className="h-[52px] px-4 text-body font-bold w-32">ERP사</th>
                <th className="h-[52px] px-4 text-body font-bold w-32">시스템</th>
                <th className="h-[52px] px-4 text-body font-bold text-center w-32">출처</th>
                <th className="h-[52px] px-4 text-body font-bold w-40">기업명</th>
                <th className="h-[52px] px-4 text-body font-bold text-center w-24">오류코드</th>
                <th className="h-[52px] px-4 text-body font-bold">오류메시지</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => {
                const src = SOURCE_META[item.source];
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className="h-[52px] hover:bg-bg-gray transition-colors cursor-pointer"
                  >
                    <td className="px-4 text-center text-body-sm text-text-sub font-mono">{index + 1}</td>
                    <td className="px-4 text-center text-body-sm text-text-body font-mono tracking-tight">{item.occurredAt}</td>
                    <td className="px-4 text-body text-text-main font-medium">{item.tenantName}</td>
                    <td className="px-4 text-body-sm text-text-body">{item.erpVendor}</td>
                    <td className="px-4 text-body-sm text-text-body">{item.system}</td>
                    <td className="px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-caption font-semibold border ${src.badge}`}>
                        {src.label}
                      </span>
                    </td>
                    <td className="px-4 text-body text-text-main">{item.enterpriseName}</td>
                    <td className="px-4 text-center text-body-sm font-bold text-text-main font-mono">{item.errorCode}</td>
                    <td className="px-4 text-body-sm text-text-body truncate max-w-[420px]">{item.errorMessage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────── 상세 모달 ────────── */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray bg-white shrink-0">
                <h3 className="text-title-sm font-semibold text-text-main">펌뱅킹 실패 상세</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 text-text-sub hover:text-text-main transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-body-lg font-bold text-text-main mb-4">기본 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 border-t border-border-gray">
                    {[
                      { label: '발생일시', value: selectedRecord.occurredAt, mono: true },
                      { label: '테넌트', value: selectedRecord.tenantName },
                      { label: 'ERP사', value: selectedRecord.erpVendor },
                      { label: '시스템', value: selectedRecord.system },
                      { label: '기업명', value: selectedRecord.enterpriseName },
                      { label: '출처', value: SOURCE_META[selectedRecord.source].label, isSource: true },
                    ].map((info, i) => (
                      <div key={i} className="flex border-b border-border-gray min-h-[44px]">
                        <div className="w-28 bg-bg-muted px-4 flex items-center shrink-0">
                          <span className="text-body-sm font-semibold text-text-body">{info.label}</span>
                        </div>
                        <div className="flex-1 px-4 flex items-center">
                          {info.isSource ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-caption font-semibold border ${SOURCE_META[selectedRecord.source].badge}`}>
                              {info.value}
                            </span>
                          ) : (
                            <span className={`text-body text-text-main ${info.mono ? 'font-mono' : ''}`}>
                              {info.value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-caption text-text-sub mt-3">
                    담당팀: <span className="font-semibold text-text-body">{SOURCE_META[selectedRecord.source].team}</span>
                  </p>
                </div>

                {/* 오류 상세 */}
                <div>
                  <h4 className="text-body-lg font-bold text-text-main mb-4">오류 상세</h4>
                  <div className="bg-red-50/50 border border-red-100 rounded-lg p-5 space-y-3">
                    <div>
                      <p className="text-caption text-text-sub mb-1">오류코드</p>
                      <p className="text-title-sm font-bold text-red-600 font-mono">{selectedRecord.errorCode}</p>
                    </div>
                    <div>
                      <p className="text-caption text-text-sub mb-1">오류메시지</p>
                      <p className="text-body text-red-700 font-medium bg-white p-3 border border-red-100 rounded">
                        {selectedRecord.errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-gray bg-bg-gray shrink-0">
                <Button variant="primary" size="md" onClick={() => setSelectedRecord(null)}>
                  닫기
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
