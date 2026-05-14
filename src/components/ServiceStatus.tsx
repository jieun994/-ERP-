import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  RefreshCw,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { Button, FilterBar, PageLayout, SectionCard, Select, Input } from './ui';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
type LinkStatus = 'normal' | 'error' | 'disconnected';
type StatusFilter = 'all' | LinkStatus;

interface SystemInfo {
  id: string;
  name: string;
  desc: string;
}

interface ConnectionCell {
  status: LinkStatus;
  lastLinkedAt: string;
  responseMs?: number;
}

interface Company {
  id: string;
  companyName: string;
  erpType: string;
  conn: Record<string, ConnectionCell>;
}

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const SYSTEMS: SystemInfo[] = [
  { id: 'biz1',    name: 'Biz-서비스 1',       desc: '핵심 업무 처리' },
  { id: 'biz2',    name: 'Biz-서비스 2',       desc: '부가 업무 처리' },
  { id: 'erpInt1', name: 'ERP 인테그레이션 1', desc: '내부 시스템 연동' },
  { id: 'erpInt2', name: 'ERP 인테그레이션 2', desc: '외부 시스템 연동' },
];

const COMPANIES: Company[] = [
  { id: '1', companyName: '(주)이트라이브', erpType: 'SAP ERP',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:30:00', responseMs: 142 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:50', responseMs: 138 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:11', responseMs: 156 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:32', responseMs: 121 },
    } },
  { id: '2', companyName: '(주)한국전자', erpType: '더존 iCUBE',
    conn: {
      biz1:    { status: 'error',        lastLinkedAt: '2026-05-13 13:10:22', responseMs: 2100 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:30:00', responseMs: 144 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:11', responseMs: 162 },
      erpInt2: { status: 'disconnected', lastLinkedAt: '2026-05-10 09:00:00' },
    } },
  { id: '3', companyName: '(주)대한물산', erpType: '영림원 K-System',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:05', responseMs: 152 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:27:50', responseMs: 149 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:01', responseMs: 168 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:44', responseMs: 174 },
    } },
  { id: '4', companyName: '(주)서울유통', erpType: 'SAP ERP',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:50', responseMs: 139 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:20', responseMs: 142 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:00', responseMs: 157 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:33', responseMs: 161 },
    } },
  { id: '5', companyName: '(주)미래산업', erpType: '더존 WEHAGO',
    conn: {
      biz1:    { status: 'disconnected', lastLinkedAt: '2026-05-09 18:00:00' },
      biz2:    { status: 'disconnected', lastLinkedAt: '2026-05-09 18:00:00' },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:25:10', responseMs: 188 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:24:33', responseMs: 192 },
    } },
  { id: '6', companyName: '(주)태양에너지', erpType: '더존 iCUBE',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:30:00', responseMs: 143 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:55', responseMs: 140 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:10', responseMs: 158 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:44', responseMs: 165 },
    } },
  { id: '7', companyName: '(주)글로벌무역', erpType: 'Oracle ERP',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:25:33', responseMs: 198 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:24:11', responseMs: 201 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:23:55', responseMs: 178 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:22:30', responseMs: 184 },
    } },
  { id: '8', companyName: '(주)한강건설', erpType: '영림원 K-System',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:10', responseMs: 155 },
      biz2:    { status: 'error',        lastLinkedAt: '2026-05-13 12:45:10', responseMs: 2400 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:27:20', responseMs: 167 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:25:55', responseMs: 172 },
    } },
  { id: '9', companyName: '(주)중앙식품', erpType: 'SAP ERP',
    conn: {
      biz1:    { status: 'disconnected', lastLinkedAt: '2026-05-08 09:00:00' },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:25:00', responseMs: 161 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:24:33', responseMs: 154 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:23:10', responseMs: 167 },
    } },
  { id: '10', companyName: '(주)동방화학', erpType: 'SAP ERP',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:30:00', responseMs: 138 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:33', responseMs: 144 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:29:11', responseMs: 162 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:50', responseMs: 158 },
    } },
  { id: '11', companyName: '(주)벽산전자', erpType: '영림원 K-System',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:28:00', responseMs: 167 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:27:11', responseMs: 172 },
      erpInt1: { status: 'error',        lastLinkedAt: '2026-05-13 11:00:00', responseMs: 1850 },
      erpInt2: { status: 'normal',       lastLinkedAt: '2026-05-13 14:26:33', responseMs: 168 },
    } },
  { id: '12', companyName: '(주)광명소재', erpType: 'SAP ERP',
    conn: {
      biz1:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:27:30', responseMs: 153 },
      biz2:    { status: 'normal',       lastLinkedAt: '2026-05-13 14:26:11', responseMs: 161 },
      erpInt1: { status: 'normal',       lastLinkedAt: '2026-05-13 14:25:55', responseMs: 176 },
      erpInt2: { status: 'disconnected', lastLinkedAt: '2026-05-08 17:30:00' },
    } },
];

