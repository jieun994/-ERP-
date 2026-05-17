import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, ConfirmModal } from './ui';

interface WebPushSubscription {
  setAt: string;
  device: string;
}

interface EnterpriseUser {
  id: number;
  tenant: string;
  tenantCode: string;
  enterprise: string;
  userName: string;
  userId: string;
  role: string;
  status: string;
  lastLogin: string;
  webPushSubscriptions?: WebPushSubscription[];
}

interface WebPushDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EnterpriseUser | null;
}

function WebPushDetailModal({ isOpen, onClose, user }: WebPushDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0">
              <h3 className="font-semibold text-title-sm text-text-main">
                웹 푸시 설정 상세
                <span className="ml-2 text-body-sm text-text-sub font-normal">· {user.userName} ({user.userId})</span>
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-bg-muted rounded-full transition-colors text-text-sub"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 overflow-y-auto">
              {user.webPushSubscriptions && user.webPushSubscriptions.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-body-sm text-text-sub">
                      총 <span className="text-primary font-bold">{user.webPushSubscriptions.length}</span>개 디바이스
                    </span>
                  </div>
                  <div className="border border-border-gray rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                          <th className="h-[40px] px-4 text-body-sm font-semibold w-12 text-center border-r border-border-gray">No.</th>
                          <th className="h-[40px] px-4 text-body-sm font-semibold border-r border-border-gray">설정 일시</th>
                          <th className="h-[40px] px-4 text-body-sm font-semibold">디바이스 / 브라우저</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E8EB]">
                        {user.webPushSubscriptions.map((sub, idx) => (
                          <tr key={idx} className="h-[44px] hover:bg-bg-gray transition-colors">
                            <td className="px-4 text-center text-body-sm text-text-sub font-mono border-r border-border-gray">{idx + 1}</td>
                            <td className="px-4 text-body-sm text-text-main font-mono border-r border-border-gray whitespace-nowrap">{sub.setAt}</td>
                            <td className="px-4 text-body-sm text-text-main">{sub.device}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-body text-text-sub">
                  설정된 웹 푸시 디바이스가 없습니다.
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-border-gray bg-gray-50">
              <Button variant="secondary" size="md" onClick={onClose}>
                닫기
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const mockData: EnterpriseUser[] = [
  {
    id: 1, tenant: '(주)토스페이먼츠', tenantCode: 'TOSS', enterprise: '(주)토스페이먼츠',
    userName: '김하나', userId: 'hana_kim@toss.im', role: '마스터', status: '정상', lastLogin: '2024-05-01 10:23:45',
    webPushSubscriptions: [
      { setAt: '2024-04-15 14:22:10', device: 'Chrome 124 / Windows 11' },
      { setAt: '2024-04-28 19:01:02', device: 'Chrome Mobile / Android 14' },
    ],
  },
  {
    id: 2, tenant: '(주)토스페이먼츠', tenantCode: 'TOSS', enterprise: '(주)토스페이먼츠',
    userName: '이보람', userId: 'boram_lee@toss.im', role: '자금 담당', status: '정상', lastLogin: '2024-05-02 11:10:00',
    webPushSubscriptions: [
      { setAt: '2024-04-20 09:05:33', device: 'Safari 17 / macOS Sonoma' },
    ],
  },
  {
    id: 3, tenant: '(주)토스페이먼츠', tenantCode: 'TOSS', enterprise: '(주)토스페이자회사',
    userName: '박지성', userId: 'jisung_park@toss.im', role: '인사 담당', status: '중지', lastLogin: '2024-04-20 09:00:22',
  },
  {
    id: 4, tenant: '야놀자', tenantCode: 'YANOLJA', enterprise: '야놀자',
    userName: '최수종', userId: 'sujong_choi@yanolja.com', role: '마스터', status: '정상', lastLogin: '2024-05-04 08:30:11',
    webPushSubscriptions: [
      { setAt: '2024-05-04 08:31:45', device: 'Edge 124 / Windows 11' },
      { setAt: '2024-05-05 21:14:00', device: 'Safari Mobile / iOS 17' },
      { setAt: '2024-05-09 07:42:18', device: 'Chrome 124 / macOS Sonoma' },
    ],
  },
];

export default function EnterpriseUsers() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [data, setData] = useState<EnterpriseUser[]>(mockData);
  const [roleFilter, setRoleFilter] = useState('all');
  const [isWebPushModalOpen, setIsWebPushModalOpen] = useState(false);
  const [webPushTargetUser, setWebPushTargetUser] = useState<EnterpriseUser | null>(null);
  const [showPwResetConfirm, setShowPwResetConfirm] = useState(false);
  const [showPwResetResult, setShowPwResetResult] = useState(false);
  const [pwResetTargets, setPwResetTargets] = useState<EnterpriseUser[]>([]);

  const handleOpenWebPushDetail = (user: EnterpriseUser) => {
    if (!user.webPushSubscriptions || user.webPushSubscriptions.length === 0) return;
    setWebPushTargetUser(user);
    setIsWebPushModalOpen(true);
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = () => {
    if (selectedIds.length === 0) {
      alert('상태를 변경할 사용자를 선택해주세요.');
      return;
    }
    if (confirm(`선택한 ${selectedIds.length}명 사용자의 상태(사용/중지)를 변경하시겠습니까?`)) {
      setData(data.map(d => selectedIds.includes(d.id) ? { ...d, status: d.status === '정상' ? '중지' : '정상' } : d));
      setSelectedIds([]);
    }
  };

  const handleExcelDownload = () => {
    alert('사용자 목록 엑셀 다운로드를 실행합니다.');
  };

  const handleOpenPwReset = () => {
    if (selectedIds.length === 0) {
      alert('비밀번호를 초기화할 사용자를 선택해주세요.');
      return;
    }
    setShowPwResetConfirm(true);
  };

  const doPasswordReset = () => {
    const targets = data.filter(d => selectedIds.includes(d.id));
    setPwResetTargets(targets);
    setShowPwResetConfirm(false);
    setShowPwResetResult(true);
    setSelectedIds([]);
  };

  return (
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-bg-gray border border-border-gray px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">테넌트명</span>
            <select className="w-48 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary transition-all">
              <option value="all">전체</option>
              <option value="TOSS">(주)토스페이먼츠(TOSS)</option>
              <option value="YANOLJA">야놀자(YANOLJA)</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">기업명</span>
            <input
              type="text"
              placeholder="기업명 입력"
              className="w-56 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">상세 검색</span>
            <input
              type="text"
              placeholder="이름 또는 아이디 입력"
              className="w-56 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary placeholder-[#8B95A1] transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">상태</span>
            <select className="w-40 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary transition-all">
              <option value="all">전체</option>
              <option value="normal">정상</option>
              <option value="stopped">중지</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body font-bold text-gray-800 shrink-0">권한</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-40 h-[40px] px-4 bg-white border border-border-input rounded-lg text-body text-text-main outline-none focus:border-primary transition-all"
            >
              <option value="all">전체</option>
              <option value="master">마스터</option>
              <option value="fund">자금 담당</option>
              <option value="hr">인사 담당</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="w-[100px] h-[48px] bg-primary hover:bg-primary-hover text-white rounded-md text-body-lg font-bold transition-colors shadow-sm">
            조회
          </button>
          <button className="w-[100px] h-[48px] bg-white border border-border-input hover:bg-bg-muted text-text-main rounded-md text-body-lg font-bold transition-colors shadow-sm">
            초기화
          </button>
        </div>
      </div>


      {/* Grid Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-body">
          <span className="text-text-main">총 </span>
          <span className="text-primary font-bold">{data.length}</span>
          <span className="text-text-main"> 명</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExcelDownload}
            className="h-[36px] border border-border-input px-5 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm">
            엑셀 다운로드
          </button>
          <button
            onClick={handleToggleStatus}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold hover:bg-bg-gray bg-white text-text-main transition-colors shadow-sm"
          >
            상태 변경
          </button>
          <button
            onClick={handleOpenPwReset}
            disabled={selectedIds.length === 0}
            className="h-[36px] border border-border-input px-4 rounded-md text-body font-bold transition-colors shadow-sm bg-white text-text-main hover:bg-bg-gray disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            비밀번호 초기화
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-center border-r border-border-gray w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-16">No.</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">테넌트</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">기업명</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">사용자명</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">아이디(ID)</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">권한</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray">상태</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray">웹 푸시</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center">최근 로그인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => {
                const pushCount = item.webPushSubscriptions?.length ?? 0;
                const hasPush = pushCount > 0;
                return (
                  <tr
                    key={item.id}
                    className={`h-[52px] transition-colors hover:bg-bg-gray ${selectedIds.includes(item.id) ? 'bg-primary/5' : 'bg-white'}`}
                  >
                    <td className="px-4 text-center border-r border-border-gray">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="px-4 text-center text-body-sm text-text-sub border-r border-border-gray font-mono">{index + 1}</td>
                    <td className="px-4 text-body text-text-body border-r border-border-gray">{item.tenant}({item.tenantCode})</td>
                    <td className="px-4 text-body text-text-body font-medium border-r border-border-gray">{item.enterprise}</td>
                    <td className="px-4 text-body text-text-main font-medium border-r border-border-gray">{item.userName}</td>
                    <td className="px-4 text-body text-text-body border-r border-border-gray">{item.userId}</td>
                    <td className="px-4 text-body text-text-body border-r border-border-gray">{item.role}</td>
                    <td className="px-4 text-center border-r border-border-gray">
                      <span className={`text-body font-semibold ${item.status === '정상' ? 'text-primary' : 'text-text-sub'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 text-center border-r border-border-gray">
                      {hasPush ? (
                        <button
                          onClick={() => handleOpenWebPushDetail(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-body-sm font-semibold transition-colors"
                        >
                          설정 ({pushCount})
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-bg-gray text-text-sub text-body-sm font-medium">
                          미설정
                        </span>
                      )}
                    </td>
                    <td className="px-4 text-center text-body-sm text-text-sub font-mono whitespace-nowrap">{item.lastLogin}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <WebPushDetailModal
        isOpen={isWebPushModalOpen}
        onClose={() => {
          setIsWebPushModalOpen(false);
          setWebPushTargetUser(null);
        }}
        user={webPushTargetUser}
      />

      {/* 비밀번호 초기화 확인 모달 */}
      <ConfirmModal
        open={showPwResetConfirm}
        variant="primary"
        title="비밀번호를 초기화하시겠습니까?"
        description={`선택한 사용자 ${selectedIds.length}명의 등록 이메일(아이디)로 임시 비밀번호가 발송됩니다.`}
        confirmLabel="발송"
        cancelLabel="취소"
        onConfirm={doPasswordReset}
        onCancel={() => setShowPwResetConfirm(false)}
      />

      {/* 비밀번호 초기화 결과 모달 */}
      <AnimatePresence>
        {showPwResetResult && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0">
                <h3 className="font-semibold text-title-sm text-text-main">
                  임시 비밀번호 발송 완료
                </h3>
                <button
                  onClick={() => setShowPwResetResult(false)}
                  className="p-1.5 hover:bg-bg-muted rounded-full transition-colors text-text-sub"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <p className="text-body text-text-body mb-4 leading-relaxed">
                  아래 <span className="text-primary font-bold">{pwResetTargets.length}</span>명의 등록 이메일로
                  임시 비밀번호가 발송되었습니다.
                </p>
                <div className="border border-border-gray rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                        <th className="h-[40px] px-4 text-body-sm font-semibold w-32 border-r border-border-gray">사용자명</th>
                        <th className="h-[40px] px-4 text-body-sm font-semibold">아이디(이메일)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8EB]">
                      {pwResetTargets.map(u => (
                        <tr key={u.id} className="h-[40px]">
                          <td className="px-4 text-body-sm text-text-main border-r border-border-gray">{u.userName}</td>
                          <td className="px-4 text-body-sm text-text-body font-mono">{u.userId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center justify-end px-6 py-4 border-t border-border-gray bg-gray-50">
                <Button variant="primary" size="md" onClick={() => setShowPwResetResult(false)}>
                  확인
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
