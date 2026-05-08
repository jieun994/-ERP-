import React, { useState } from 'react';
import { X, Copy, AlertCircle, FileText, CheckCircle2, Info, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  timestamp: string;
  classification: 'AUDIT' | 'CLOUD';
  logLevel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  eventCode: string;
  resourceId: string;
  actorIdentity: string;
  originalResult: string | null;
  payload: string;
}

const mockLogs: LogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-05-06 11:20:45.123',
    classification: 'AUDIT',
    logLevel: 'INFO',
    eventCode: 'AUTH_LOGIN_SUCCESS',
    resourceId: 'SYS_AUTH_SERVICE',
    actorIdentity: 'admin01@enterprise.com',
    originalResult: 'authenticated',
    payload: JSON.stringify({
      event: "login",
      userId: "admin01",
      ip: "192.168.0.105",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: "2026-05-06T11:20:45.123Z",
      session_id: "sess_987654321",
      status: "authenticated",
      mfa_verified: true
    }, null, 2)
  },
  {
    id: 'LOG-002',
    timestamp: '2026-05-06 11:22:12.885',
    classification: 'CLOUD',
    logLevel: 'ERROR',
    eventCode: 'MAIL_SEND_TIMEOUT',
    resourceId: 'svc-email-v2:587',
    actorIdentity: 'system-agent-01',
    originalResult: 'timeout_err',
    payload: "Error: SMTP connection timeout at 10.50.2.14:587\nDetail: Unable to establish connection to mail server within 5000ms.\nRetry attempt: 3nd of 3\nFallback: Queueing for later processing."
  },
  {
    id: 'LOG-003',
    timestamp: '2026-05-06 11:25:30.002',
    classification: 'AUDIT',
    logLevel: 'WARN',
    eventCode: 'API_ACCESS_DENIED',
    resourceId: '/api/v1/fund/status/global',
    actorIdentity: 'user_test02',
    originalResult: 'REJECTED_BY_RBAC',
    payload: JSON.stringify({
      path: "/api/fund-status",
      method: "GET",
      requested_by: "user_test02",
      required_permission: "READ_ALL",
      user_permissions: ["READ_OWN"],
      action: "REJECTED"
    }, null, 2)
  }
];