// ────────────────────────────────────────────────
// Status config (light theme palette)
// ────────────────────────────────────────────────
const STATUS_CFG: Record<LinkStatus, {
  label: string;
  rank: number;
  textCls: string;
  bgCls: string;
  borderCls: string;
  dotCls: string;
  Icon: React.ElementType;
}> = {
  normal:       { label: '정상',   rank: 1, textCls: 'text-primary', bgCls: 'bg-primary/10', borderCls: 'border-primary/30', dotCls: 'bg-primary', Icon: CheckCircle2 },
  error:        { label: '오류',   rank: 3, textCls: 'text-red-600',   bgCls: 'bg-red-50',      borderCls: 'border-red-200',     dotCls: 'bg-red-500',   Icon: AlertCircle },
  disconnected: { label: '미연결', rank: 2, textCls: 'text-text-sub', bgCls: 'bg-bg-muted',  borderCls: 'border-border-gray',   dotCls: 'bg-text-sub', Icon: MinusCircle },
};

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
function aggregateSystem(sysId: string) {
  const counts: Record<LinkStatus, number> = { normal: 0, error: 0, disconnected: 0 };
  let totalMs = 0;
  let msCount = 0;
  for (const c of COMPANIES) {
    const cell = c.conn[sysId];
    if (!cell) continue;
    counts[cell.status] += 1;
    if (cell.responseMs != null) {
      totalMs += cell.responseMs;
      msCount += 1;
    }
  }
  let overall: LinkStatus = 'normal';
  if (counts.error > 0) overall = 'error';
  else if (counts.disconnected > 0) overall = 'disconnected';
  const avgMs = msCount > 0 ? Math.round(totalMs / msCount) : null;
  return { counts, overall, avgMs };
}

