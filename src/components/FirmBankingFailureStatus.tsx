import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  Download, 
  Calendar, 
  AlertCircle,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FailureRecord {
  id: number;
  occurredAt: string;
  enterpriseName: string;
  enterpriseCode: string;
  serviceName: string;
  transactionNo: string;
  requestNo: string;
  failureStep: string;
  errorCode: string;
  errorMessage: string;
  manager: string;
  finalProcessedAt: string;
}

const mockData: FailureRecord[] = [
  {
    id: 1,
    occurredAt: '2023-10-25 14:32:01',
    enterpriseName: '(주)토스페이먼츠',
    enterpriseCode: 'ENT0001',
    serviceName: '실시간 계좌이체',
    transactionNo: 'TXN202310250001',
    requestNo: 'REQ250001',
    failureStep: '은행 전송 단계',
    errorCode: 'E4001',
    errorMessage: '수취인 예금주 성명 불일치',
    manager: '-',
    finalProcessedAt: '-'
  },
  {
    id: 2,
    occurredAt: '2023-10-25 14:15:22',
    enterpriseName: '우아한형제들',
    enterpriseCode: 'ENT0002',
    serviceName: '대량 급여 이체',
    transactionNo: 'TXN202310250002',
    requestNo: 'REQ250002',
    failureStep: '전문 생성 단계',
    errorCode: 'E2010',
    errorMessage: '필수 항목 누락 (금액)',
    manager: '김철수',
    finalProcessedAt: '2023-10-25 14:40:00'
  },
  {
    id: 3,
    occurredAt: '2023-10-25 13:50:44',
    enterpriseName: '당근마켓',
    enterpriseCode: 'ENT0003',
    serviceName: '가상계좌 발급',
    transactionNo: 'TXN202310250003',
    requestNo: 'REQ250003',
    failureStep: '은행 응답 대기',
    errorCode: 'E5002',
    errorMessage: '네트워크 타임아웃',
    manager: '이영희',
    finalProcessedAt: '2023-10-25 14:10:00'
  },
  {
    id: 4,
    occurredAt: '2023-10-25 12:10:05',
    enterpriseName: '(주)직방',
    enterpriseCode: 'ENT0004',
    serviceName: '펌뱅킹 이체',
    transactionNo: 'TXN202310250004',
    requestNo: 'REQ250004',
    failureStep: '은행 전송 단계',
    errorCode: 'E4005',
    errorMessage: '계좌 상태 오류 (해지)',
    manager: '-',
    finalProcessedAt: '-'
  }
];

