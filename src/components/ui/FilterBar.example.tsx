/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * FilterBar 사용 예시 — 참고용 코드 (앱에서 import 되지 않음)
 *
 * 두 가지 케이스:
 *   (A) 두 번째 이미지(결제상태/입금은행/실행일 + 당일/7일/15일/30일)
 *   (B) 첫 번째 이미지(거래/오류 조회 — 필드 7개)
 */

import React, { useState } from 'react';
import { FilterBar, Input, Select } from './index';

/* ------------------------------------------------------------------ */
/*  (A) 결제 / 실행 조회 화면                                            */
/* ------------------------------------------------------------------ */

export function PaymentSearchExample() {
  const [status, setStatus] = useState('ALL');
  const [bank, setBank] = useState('ALL');
  const [account, setAccount] = useState('');
  const [keyword, setKeyword] = useState('');
  const [start, setStart] = useState('2026-03-31');
  const [end, setEnd] = useState('2026-03-31');

  return (
    <FilterBar
      cols={3}
      onSearch={() => console.log('search')}
      onReset={() => {
        setStatus('ALL');
        setBank('ALL');
        setAccount('');
        setKeyword('');
      }}
    >
      <FilterBar.Field label="결제상태">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
          <option value="ALL">전체</option>
          <option value="DONE">완료</option>
          <option value="FAIL">실패</option>
        </Select>
      </FilterBar.Field>

      <FilterBar.Field label="입금은행">
        <Select value={bank} onChange={(e) => setBank(e.target.value)} fullWidth>
          <option value="ALL">전체</option>
          <option value="KB">국민은행</option>
          <option value="SHIN">신한은행</option>
        </Select>
      </FilterBar.Field>

      <FilterBar.Field label="계좌번호" hint="'-' 제외, 숫자 10~14자 입력">
        <Input
          placeholder="계좌번호 입력('-' 제외, 숫자 10-14자 입력)"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          fullWidth
        />
      </FilterBar.Field>

      <FilterBar.Field label="검색" hint="공급업체명, 적요, 실행ID로 검색됩니다">
        <Input
          placeholder="공급업체명, 적요, 실행ID 입력"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          fullWidth
        />
      </FilterBar.Field>

      <FilterBar.DateRange
        label="실행일"
        startDate={start}
        endDate={end}
        onChange={(s, e) => {
          setStart(s);
          setEnd(e);
        }}
        colSpan={2}
      />
    </FilterBar>
  );
}

/* ------------------------------------------------------------------ */
/*  (B) 거래/오류 조회 화면 (현 FirmBankingFailureStatus 후보 교체본)     */
/* ------------------------------------------------------------------ */

export function FailureSearchExample() {
  const [params, setParams] = useState({
    startDate: '',
    endDate: '',
    enterpriseName: '',
    serviceType: 'ALL',
    transactionNo: '',
    errorCode: '',
    failureStep: 'ALL',
    errorMessage: '',
  });
  const set = (k: keyof typeof params) => (v: string) =>
    setParams((p) => ({ ...p, [k]: v }));

  return (
    <FilterBar cols={3} onSearch={() => {}} onReset={() => {}}>
      {/* 1행: 조회 기간(2칸 span) + 서비스명 */}
      <FilterBar.DateRange
        label="조회 기간"
        startDate={params.startDate}
        endDate={params.endDate}
        onChange={(s, e) => setParams((p) => ({ ...p, startDate: s, endDate: e }))}
        colSpan={2}
      />
      <FilterBar.Field label="서비스명">
        <Select
          value={params.serviceType}
          onChange={(e) => set('serviceType')(e.target.value)}
          fullWidth
        >
          <option value="ALL">전체</option>
          <option value="실시간 계좌이체">실시간 계좌이체</option>
        </Select>
      </FilterBar.Field>

      {/* 2행 */}
      <FilterBar.Field label="기업명">
        <Input
          placeholder="기업명 입력"
          value={params.enterpriseName}
          onChange={(e) => set('enterpriseName')(e.target.value)}
          fullWidth
        />
      </FilterBar.Field>
      <FilterBar.Field label="거래번호">
        <Input
          placeholder="거래번호 입력"
          value={params.transactionNo}
          onChange={(e) => set('transactionNo')(e.target.value)}
          fullWidth
        />
      </FilterBar.Field>
      <FilterBar.Field label="실패 단계">
        <Select
          value={params.failureStep}
          onChange={(e) => set('failureStep')(e.target.value)}
          fullWidth
        >
          <option value="ALL">전체</option>
        </Select>
      </FilterBar.Field>

      {/* 3행 */}
      <FilterBar.Field label="오류코드">
        <Input
          placeholder="오류코드 입력"
          value={params.errorCode}
          onChange={(e) => set('errorCode')(e.target.value)}
          fullWidth
        />
      </FilterBar.Field>
      <FilterBar.Field label="오류메시지" hint="입력어 포함 검색" colSpan={2}>
        <Input
          placeholder="오류메시지 입력 (포함어)"
          value={params.errorMessage}
          onChange={(e) => set('errorMessage')(e.target.value)}
          fullWidth
        />
      </FilterBar.Field>
    </FilterBar>
  );
}