function getCompanyOverall(c: Company): LinkStatus {
  const cells = SYSTEMS.map(s => c.conn[s.id]?.status).filter(Boolean) as LinkStatus[];
  if (cells.includes('error')) return 'error';
  if (cells.includes('disconnected')) return 'disconnected';
  return 'normal';
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
export default function ServiceStatus() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<'overall' | string>('overall');
  const [search, setSearch] = useState('');
  const [erpFilter, setErpFilter] = useState<string>('ALL');
  const [drawer, setDrawer] = useState<{
    company: Company; system: SystemInfo; cell: ConnectionCell;
  } | null>(null);

  const lastRefreshed = '2026-05-13 14:30:00';

  const erpOptions = useMemo(
    () => Array.from(new Set(COMPANIES.map(c => c.erpType))).sort((a, b) => a.localeCompare(b, 'ko')),
    []
  );

  const totals = useMemo(() => {
    let normal = 0, error = 0, disconnected = 0;
    for (const c of COMPANIES) {
      for (const s of SYSTEMS) {
        const st = c.conn[s.id]?.status;
        if (st === 'normal') normal += 1;
        else if (st === 'error') error += 1;
        else if (st === 'disconnected') disconnected += 1;
      }
    }
    return {
      companies: COMPANIES.length,
      systems: SYSTEMS.length,
      normal, error, disconnected,
    };
  }, []);

  const sysAggs = useMemo(
    () => Object.fromEntries(SYSTEMS.map(s => [s.id, aggregateSystem(s.id)])),
    []
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = COMPANIES.filter(c => {
      if (q && !c.companyName.toLowerCase().includes(q)) {
        return false;
      }
      if (erpFilter !== 'ALL' && c.erpType !== erpFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        const has = SYSTEMS.some(s => c.conn[s.id]?.status === statusFilter);
        if (!has) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      const aSt: LinkStatus = sortKey === 'overall' ? getCompanyOverall(a) : (a.conn[sortKey]?.status ?? 'normal');
      const bSt: LinkStatus = sortKey === 'overall' ? getCompanyOverall(b) : (b.conn[sortKey]?.status ?? 'normal');
      const diff = STATUS_CFG[bSt].rank - STATUS_CFG[aSt].rank;
      if (diff !== 0) return diff;
      return a.companyName.localeCompare(b.companyName, 'ko');
    });
    return list;
  }, [search, erpFilter, statusFilter, sortKey]);

  const handleKpiClick = (status: LinkStatus) => {
    setStatusFilter(prev => (prev === status ? 'all' : status));
  };
  const handleReset = () => {
    setSearch('');
    setErpFilter('ALL');
    setStatusFilter('all');
    setSortKey('overall');
  };

  return (
    <PageLayout bottomPadding={false}>
      <div className="space-y-6">
        {/* ── Header + KPI ── */}
        <SectionCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title-lg font-bold text-text-main">시스템 모니터링</h2>
              <p className="text-body-sm text-text-sub mt-1">
                마지막 갱신: {lastRefreshed}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <RefreshCw size={14} />새로고침
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bg-gray rounded-lg p-4 border border-border-gray">
              <p className="text-caption text-text-sub mb-1">전체 기업</p>
              <p className="text-display font-bold text-text-main">{totals.companies}</p>
              <p className="text-caption text-text-sub mt-1">전체 시스템 {totals.systems}개</p>
            </div>

            <KpiCard
              tone="normal"
              label="정상"
              value={totals.normal}
              hint="전체 연결 중"
              active={statusFilter === 'normal'}
              onClick={() => handleKpiClick('normal')}
            />
            <KpiCard
              tone="error"
              label="오류"
              value={totals.error}
              hint="즉시 조치 필요"
              active={statusFilter === 'error'}
              onClick={() => handleKpiClick('error')}
            />
            <KpiCard
              tone="disconnected"
              label="미연결"
              value={totals.disconnected}
              hint="연결 끊김"
              active={statusFilter === 'disconnected'}
              onClick={() => handleKpiClick('disconnected')}
            />
          </div>
        </SectionCard>

        {/* ── Matrix Section ── */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body-lg font-semibold text-text-main">
              기업별 시스템 연결 상태
            </h3>
            <span className="text-caption text-text-sub">
              출력 기업 수&nbsp;
              <b className="text-text-main">{rows.length}</b>
              &nbsp;/ {totals.companies}
            </span>
          </div>

          {/* Search Area — 프로젝트 표준 FilterBar */}
          <FilterBar
            cols={2}
            onSearch={() => { /* 데이터 새로고침 (실 연동 시 fetch) */ }}
            onReset={handleReset}
          >
            <FilterBar.Field label="기업명">
              <Input
                type="text"
                placeholder="기업명 입력"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </FilterBar.Field>
            <FilterBar.Field label="ERP">
              <Select
                value={erpFilter}
                onChange={(e) => setErpFilter(e.target.value)}
                fullWidth
              >
                <option value="ALL">전체</option>
                {erpOptions.map(erp => (
                  <option key={erp} value={erp}>{erp}</option>
                ))}
              </Select>
            </FilterBar.Field>
          </FilterBar>

          {/* Legend */}
          <div className="flex items-center gap-4 px-1 mb-2 text-caption text-text-sub">
            <Legend tone="normal" label="정상" />
            <Legend tone="error" label="오류" />
            <Legend tone="disconnected" label="미연결" />
            <span className="ml-auto text-caption text-text-sub">
              컬럼 헤더 클릭 시 해당 시스템 기준으로 정렬됩니다
            </span>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-lg border border-border-gray">
            <table className="w-full text-body-sm border-collapse">
              <thead>
                <tr className="bg-bg-muted">
                  <th className="text-left text-text-body font-semibold px-4 py-3 border-b border-border-gray w-[240px]">
                    기업
                  </th>
                  {SYSTEMS.map(sys => {
                    const agg = sysAggs[sys.id];
                    const cfg = STATUS_CFG[agg.overall];
                    const sorted = sortKey === sys.id;
                    return (
                      <th
                        key={sys.id}
                        onClick={() => setSortKey(sys.id)}
                        className={[
                          'text-center px-3 py-3 border-b border-l border-border-gray cursor-pointer transition-colors align-top',
                          sorted ? 'bg-bg-success-soft' : 'hover:bg-bg-neutral',
                        ].join(' ')}
                        title="클릭하여 이 시스템 기준 정렬"
                      >
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                          <span className="text-body-sm font-semibold text-text-main">{sys.name}</span>
                          <span className={`inline-block w-2 h-2 rounded-full ${cfg.dotCls}`} />
                        </div>
                        <div className="flex justify-center gap-2 text-caption mb-1">
                          <span className="text-primary">정상 <b>{agg.counts.normal}</b></span>
                          <span className="text-red-600">오류 <b>{agg.counts.error}</b></span>
                          <span className="text-text-sub">미연결 <b>{agg.counts.disconnected}</b></span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-caption text-text-sub">
                          {agg.avgMs != null && <span>평균 <b className="text-text-body">{agg.avgMs}ms</b></span>}
                          <ArrowUpDown size={10} className={sorted ? 'text-primary' : 'text-text-muted'} />
                        </div>
                      </th>
                    );
                  })}
                  <th
                    onClick={() => setSortKey('overall')}
                    className={[
                      'text-center px-3 py-3 border-b border-l border-border-gray cursor-pointer transition-colors w-[120px] align-top',
                      sortKey === 'overall' ? 'bg-bg-success-soft' : 'hover:bg-bg-neutral',
                    ].join(' ')}
                    title="클릭하여 종합 상태 기준 정렬"
                  >
                    <div className="text-body-sm font-semibold text-text-main mb-1">종합 상태</div>
                    <div className="flex items-center justify-center gap-1 text-caption text-text-sub">
                      <ArrowUpDown size={10} className={sortKey === 'overall' ? 'text-primary' : 'text-text-muted'} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={SYSTEMS.length + 2} className="text-center py-10 text-text-sub text-body-sm">
                      조건에 맞는 기업이 없습니다.
                    </td>
                  </tr>
                ) : rows.map((c, idx) => {
                  const overall = getCompanyOverall(c);
                  const oCfg = STATUS_CFG[overall];
                  return (
                    <tr
                      key={c.id}
                      className={[
                        'hover:bg-bg-gray transition-colors',
                        idx !== rows.length - 1 ? 'border-b border-bg-muted' : '',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3.5">
                        <div className="text-body font-medium text-text-main">{c.companyName}</div>
                        <div className="text-caption text-text-sub mt-0.5">{c.erpType}</div>
                      </td>
                      {SYSTEMS.map(sys => {
                        const cell = c.conn[sys.id];
                        if (!cell) {
                          return (
                            <td key={sys.id} className="px-3 py-3.5 text-center border-l border-bg-muted">
                              <span className="text-text-muted text-caption">-</span>
                            </td>
                          );
                        }
                        const cfg = STATUS_CFG[cell.status];
                        return (
                          <td key={sys.id} className="px-3 py-3.5 text-center border-l border-bg-muted">
                            <button
                              type="button"
                              onClick={() => setDrawer({ company: c, system: sys, cell })}
                              className={[
                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-caption font-semibold transition-all',
                                cfg.textCls, cfg.bgCls, cfg.borderCls,
                                'hover:ring-2 hover:ring-offset-1 cursor-pointer',
                              ].join(' ')}
                            >
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
                              {cfg.label}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3.5 text-center border-l border-bg-muted">
                        <span className={[
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-caption font-semibold',
                          oCfg.textCls, oCfg.bgCls, oCfg.borderCls,
                        ].join(' ')}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${oCfg.dotCls}`} />
                          {oCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* ── Detail Modal ── */}
      <DetailModal drawer={drawer} onClose={() => setDrawer(null)} />
    </PageLayout>
  );
}

// ────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────
interface KpiCardProps {
  tone: LinkStatus;
  label: string;
  value: number;
  hint: string;
  active: boolean;
  onClick: () => void;
}
function KpiCard({ tone, label, value, hint, active, onClick }: KpiCardProps) {
  const cfg = STATUS_CFG[tone];
  const Icon = cfg.Icon;
  const ringCls =
    active && tone === 'normal'       ? 'ring-[#008d75]' :
    active && tone === 'error'        ? 'ring-red-400'   :
    active && tone === 'disconnected' ? 'ring-[#8B95A1]' : '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'text-left rounded-lg p-4 border transition-all',
        cfg.bgCls, cfg.borderCls,
        'hover:shadow-sm hover:-translate-y-0.5',
        active ? 'ring-2 ring-offset-1 shadow-sm' : '',
        ringCls,
      ].filter(Boolean).join(' ')}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className={cfg.textCls} />
          <p className={`text-caption ${cfg.textCls}`}>{label}</p>
        </div>
        {active && (
          <span className={`text-caption font-semibold ${cfg.textCls}`}>✓ 필터 적용</span>
        )}
      </div>
      <p className={`text-display font-bold ${cfg.textCls}`}>{value}</p>
      <p className="text-caption text-text-sub mt-1">
        {active ? '같은 카드 재클릭 시 해제' : hint}
      </p>
    </button>
  );
}

function Legend({ tone, label }: { tone: LinkStatus; label: string }) {
  const cfg = STATUS_CFG[tone];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full ${cfg.dotCls}`} />
      <span className="text-text-body">{label}</span>
    </span>
  );
}

// ────────────────────────────────────────────────
// Detail Modal (centered popup)
// ────────────────────────────────────────────────
interface DetailModalProps {
  drawer: { company: Company; system: SystemInfo; cell: ConnectionCell } | null;
  onClose: () => void;
}
function DetailModal({ drawer, onClose }: DetailModalProps) {
  return (
    <AnimatePresence>
      {drawer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <ModalBody drawer={drawer} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ModalBodyProps {
  drawer: { company: Company; system: SystemInfo; cell: ConnectionCell };
  onClose: () => void;
}
function ModalBody({ drawer, onClose }: ModalBodyProps) {
  const { company, system, cell } = drawer;
  const cfg = STATUS_CFG[cell.status];
  const Icon = cfg.Icon;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
        <div className="min-w-0">
          <div className="text-title-sm font-semibold text-text-main truncate">
            {company.companyName}
          </div>
          <div className="text-caption text-text-sub mt-0.5 truncate">
            {system.name} · {company.erpType}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-sub hover:text-text-main transition-colors p-1 shrink-0 ml-3"
          aria-label="닫기"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bgCls} ${cfg.borderCls} mb-4`}>
          <Icon size={16} className={cfg.textCls} />
          <span className={`text-body-sm font-semibold ${cfg.textCls}`}>현재 상태: {cfg.label}</span>
        </div>

        <ModalRow k="마지막 연계 시각" v={cell.lastLinkedAt} />
        <ModalRow k="응답 시간"        v={cell.responseMs != null ? `${cell.responseMs} ms` : '-'} />
        <ModalRow k="시스템 ID"        v={system.id} />
        <ModalRow
          k="최근 1시간 성공률"
          v={cell.status === 'normal' ? '99.8 %' : cell.status === 'error' ? '82.1 %' : '-'}
        />

        <h3 className="text-body-sm font-semibold text-text-main mt-6 mb-2">최근 로그</h3>
        <div className="bg-bg-gray border border-border-gray rounded-lg p-3 font-mono text-caption leading-6 text-text-body max-h-[200px] overflow-y-auto custom-scrollbar">
          {cell.status === 'normal' ? (
            <>
              <div><span className="text-primary">[14:30:18]</span> 200 OK · 138ms · /api/{system.id}/sync</div>
              <div><span className="text-primary">[14:29:48]</span> 200 OK · 124ms · /api/{system.id}/sync</div>
              <div><span className="text-primary">[14:29:18]</span> 200 OK · 142ms · /api/{system.id}/sync</div>
            </>
          ) : cell.status === 'error' ? (
            <>
              <div><span className="text-red-600">[14:28:42]</span> 503 Service Unavailable · timeout · /api/{system.id}/sync</div>
              <div><span className="text-red-600">[14:27:42]</span> 500 Internal Error · /api/{system.id}/sync</div>
              <div><span className="text-primary">[14:25:18]</span> 200 OK · 142ms · /api/{system.id}/sync</div>
            </>
          ) : (
            <>
              <div><span className="text-text-sub">[--]</span> 연결이 끊어진 상태입니다.</div>
              <div><span className="text-text-sub">마지막 연결: {cell.lastLinkedAt}</span></div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border-gray flex justify-end gap-2 shrink-0 bg-white">
        <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        <Button variant="primary" size="sm">로그 전체 보기</Button>
      </div>
    </>
  );
}

function ModalRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dashed border-border-gray">
      <span className="text-caption text-text-sub">{k}</span>
      <span className="text-body-sm text-text-main font-medium">{v}</span>
    </div>
  );
}