export default function FirmBankingFailureStatus() {
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    enterpriseName: '',
    enterpriseCode: '',
    serviceType: '전체',
    transactionNo: '',
    requestNo: '',
    errorCode: '',
    errorMessage: '',
    failureStep: '전체'
  });

  const [selectedRecord, setSelectedRecord] = useState<FailureRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleReset = () => {
    setSearchParams({
      startDate: '',
      endDate: '',
      enterpriseName: '',
      enterpriseCode: '',
      serviceType: '전체',
      transactionNo: '',
      requestNo: '',
      errorCode: '',
      errorMessage: '',
      failureStep: '전체'
    });
  };

  const openDetail = (record: FailureRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(mockData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full h-full flex flex-col pb-20">
      {/* Search Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-6">
          {/* Row 1 */}
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">조회 기간</span>
            <div className="flex items-center gap-2 flex-1">
              <input 
                type="date" 
                className="flex-1 h-[40px] px-3 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
                value={searchParams.startDate}
                onChange={e => setSearchParams({...searchParams, startDate: e.target.value})}
              />
              <span className="text-[#8B95A1]">~</span>
              <input 
                type="date" 
                className="flex-1 h-[40px] px-3 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
                value={searchParams.endDate}
                onChange={e => setSearchParams({...searchParams, endDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">기업명</span>
            <input 
              type="text" 
              placeholder="기업명 입력"
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
              value={searchParams.enterpriseName}
              onChange={e => setSearchParams({...searchParams, enterpriseName: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">기업코드</span>
            <input 
              type="text" 
              placeholder="기업코드 입력"
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
              value={searchParams.enterpriseCode}
              onChange={e => setSearchParams({...searchParams, enterpriseCode: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">서비스 구분</span>
            <select 
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
              value={searchParams.serviceType}
              onChange={e => setSearchParams({...searchParams, serviceType: e.target.value})}
            >
              <option value="전체">전체</option>
              <option value="실시간 계좌이체">실시간 계좌이체</option>
              <option value="대량 급여 이체">대량 급여 이체</option>
              <option value="가상계좌 발급">가상계좌 발급</option>
              <option value="펌뱅킹 이체">펌뱅킹 이체</option>
            </select>
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">거래번호</span>
            <input 
              type="text" 
              placeholder="거래번호 입력"
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
              value={searchParams.transactionNo}
              onChange={e => setSearchParams({...searchParams, transactionNo: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">요청번호</span>
            <input 
              type="text" 
              placeholder="요청번호 입력"
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
              value={searchParams.requestNo}
              onChange={e => setSearchParams({...searchParams, requestNo: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">오류코드</span>
            <input 
              type="text" 
              placeholder="오류코드 입력"
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
              value={searchParams.errorCode}
              onChange={e => setSearchParams({...searchParams, errorCode: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">실패 단계</span>
            <select 
              className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
              value={searchParams.failureStep}
              onChange={e => setSearchParams({...searchParams, failureStep: e.target.value})}
            >
              <option value="전체">전체</option>
              <option value="전문 생성 단계">전문 생성 단계</option>
              <option value="은행 전송 단계">은행 전송 단계</option>
              <option value="은행 응답 대기">은행 응답 대기</option>
              <option value="응답 처리 단계">응답 처리 단계</option>
            </select>
          </div>

          <div className="lg:col-span-4 flex items-center justify-between gap-8 pt-2">
            <div className="flex items-center gap-4 flex-1">
              <span className="text-[14px] font-bold text-gray-800 w-20 shrink-0">오류메시지</span>
              <input 
                type="text" 
                placeholder="오류메시지 입력 (포함어)"
                className="flex-1 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
                value={searchParams.errorMessage}
                onChange={e => setSearchParams({...searchParams, errorMessage: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleReset}
                className="h-[40px] px-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-[14px] font-bold transition-colors shadow-sm"
              >
                초기화
              </button>
              <button 
                onClick={handleSearch}
                className="h-[40px] px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-bold transition-colors shadow-sm flex items-center gap-2"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                조회하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Area */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '총 조회 건수', value: '452', color: 'text-gray-900' },
          { label: '실패 건수', value: '124', color: 'text-[#F44336]' },
          { label: '실패 기업 수', value: '12', color: 'text-gray-900' },
          { label: '오류코드 Top 5', value: 'E4001, E2010...', isTop: true }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-[#E5E8EB] p-4 rounded-lg shadow-sm">
            <p className="text-[12px] text-[#8B95A1] mb-1">{item.label}</p>
            {item.isTop ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#4E5968] font-medium">1. E4001</span>
                  <span className="text-[#8B95A1]">12건</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#4E5968] font-medium">2. E2010</span>
                  <span className="text-[#8B95A1]">8건</span>
                </div>
              </div>
            ) : (
              <p className={`text-[20px] font-bold ${item.color}`}>
                {item.value}
                <span className="text-[12px] font-normal ml-1 text-[#8B95A1]">건</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-[#4E5968]">검색 결과</span>
          <span className="text-[14px] font-bold text-[#008d75]">{mockData.length}</span>
          <span className="text-[14px] text-[#4E5968]">건</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-[32px] px-4 bg-white border border-[#D1D6DB] rounded-md text-[13px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors shadow-sm flex items-center gap-2">
            <Download className="w-3.5 h-3.5" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center border-r border-[#E5E8EB] w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-44">발생일시</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-48">기업명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-24">기업코드</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-40">서비스명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-44">거래번호</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-32">실패 단계</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-24">오류코드</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">오류메시지</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-24">담당자</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-40">최종 처리일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {mockData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`h-[52px] transition-colors hover:bg-[#F9FAFB] ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : 'bg-white'}`}
                  >
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB]">{index + 1}</td>
                  <td 
                    onClick={() => openDetail(item)}
                    className="px-4 text-center text-[13px] text-[#191F28] border-r border-[#E5E8EB] font-mono cursor-pointer hover:text-[#008d75] hover:underline"
                  >
                    {item.occurredAt}
                  </td>
                  <td 
                    onClick={() => openDetail(item)}
                    className="px-4 text-[14px] text-[#191F28] font-medium border-r border-[#E5E8EB] cursor-pointer hover:text-[#008d75] hover:underline"
                  >
                    {item.enterpriseName}
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB] font-mono">{item.enterpriseCode}</td>
                  <td 
                    onClick={() => openDetail(item)}
                    className="px-4 text-[14px] text-[#191F28] border-r border-[#E5E8EB] cursor-pointer hover:text-[#008d75] hover:underline"
                  >
                    {item.serviceName}
                  </td>
                  <td 
                    onClick={() => openDetail(item)}
                    className="px-4 text-[13px] text-[#4E5968] border-r border-[#E5E8EB] font-mono cursor-pointer hover:text-[#008d75] hover:underline"
                  >
                    {item.transactionNo}
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB]">{item.failureStep}</td>
                  <td 
                    onClick={() => openDetail(item)}
                    className="px-4 text-center text-[13px] font-bold text-[#4E5968] border-r border-[#E5E8EB] font-mono cursor-pointer hover:text-[#008d75] hover:underline"
                  >
                    {item.errorCode}
                  </td>
                  <td className="px-4 text-[13px] text-[#4E5968] border-r border-[#E5E8EB] truncate max-w-[200px]">{item.errorMessage}</td>
                  <td className="px-4 text-center text-[13px] text-[#4E5968] border-r border-[#E5E8EB]">{item.manager}</td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] font-mono">{item.finalProcessedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#E5E8EB] bg-white text-[#8B95A1] hover:bg-[#F9FAFB]">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#008d75] bg-[#008d75] text-white font-bold text-[13px]">
          1
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#E5E8EB] bg-white text-[#4E5968] hover:bg-[#F9FAFB] text-[13px]">
          2
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#E5E8EB] bg-white text-[#4E5968] hover:bg-[#F9FAFB] text-[13px]">
          3
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#E5E8EB] bg-white text-[#8B95A1] hover:bg-[#F9FAFB]">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="h-[64px] px-6 bg-[#191F28] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-[18px] font-bold text-white">펌뱅킹 실패 상세 내역</h3>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="space-y-10">
                  {/* Basic Info */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-4 bg-[#008d75] rounded-full"></div>
                      <h4 className="text-[16px] font-bold text-[#191F28]">거래 기본 정보</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <DetailItem label="발생일시" value={selectedRecord.occurredAt} isMono />
                      <DetailItem label="기업명 (코드)" value={`${selectedRecord.enterpriseName} (${selectedRecord.enterpriseCode})`} />
                      <DetailItem label="서비스명" value={selectedRecord.serviceName} />
                      <DetailItem label="실패 단계" value={selectedRecord.failureStep} highlight />
                      <DetailItem label="거래번호" value={selectedRecord.transactionNo} isMono />
                      <DetailItem label="요청번호" value={selectedRecord.requestNo} isMono />
                    </div>
                  </section>

                  {/* Error Info */}
                  <section className="bg-red-50/50 p-6 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                      <h4 className="text-[16px] font-bold text-red-700">오류 상세 정보</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <DetailItem label="오류코드" value={selectedRecord.errorCode} isMono textStyle="text-red-600 font-bold" />
                      <div className="col-span-2">
                        <p className="text-[13px] text-gray-500 mb-1">오류 메시지</p>
                        <p className="text-[14px] text-red-600 font-medium bg-white p-3 border border-red-100 rounded">
                          {selectedRecord.errorMessage}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Message Info (Simulated Payload) */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-4 bg-gray-400 rounded-full"></div>
                      <h4 className="text-[16px] font-bold text-[#191F28]">송수신 전문 정보 (JSON/RAW)</h4>
                    </div>
                    <div className="bg-[#F9FAFB] p-4 rounded border border-[#E5E8EB] font-mono text-[12px] text-[#4E5968] overflow-x-auto whitespace-pre leading-relaxed">
{`{
  "header": {
    "biz_type": "FB",
    "service_code": "TR001",
    "sender_id": "ENT0001",
    "timestamp": "20231025143201442"
  },
  "data": {
    "account_no": "123-456-789012",
    "amount": 150000,
    "transaction_id": "${selectedRecord.transactionNo}",
    "fail_reason": "RECEIVER_NAME_MISMATCH"
  }
}`}
                    </div>
                  </section>

                  {/* Action Info */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                      <h4 className="text-[16px] font-bold text-[#191F28]">조치 및 처리 내역</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 bg-white p-6 rounded-lg border border-[#E5E8EB]">
                      <DetailItem label="담당자" value={selectedRecord.manager} />
                      <DetailItem label="최종 처리일시" value={selectedRecord.finalProcessedAt} isMono />
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer */}
              <div className="h-[72px] px-6 bg-white border-t border-[#E5E8EB] flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="h-[40px] px-6 bg-white border border-[#D1D6DB] text-[#333333] rounded-lg text-[14px] font-medium hover:bg-[#F9FAFB] transition-colors"
                >
                  닫기
                </button>
                <button className="h-[40px] px-6 bg-[#008d75] text-white rounded-lg text-[14px] font-bold hover:bg-[#007a65] transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  전문 다운로드
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, isMono = false, highlight = false, textStyle = "text-[#191F28]" }: { 
  label: string, 
  value: string, 
  isMono?: boolean, 
  highlight?: boolean,
  textStyle?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[13px] text-[#8B95A1] font-medium">{label}</p>
      <p className={`text-[15px] ${textStyle} ${isMono ? 'font-mono tracking-tight' : 'font-medium'} ${highlight ? 'text-[#008d75]' : ''}`}>
        {value}
      </p>
    </div>
  );
}
