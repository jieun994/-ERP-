import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { VAN_COLOR, ERP_COLOR, OB_COLOR, unitMeta } from './constants';
import { fmtRecharts } from './helpers';
import type { ChartRow, ChannelFilter, Unit } from './types';

const showSeries = (channel: ChannelFilter, key: 'van' | 'erp' | 'ob') =>
  channel === 'ALL' || channel === key;

function renderBarChart(data: ChartRow[], channel: ChannelFilter) {
  return (
    <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8EB" />
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8B95A1' }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#8B95A1' }} tickLine={false} axisLine={false} tickFormatter={fmtRecharts} />
      <Tooltip formatter={fmtRecharts} contentStyle={{ borderRadius: 6, fontSize: 12 }} />
      <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
      {showSeries(channel, 'van') && (
        <Bar dataKey="van" name="VAN 통신" stackId="a" fill={VAN_COLOR} />
      )}
      {showSeries(channel, 'erp') && (
        <Bar dataKey="erp" name="ERP 통신" stackId="a" fill={ERP_COLOR} />
      )}
      {showSeries(channel, 'ob') && (
        <Bar dataKey="openBanking" name="오픈뱅킹 통신" stackId="a" fill={OB_COLOR} radius={[4, 4, 0, 0]} />
      )}
    </BarChart>
  );
}

function renderLineChart(data: ChartRow[], channel: ChannelFilter) {
  return (
    <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8EB" />
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8B95A1' }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#8B95A1' }} tickLine={false} axisLine={false} tickFormatter={fmtRecharts} />
      <Tooltip formatter={fmtRecharts} contentStyle={{ borderRadius: 6, fontSize: 12 }} />
      <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
      {showSeries(channel, 'van') && (
        <Line type="monotone" dataKey="van" name="VAN 통신" stroke={VAN_COLOR} strokeWidth={2} dot={{ r: 3 }} />
      )}
      {showSeries(channel, 'erp') && (
        <Line type="monotone" dataKey="erp" name="ERP 통신" stroke={ERP_COLOR} strokeWidth={2} dot={{ r: 3 }} />
      )}
      {showSeries(channel, 'ob') && (
        <Line type="monotone" dataKey="openBanking" name="오픈뱅킹 통신" stroke={OB_COLOR} strokeWidth={2} dot={{ r: 3 }} />
      )}
    </LineChart>
  );
}

interface TrendChartProps {
  data: ChartRow[];
  channel: ChannelFilter;
  unit: Unit;
  chartType: 'bar' | 'line';
  setChartType: (t: 'bar' | 'line') => void;
  periodLabel: string;
}

export default function TrendChart({
  data, channel, unit, chartType, setChartType, periodLabel,
}: TrendChartProps) {
  return (
    <div className="bg-white border border-[#E5E8EB] rounded-lg shadow-sm">
      <div className="flex items-center px-5 pt-5 pb-3">
        <div>
          <p className="text-[15px] font-bold text-[#191F28]">통신량 추이</p>
          <p className="text-[13px] text-[#8B95A1] mt-0.5">{periodLabel} · {unitMeta[unit].label}</p>
        </div>
        <div className="ml-auto inline-flex border border-[#E5E8EB] rounded-md overflow-hidden">
          {(['bar', 'line'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setChartType(t)}
              className={[
                'px-3 py-1.5 text-[12px] font-medium border-l border-[#E5E8EB] first:border-l-0 transition-colors',
                chartType === t
                  ? 'bg-[#F2F4F6] text-[#191F28] font-semibold'
                  : 'bg-white text-[#4E5968] hover:bg-[#F9FAFB]',
              ].join(' ')}
            >
              {t === 'bar' ? '바' : '라인'}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'bar' ? renderBarChart(data, channel) : renderLineChart(data, channel)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