export default function LogManagement() {
  const [data] = useState<LogEntry[]>(mockLogs);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Search States
  const [startDate, setStartDate] = useState('2026-05-06');
  const [endDate, setEndDate] = useState('2026-05-06');
  const [classificationFilter, setClassificationFilter] = useState('ALL');
  const [searchUser, setSearchUser] = useState('');
  const [searchStatus, setSearchStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const openDetail = (log: LogEntry) => {
    setIsLoading(true);
    setSelectedLog(log);
    // Simulate loading for raw log as per instructions
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const closeDetail = () => {
    setSelectedLog(null);
  };

  const handleCopyRawLog = () => {
    if (selectedLog) {
      navigator.clipboard.writeText(selectedLog.payload);
      alert('로그 전문이 클립보드에 복사되었습니다.');
    }
  };

  const handleReset = () => {
    setStartDate('2026-05-06');
    setEndDate('2026-05-06');
    setClassificationFilter('ALL');
    setSearchUser('');
    setSearchStatus('ALL');
    setSearchKeyword('');
  };

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          {/* 기간 */}
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-[#191F28] shrink-0 min-w-[30px]">기간</span>
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px] h-[40px] px-3 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-colors" 
              />
              <span className="text-[#8B95A1]">~</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px] h-[40px] px-3 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-colors" 
              />
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="w-[100px] h-[48px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[15px] font-bold transition-colors shadow-sm">
            조회
          </button>
          <button className="w-[100px] h-[48px] bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] rounded-md text-[15px] font-bold transition-colors shadow-sm">
            초기화
          </button>
        </div>
      </div>


          {/* 로그구분 */}
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-[#191F28] shrink-0 min-w-[60px]">로그구분</span>
            <select 
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-36 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-colors"
            >
              <option value="ALL">전체</option>
              <option value="AUDIT">AUDIT</option>
              <option value="CLOUD">CLOUD</option>
            </select>
          </div>

          {/* 사용자 */}
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-[#191F28] shrink-0 min-w-[45px]">사용자</span>
            <input 
              type="text" 
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="사용자명 입력" 
              className="w-48 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-colors" 
            />
          </div>

          {/* 결과 */}
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-[#191F28] shrink-0 min-w-[30px]">결과</span>
            <select 
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-36 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-colors"
            >
              <option value="ALL">전체</option>
              <option value="SUCCESS">성공</option>
              <option value="FAIL">실패</option>
            </select>
          </div>

          <div className="w-full flex items-center justify-between gap-8 pt-2">
            {/* 키워드 */}
            <div className="flex items-center gap-3 flex-1">
              <span className="text-[14px] font-bold text-[#191F28] shrink-0 min-w-[45px]">키워드</span>
              <input 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="검색어 입력" 
                className="flex-1 h-[40px] px-4 bg-white border border-[#D1D6DB] rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-colors" 
              />
            </div>
      </div>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-[14px]">
          <span className="text-[#191F28]">총 </span>
          <span className="text-[#008d75] font-bold">{data.length.toLocaleString()}</span>
          <span className="text-[#191F28]">건</span>
        </div>
        <div className="flex items-center gap-2">
          
          
          
          
          <button className="h-[36px] border border-[#D1D6DB] px-5 rounded-md text-[14px] font-bold hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors shadow-sm">
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border-t-2 border-[#191F28] rounded-b-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#191F28]">
                <th className="h-[52px] px-6 text-[14px] font-bold text-center w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-bold text-center w-48">발생일시(UTC)</th>
                <th className="h-[52px] px-4 text-[14px] font-bold text-center w-24">로그구분</th>
                <th className="h-[52px] px-4 text-[14px] font-bold text-center w-24">레벨</th>
                <th className="h-[52px] px-4 text-[14px] font-bold">이벤트명(Code)</th>
                <th className="h-[52px] px-4 text-[14px] font-bold">대상(Resource)</th>
                <th className="h-[52px] px-4 text-[14px] font-bold">사용자(Identity)</th>
                <th className="h-[52px] px-4 text-[14px] font-bold text-center w-36">결과(Raw)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="h-[52px] hover:bg-[#F9FAFB] transition-colors group"
                >
                  <td className="px-6 text-[14px] text-center text-[#8B95A1] font-mono">{index + 1}</td>
                  <td className="px-4 text-[14px] text-center text-[#4E5968] font-mono tracking-tight">{item.timestamp}</td>
                  <td className="px-4 text-center">
                    <span className="text-[14px] font-medium text-[#191F28]">
                      {item.classification}
                    </span>
                  </td>
                  <td className="px-4 text-center">
                    <span className={`text-[12px] font-bold ${
                      item.logLevel === 'ERROR' ? 'text-[#F04452]' :
                      item.logLevel === 'WARN' ? 'text-[#FF9F0A]' :
                      item.logLevel === 'INFO' ? 'text-[#008d75]' :
                      'text-[#8B95A1]'
                    }`}>
                      {item.logLevel}
                    </span>
                  </td>
                  <td className="px-4 text-[14px]">
                    <button 
                      onClick={() => openDetail(item)}
                      className="text-[#008d75] font-bold hover:underline transition-colors text-left font-mono text-[13px]"
                    >
                      {item.eventCode}
                    </button>
                  </td>
                  <td className="px-4 text-[13px] text-[#4E5968] font-mono">{item.resourceId}</td>
                  <td className="px-4 text-[13px] text-[#4E5968] font-mono">{item.actorIdentity}</td>
                  <td className="px-4 text-center">
                    <span className={`text-[13px] font-bold font-mono ${item.originalResult === 'authenticated' || item.originalResult === 'success' ? 'text-[#008d75]' : 'text-[#191F28]'}`}>
                      {item.originalResult || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal (Strict Popup Pattern) */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeDetail}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Popup Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8EB] bg-white shrink-0">
                <h3 className="text-[18px] font-bold text-[#191F28]">로그 상세 확인</h3>
                <button 
                  onClick={closeDetail}
                  className="p-1 text-[#8B95A1] hover:text-[#191F28] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Popup Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {isLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center text-[#8B95A1] gap-4">
                    <div className="w-8 h-8 border-3 border-[#E5E8EB] border-t-[#008d75] rounded-full animate-spin" />
                    <p className="text-[14px]">데이터를 불러오고 있습니다...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Basic Info Area */}
                    <div>
                      <h4 className="text-[15px] font-bold text-[#191F28] mb-4 flex items-center gap-2">
                        기본 정보
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-[#E5E8EB]">
                        {[
                          { label: '발생일시', value: selectedLog.timestamp },
                          { label: '로그구분', value: selectedLog.classification },
                          { label: '이벤트명', value: selectedLog.eventCode },
                          { label: '대상', value: selectedLog.resourceId },
                          { label: '사용자', value: selectedLog.actorIdentity },
                          { label: '결과', value: selectedLog.originalResult || '-', isResult: true },
                        ].map((info, i) => (
                          <div key={i} className="flex border-b border-[#E5E8EB] min-h-[44px]">
                            <div className="w-32 bg-[#F2F4F6] px-4 flex items-center shrink-0">
                              <span className="text-[14px] font-semibold text-[#4E5968]">{info.label}</span>
                            </div>
                            <div className="flex-1 px-4 flex items-center">
                              <span className={`text-[14px] break-all ${info.isResult ? 'font-bold text-[#008d75]' : 'text-[#191F28]'}`}>
                                {info.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw Log Area */}
                    <div>
                      <h4 className="text-[15px] font-bold text-[#191F28] mb-4 flex items-center gap-2">
                        원본 전문
                      </h4>
                      <div className="bg-[#1e1e1e] p-4 rounded-md">
                        {selectedLog.payload ? (
                          <pre className="text-[13px] text-[#d4d4d4] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-[#008d75]/30">
                            {selectedLog.payload}
                          </pre>
                        ) : (
                          <div className="h-40 flex flex-col items-center justify-center text-[#4E5968] gap-2">
                             <p className="text-[13px]">원본 로그 데이터가 존재하지 않습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Popup Footer */}
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-[#E5E8EB] bg-[#F9FAFB] shrink-0">
                <button 
                  onClick={handleCopyRawLog}
                  className="px-6 h-[40px] border border-[#D1D6DB] bg-white text-[#333333] rounded-md text-[14px] font-medium hover:bg-[#F2F4F6] transition-colors"
                >
                  복사
                </button>
                <button 
                  onClick={closeDetail}
                  className="px-6 h-[40px] bg-[#008d75] text-white rounded-md text-[14px] font-semibold hover:bg-[#007a65] transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
