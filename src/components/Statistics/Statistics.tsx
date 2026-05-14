import React, { useMemo, useState } from 'react';
import { FilterBar, PageLayout, Input, Select } from '../ui';

import KpiCard from './KpiCard';
import ChannelTop5Card from './ChannelTop5Card';
import TrendChart from './TrendChart';
import RankingTable from './RankingTable';
import EnterpriseDetailPanel from './EnterpriseDetailPanel';

import { VAN_COLOR, ERP_COLOR, OB_COLOR, unitMeta, channelLabel, PAGE_SIZE } from './constants';
import { fmtNum, isoWeekKey, monthKey, deltaPct } from './helpers';
import { ALL_DATA, tenants } from './mockData';
import type { Unit, ChannelFilter, SortKey, SortDir, BucketRow, RankingRow } from './types';

export default function Statistics() {
  // ── 필터 상태
  const [searchParams, setSearchParams] = useState({
    tenant: 'ALL', startDate: '', endDate: '', enterpriseName: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    tenant: 'ALL', startDate: '', endDate: '', enterpriseName: '',
  });
  const [unit, setUnit] = useState<Unit>('day');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [channel, setChannel] = useState<ChannelFilter>('ALL');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // ── 핸들러
  const handleSearch = () => {
    setAppliedFilters({ ...searchParams });
    setCurrentPage(1);
  };
  const handleReset = () => {
    const init = { tenant: 'ALL', startDate: '', endDate: '', enterpriseName: '' };
    setSearchParams(init);
    setAppliedFilters(init);
  };
  const handleExcelDownload = () => alert('엑셀 다운로드를 실행합니다.');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(['name', 'tenantName'].includes(key) ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const handleChannelChange = (c: ChannelFilter) => {
    setChannel(c);
    setCurrentPage(1);
    setSortKey(c === 'ALL' ? 'total' : c);
    setSortDir('desc');
  };

  // ── 데이터 파이프라인
  const filtered = useMemo(() => {
    const { tenant, enterpriseName, startDate, endDate } = appliedFilters;
    return ALL_DATA.filter(d => {
      if (tenant !== 'ALL' && d.tenantId !== tenant) return false;
      if (enterpriseName && !d.enterpriseName.toLowerCase().includes(enterpriseName.toLowerCase())) return false;
      if (startDate && d.date < startDate) return false;
      if (endDate && d.date > endDate) return false;
      return true;
    });
  }, [appliedFilters]);

  const hasExplicitRange = !!(appliedFilters.startDate || appliedFilters.endDate);

  const bucketKey = (date: string): string =>
    unit === 'day' ? date : unit === 'week' ? isoWeekKey(date) : monthKey(date);

  const bucketed = useMemo<BucketRow[]>(() => {
    const map = new Map<string, BucketRow>();
    for (const d of filtered) {
      const key = bucketKey(d.date);
      const cur = map.get(key) ?? { key, van: 0, erp: 0, openBanking: 0, total: 0 };
      cur.van += d.van; cur.erp += d.erp; cur.openBanking += d.openBanking; cur.total += d.total;
      map.set(key, cur);
    }
    const arr = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
    if (hasExplicitRange) return arr;
    return arr.slice(-unitMeta[unit].window);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, unit, hasExplicitRange]);

  const previousBucketed = useMemo<BucketRow[]>(() => {
    const map = new Map<string, BucketRow>();
    const baseForPrev = ALL_DATA.filter(d => {
      const { tenant, enterpriseName } = appliedFilters;
      if (tenant !== 'ALL' && d.tenantId !== tenant) return false;
      if (enterpriseName && !d.enterpriseName.toLowerCase().includes(enterpriseName.toLowerCase())) return false;
      return true;
    });
    for (const d of baseForPrev) {
      const key = bucketKey(d.date);
      const cur = map.get(key) ?? { key, van: 0, erp: 0, openBanking: 0, total: 0 };
      cur.van += d.van; cur.erp += d.erp; cur.openBanking += d.openBanking; cur.total += d.total;
      map.set(key, cur);
    }
    const arr = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
    const windowSize = bucketed.length;
    if (bucketed.length === 0) return [];
    const firstKey = bucketed[0].key;
    const idx = arr.findIndex(b => b.key === firstKey);
    if (idx < 0) return [];
    return arr.slice(Math.max(0, idx - windowSize), idx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, bucketed, unit]);

  const summary = useMemo(() => {
    return bucketed.reduce(
      (a, c) => ({
        van: a.van + c.van,
        erp: a.erp + c.erp,
        ob: a.ob + c.openBanking,
        total: a.total + c.total,
      }),
      { van: 0, erp: 0, ob: 0, total: 0 },
    );
  }, [bucketed]);

  const prevSummary = useMemo(() => {
    return previousBucketed.reduce(
      (a, c) => ({
        van: a.van + c.van,
        erp: a.erp + c.erp,
        ob: a.ob + c.openBanking,
        total: a.total + c.total,
      }),
      { van: 0, erp: 0, ob: 0, total: 0 },
    );
  }, [previousBucketed]);

  const deltas = {
    total: deltaPct(summary.total, prevSummary.total),
    van:   deltaPct(summary.van,   prevSummary.van),
    erp:   deltaPct(summary.erp,   prevSummary.erp),
    ob:    deltaPct(summary.ob,    prevSummary.ob),
  };

  const ranking = useMemo<RankingRow[]>(() => {
    const keys = new Set(bucketed.map(b => b.key));
    const inWindow = filtered.filter(d => keys.has(bucketKey(d.date)));
    const prevKeys = new Set(previousBucketed.map(b => b.key));
    const inPrev = filtered.filter(d => prevKeys.has(bucketKey(d.date)));

    const cur = new Map<string, {
      id: string; name: string; tenantName: string;
      van: number; erp: number; ob: number; total: number;
    }>();
    for (const d of inWindow) {
      const c = cur.get(d.enterpriseId) ?? {
        id: d.enterpriseId, name: d.enterpriseName, tenantName: d.tenantName,
        van: 0, erp: 0, ob: 0, total: 0,
      };
      c.van += d.van; c.erp += d.erp; c.ob += d.openBanking; c.total += d.total;
      cur.set(d.enterpriseId, c);
    }
    const prev = new Map<string, number>();
    for (const d of inPrev) {
      prev.set(d.enterpriseId, (prev.get(d.enterpriseId) ?? 0) + d.total);
    }
    const totalSum = Array.from(cur.values()).reduce((a, c) => a + c.total, 0);
    const maxTotal = Array.from(cur.values()).reduce((a, c) => Math.max(a, c.total), 0);
    return Array.from(cur.values()).map(r => ({
      ...r,
      share: totalSum > 0 ? (r.total / totalSum) * 100 : 0,
      intensity: maxTotal > 0 ? (r.total / maxTotal) * 100 : 0,
      prevTotal: prev.get(r.id) ?? 0,
      delta: deltaPct(r.total, prev.get(r.id) ?? 0),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, bucketed, previousBucketed, unit]);

  const sortedRanking = useMemo<RankingRow[]>(() => {
    const arr = [...ranking];
    arr.sort((a, b) => {
      const av = (a as Record<SortKey, unknown>)[sortKey];
      const bv = (b as Record<SortKey, unknown>)[sortKey];
      let cmp: number;
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv), 'ko');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [ranking, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRanking.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRanking = useMemo(
    () => sortedRanking.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sortedRanking, safePage],
  );

  const selected = useMemo(() => {
    if (!ranking.length) return null;
    return ranking.find(r => r.id === selectedEnterpriseId) ?? ranking[0];
  }, [ranking, selectedEnterpriseId]);

  const top5ByChannel = useMemo(() => {
    const calc = (field: 'van' | 'erp' | 'ob') => {
      const channelTotal = ranking.reduce((a, r) => a + r[field], 0);
      return ranking
        .map(r => ({
          id: r.id, name: r.name,
          value: r[field],
          share: channelTotal > 0 ? (r[field] / channelTotal) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };
    return { van: calc('van'), erp: calc('erp'), ob: calc('ob') };
  }, [ranking]);

  const chartData = useMemo(() => bucketed.map(b => ({
    label: unit === 'day'
      ? b.key.slice(5).replace('-', '/')
      : unit === 'week'
        ? b.key.split('-W')[1] + '주'
        : b.key.slice(5) + '월',
    van: b.van, erp: b.erp, openBanking: b.openBanking, total: b.total,
  })), [bucketed, unit]);

  const periodLabel = useMemo(() => {
    if (bucketed.length === 0) {
      return hasExplicitRange ? '데이터 없음' : unitMeta[unit].periodLabel(unitMeta[unit].window);
    }
    const dot = (s: string) => s.replace(/-/g, '.');
    const first = bucketed[0].key;
    const last = bucketed[bucketed.length - 1].key;
    if (unit === 'day') return first === last ? dot(first) : `${dot(first)} ~ ${dot(last)}`;
    if (unit === 'week') {
      const f = first.split('-W'); const l = last.split('-W');
      return first === last ? `${f[0]} ${f[1]}주차` : `${f[0]} ${f[1]}주차 ~ ${l[0]} ${l[1]}주차`;
    }
    return first === last ? dot(first) : `${dot(first)} ~ ${dot(last)}`;
  }, [bucketed, unit, hasExplicitRange]);

  return (
    <PageLayout bottomPadding={false}>
      <div className="space-y-5">

        {/* ───── 검색 영역 ───── */}
        <FilterBar onSearch={handleSearch} onReset={handleReset}>
          <FilterBar.Field label="테넌트명">
            <Select
              value={searchParams.tenant}
              onChange={(e) => setSearchParams({ ...searchParams, tenant: e.target.value })}
              style={{ width: 192 }}
            >
              <option value="ALL">전체</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}({t.id})</option>
              ))}
            </Select>
          </FilterBar.Field>

          <FilterBar.Field label="기업명">
            <Input
              type="text"
              placeholder="기업명 입력"
              value={searchParams.enterpriseName}
              onChange={(e) => setSearchParams({ ...searchParams, enterpriseName: e.target.value })}
              style={{ width: 224 }}
            />
          </FilterBar.Field>

          <FilterBar.Field label="조회 기간">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              />
              <span className="text-[#8B95A1]">~</span>
              <Input
                type="date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
              />
            </div>
          </FilterBar.Field>

          <FilterBar.Field label="표시 단위">
            <div className="inline-flex border border-[#D1D6DB] rounded-md overflow-hidden">
              {(['day','week','month'] as Unit[]).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={[
                    'px-4 h-[32px] text-[13px] font-medium border-l border-[#D1D6DB] first:border-l-0 transition-colors',
                    unit === u ? 'bg-[#F2F4F6] text-[#191F28] font-semibold' : 'bg-white text-[#4E5968] hover:bg-[#F9FAFB]',
                  ].join(' ')}
                >{unitMeta[u].label}</button>
              ))}
            </div>
          </FilterBar.Field>

          <FilterBar.Field label="통신 유형">
            <div className="inline-flex border border-[#D1D6DB] rounded-md overflow-hidden">
              {(['ALL','van','erp','ob'] as ChannelFilter[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChannelChange(c)}
                  className={[
                    'px-4 h-[32px] text-[13px] font-medium border-l border-[#D1D6DB] first:border-l-0 transition-colors',
                    channel === c ? 'bg-[#F2F4F6] text-[#191F28] font-semibold' : 'bg-white text-[#4E5968] hover:bg-[#F9FAFB]',
                  ].join(' ')}
                >{channelLabel(c)}</button>
              ))}
            </div>
          </FilterBar.Field>
        </FilterBar>

        {/* ───── KPI Cards ───── */}
        <div className={'grid gap-4 ' + (channel === 'ALL'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2')}
        >
          <KpiCard label="전체 통신" value={summary.total} delta={deltas.total} comp={unitMeta[unit].deltaLabel} />
          {(channel === 'ALL' || channel === 'van') && (
            <KpiCard label="VAN 통신" value={summary.van} delta={deltas.van} comp={unitMeta[unit].deltaLabel} />
          )}
          {(channel === 'ALL' || channel === 'erp') && (
            <KpiCard label="ERP 통신" value={summary.erp} delta={deltas.erp} comp={unitMeta[unit].deltaLabel} />
          )}
          {(channel === 'ALL' || channel === 'ob') && (
            <KpiCard label="오픈뱅킹 통신" value={summary.ob} delta={deltas.ob} comp={unitMeta[unit].deltaLabel} />
          )}
        </div>

        {/* ───── 통신량 추이 차트 ───── */}
        <TrendChart
          data={chartData}
          channel={channel}
          unit={unit}
          chartType={chartType}
          setChartType={setChartType}
          periodLabel={periodLabel}
        />

        {/* ───── 채널별 TOP 5 ───── */}
        <div className={'grid gap-4 ' + (channel === 'ALL' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1')}>
          {(channel === 'ALL' || channel === 'van') && (
            <ChannelTop5Card title="VAN 통신 TOP 5" color={VAN_COLOR} rows={top5ByChannel.van} />
          )}
          {(channel === 'ALL' || channel === 'erp') && (
            <ChannelTop5Card title="ERP 통신 TOP 5" color={ERP_COLOR} rows={top5ByChannel.erp} />
          )}
          {(channel === 'ALL' || channel === 'ob') && (
            <ChannelTop5Card title="오픈뱅킹 통신 TOP 5" color={OB_COLOR} rows={top5ByChannel.ob} />
          )}
        </div>

        {/* ───── 기업별 통신량 + 상세 ───── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-5">
          <RankingTable
            channel={channel}
            unit={unit}
            periodLabel={periodLabel}
            sortedRanking={sortedRanking}
            pagedRanking={pagedRanking}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedEnterpriseId}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            page={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={PAGE_SIZE}
            onExcelDownload={handleExcelDownload}
          />
          <EnterpriseDetailPanel
            selected={selected}
            channel={channel}
            unit={unit}
            periodLabel={periodLabel}
          />
        </div>

      </div>
    </PageLayout>
  );
}
