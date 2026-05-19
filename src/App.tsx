import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './Dashboard';
import VirtualKeyboard from './components/VirtualKeyboard';
import { POPUP_MAP } from './components/PopupPreviews';

// ... (keep ViewState and other states, but we'll adapt them)

// 퍼블리싱 목록 전체 항목 (화면/팝업 카운트 자동 동기화용)
type PublishingItem = { no: number; label: string; view: string; popup: boolean; popupId?: string };
const PUBLISHING_ITEMS: PublishingItem[] = [
  // 유틸리티 (게이트 화면)
  { no:1,  label:'로그인',                                    view:'login',                         popup:false },
  { no:3,  label:'OTP 등록 (Google OTP)',                     view:'otp_register',                  popup:false },
  { no:4,  label:'비밀번호 변경 - OTP 인증',                  view:'reset_otp',                     popup:false },
  { no:5,  label:'비밀번호 변경 - 새 비밀번호 설정',          view:'reset_password',                popup:false },
  // 기업 관리
  { no:7,  label:'테넌트 관리',                               view:'dashboard_tenant',              popup:false },
  { no:8,  label:'기업 관리',                                 view:'dashboard_ent_list',            popup:false },
  { no:9,  label:'기업 정보 수정 팝업',                       view:'dashboard_ent_list',            popup:true,  popupId:'ent_edit_modal' },
  { no:10, label:'기업 등록 - 기본 정보 (Step 1)',            view:'dashboard_ent_register',        popup:false },
  { no:11, label:'기업 등록 - VAN/펌뱅킹 ID 등록 (Step 2)',  view:'dashboard_ent_register_step2',  popup:false },
  { no:12, label:'기업 등록 - 인터페이스 설정 (Step 3)',      view:'dashboard_ent_register_step3',  popup:false },
  { no:13, label:'이전 단계 이탈 확인 팝업',                  view:'dashboard_ent_register',        popup:true,  popupId:'dirty_check_prev' },
  { no:14, label:'건너뛰기 이탈 확인 팝업',                   view:'dashboard_ent_register',        popup:true,  popupId:'dirty_check_skip' },
  { no:15, label:'테넌트 중복 확인 팝업',                     view:'dashboard_ent_register',        popup:true,  popupId:'tenant_check_status' },
  { no:16, label:'기업별 사용자 목록',                         view:'dashboard_ent_users',           popup:false },
  { no:17, label:'자금 현황 조회',                             view:'dashboard_fund_status',         popup:false },
  { no:18, label:'타행계좌 예외 관리',                         view:'dashboard_exception_management',popup:false },
  { no:19, label:'타행계좌 예외 등록 / 수정 팝업',            view:'dashboard_exception_management',popup:true,  popupId:'exception_register_modal' },
  // 관리자
  { no:20, label:'관리자 관리',                               view:'dashboard_admin_list',          popup:false },
  { no:21, label:'관리자 등록 / 수정 팝업',                   view:'dashboard_admin_list',          popup:true,  popupId:'admin_register_modal' },
  { no:21.5, label:'권한 그룹 관리 (신규)',                   view:'dashboard_permission_group',    popup:false },
  // 시스템
  { no:22, label:'메뉴 관리',                                 view:'dashboard_menu',                popup:false },
  { no:23, label:'메뉴 수정 팝업',                            view:'dashboard_menu',                popup:true,  popupId:'menu_edit_modal' },
  // 콘텐츠
  { no:24, label:'공지사항 관리',                             view:'dashboard_notice_list',         popup:false },
  { no:25, label:'공지사항 등록 / 수정 팝업',                 view:'dashboard_notice_list',         popup:true,  popupId:'notice_modal' },
  { no:26, label:'공지사항 작성 취소 확인 팝업',              view:'dashboard_notice_list',         popup:true,  popupId:'notice_cancel_warning' },
  { no:27, label:'공지사항 삭제 확인 팝업',                   view:'dashboard_notice_list',         popup:true,  popupId:'notice_delete_warning' },
  { no:28, label:'배너 관리',                                 view:'dashboard_banner_management',   popup:false },
  { no:29, label:'배너 등록 / 수정 팝업',                     view:'dashboard_banner_management',   popup:true,  popupId:'banner_modal' },
  { no:30, label:'배너 작성 취소 확인 팝업',                  view:'dashboard_banner_management',   popup:true,  popupId:'banner_cancel_warning' },
  { no:31, label:'배너 삭제 확인 팝업',                       view:'dashboard_banner_management',   popup:true,  popupId:'banner_delete_warning' },
  { no:32, label:'FAQ 관리',                                  view:'dashboard_faq_management',      popup:false },
  { no:33, label:'FAQ 등록 / 수정 팝업',                      view:'dashboard_faq_management',      popup:true,  popupId:'faq_modal' },
  { no:34, label:'FAQ 작성 취소 확인 팝업',                   view:'dashboard_faq_management',      popup:true,  popupId:'faq_cancel_warning' },
  { no:35, label:'FAQ 삭제 확인 팝업',                        view:'dashboard_faq_management',      popup:true,  popupId:'faq_delete_warning' },
  { no:36, label:'이메일 템플릿 관리',                        view:'dashboard_email_template',      popup:false },
  { no:37, label:'이메일 템플릿 등록 / 수정 팝업',            view:'dashboard_email_template',      popup:true,  popupId:'email_modal' },
  { no:38, label:'이메일 템플릿 작성 취소 확인 팝업',         view:'dashboard_email_template',      popup:true,  popupId:'email_cancel_warning' },
  { no:39, label:'PUSH 알림 관리',                            view:'dashboard_push_mgmt',           popup:false },
  { no:40, label:'PUSH 템플릿 등록 / 수정 팝업',              view:'dashboard_push_mgmt',           popup:true,  popupId:'push_modal' },
  { no:41, label:'PUSH 템플릿 삭제 확인 팝업',                view:'dashboard_push_mgmt',           popup:true,  popupId:'push_delete_warning' },
  { no:41.1, label:'팝업 관리',                                view:'dashboard_popup_management',    popup:false },
  { no:41.2, label:'팝업 등록 / 수정 팝업',                    view:'dashboard_popup_management',    popup:true,  popupId:'popup_modal' },
  { no:41.3, label:'팝업 작성 취소 확인 팝업',                 view:'dashboard_popup_management',    popup:true,  popupId:'popup_cancel_warning' },
  { no:41.4, label:'팝업 삭제 확인 팝업',                      view:'dashboard_popup_management',    popup:true,  popupId:'popup_delete_warning' },
  // 코드
  { no:42, label:'코드 관리',                                 view:'dashboard_code',                popup:false },
  { no:43, label:'코드 등록 / 수정 팝업',                     view:'dashboard_code',                popup:true,  popupId:'code_modal' },
  { no:44, label:'코드 미저장 이탈 확인 팝업',                view:'dashboard_code',                popup:true,  popupId:'code_unsaved_warning' },
  // 로그
  { no:47, label:'작업 이력 (로그)',                          view:'dashboard_log_history',         popup:false },
  { no:48, label:'펌뱅킹 실패 현황',                         view:'dashboard_firmbanking_fail',     popup:false },
  { no:49, label:'펌뱅킹 실패 상세 팝업',                    view:'dashboard_firmbanking_fail',     popup:true,  popupId:'firmbanking_detail' },
  // 모니터링 & 통계
  { no:50, label:'시스템 모니터링',                           view:'dashboard_service_status',      popup:false },
  { no:51, label:'통계',                                      view:'dashboard_statistics',          popup:false },
];
const SCREEN_COUNT = PUBLISHING_ITEMS.filter(r => !r.popup).length;
const POPUP_COUNT  = PUBLISHING_ITEMS.filter(r => r.popup).length;

// view 상태값 → URL 매핑 테이블
const VIEW_TO_URL: Record<string, string> = {
  // 유틸리티 (게이트 화면)
  'gate':                           '/',
  'login':                          '/login',
  'otp_verify':                     '/otp-verify',
  'otp_register':                   '/otp-register',
  'reset_otp':                      '/reset-otp',
  'reset_password':                 '/reset-password',
  'reset_complete':                 '/reset-complete',
  // 대시보드
  'dashboard':                      '/dashboard/main',
  'dashboard_tenant':               '/dashboard/enterprise/tenant_list',
  'dashboard_ent_list':             '/dashboard/enterprise/ent_list',
  'dashboard_ent_register':         '/dashboard/enterprise/ent_register',
  'dashboard_ent_register_excel':   '/dashboard/enterprise/ent_register',
  'dashboard_ent_register_step2':   '/dashboard/enterprise/ent_register',
  'dashboard_ent_register_step3':   '/dashboard/enterprise/ent_register',
  'dashboard_ent_users':            '/dashboard/enterprise/ent_users',
  'dashboard_fund_status':          '/dashboard/enterprise/fund_status',
  'dashboard_exception_management': '/dashboard/enterprise/exception_management',
  'dashboard_admin_list':           '/dashboard/admin/admin_list',
  'dashboard_permission_group':     '/dashboard/admin/permission_group',
  'dashboard_menu':                 '/dashboard/menu_manage',
  'dashboard_notice_list':          '/dashboard/content/notice',
  'dashboard_banner_management':    '/dashboard/content/banner',
  'dashboard_faq_management':       '/dashboard/content/faq',
  'dashboard_email_template':       '/dashboard/content/email_template',
  'dashboard_push_mgmt':            '/dashboard/content/push_mgmt',
  'dashboard_popup_management':     '/dashboard/content/popup',
  'dashboard_code':                 '/dashboard/code/code_manage',
  'dashboard_statistics':           '/dashboard/statistics',
  'dashboard_log_history':          '/dashboard/logs/work_history',
  'dashboard_firmbanking_fail':     '/dashboard/logs/firmbanking_fail',
  'dashboard_service_status':       '/dashboard/monitoring',
};

// URL → view 상태값 역매핑
const URL_TO_VIEW: Record<string, string> = {
  '/':                'gate',
  '/login':           'login',
  '/otp-verify':      'otp_verify',
  '/otp-register':    'otp_register',
  '/reset-otp':       'reset_otp',
  '/reset-password':  'reset_password',
  '/reset-complete':  'reset_complete',
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState<string>(() => {
    const path = window.location.pathname;
    // URL로 초기 view 결정
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (URL_TO_VIEW[path]) return URL_TO_VIEW[path];
    return 'gate';
  });

  // view 상태가 바뀔 때마다 URL을 동기화
  useEffect(() => {
    const url = VIEW_TO_URL[view];
    if (url && location.pathname !== url) {
      navigate(url, { replace: false });
    }
  }, [view]);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState<'password' | 'otp' | 'resetOtp' | 'newPassword' | 'confirmPassword' | null>(null);
  const [gatePopupId, setGatePopupId] = useState<string | null>(null);
  
  // Login states
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loginIdError, setLoginIdError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Reset states
  const [resetLoginId, setResetLoginId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Validation states for Reset
  const [resetEmailError, setResetEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    
    if (!id) {
      setLoginIdError('이메일을 입력해 주세요.');
      hasError = true;
    } else {
      setLoginIdError('');
    }
    
    if (!password) {
      setLoginPasswordError('비밀번호를 입력해 주세요.');
      hasError = true;
    } else {
      setLoginPasswordError('');
    }

    if (hasError) return;
    
    // ID가 'admin'(등록됨)이 아니면, 신규 가입자(미등록)로 간주하여 OTP 등록으로 이동
    if (id === 'admin') {
      setView('otp_verify');
    } else {
      setView('otp_register');
    }
    setOtpCode('');
    setOtpError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('6자리 인증 코드를 입력해 주세요.');
      return;
    }
    setOtpError('');
    setView('dashboard');
  };

  const handleRegisterOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('6자리 인증 코드를 입력해 주세요.');
      return;
    }
    setOtpError('');
    showToast('OTP 등록이 완료되었습니다.');
    setView('dashboard');
  };

  const validateEmail = (email: string) => {
    if (!email) return '이메일을 입력해 주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '이메일 형식으로 입력해 주세요.';
    return '';
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(resetEmail);
    if (emailErr) {
      setResetEmailError(emailErr);
      return;
    }
    setResetEmailError('');
    setIsCodeSent(true);
    showToast('인증번호가 이메일로 발송되었습니다.');
  };

  const validateCode = (code: string) => {
    if (!code) return '인증번호를 입력해 주세요.';
    const isValid = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{5}$/.test(code);
    if (!isValid) return '인증번호는 5자리 영문, 숫자 혼합이어야 합니다.';
    return '';
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCode(verificationCode);
    if (err) {
      setVerificationCodeError(err);
      return;
    }
    setView('reset_password');
  };

  const handleResendCode = () => {
    showToast('이메일이 재발송되었습니다.');
  };

  const validateNewPassword = (pass: string) => {
    if (!pass) return '비밀번호를 입력해 주세요.';
    if (pass.length < 8) return '비밀번호는 최소 8자 이상 입력해 주세요.';
    
    const typesCount = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(regex => regex.test(pass)).length;
    if (typesCount < 3) return '영문 소문자, 영문 대문자, 숫자, 특수문자 중 3가지 이상을 포함해 주세요.';
    
    return '';
  };

  const validateConfirmPassword = (confirm: string, newPass: string) => {
    if (!confirm) return '비밀번호 확인을 입력해 주세요.';
    if (!newPass) return '먼저 비밀번호를 입력해 주세요.';
    if (confirm !== newPass) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPassErr = validateNewPassword(newPassword);
    const confirmPassErr = validateConfirmPassword(confirmPassword, newPassword);
    
    setNewPasswordError(newPassErr);
    setConfirmPasswordError(confirmPassErr);

    if (!newPassErr && !confirmPassErr) {
      setView('reset_complete');
    }
  };

  if (view.startsWith('dashboard')) {
    let initialMenu = 'main';
    let initialSubMenu = 'dashboard';
    let initialRegisterConfig: any = undefined;
    
    if (view === 'dashboard_tenant') {
      initialMenu = 'enterprise';
      initialSubMenu = 'tenant_list';
    } else if (view === 'dashboard_ent_list') {
      initialMenu = 'enterprise';
      initialSubMenu = 'ent_list';
    } else if (view.startsWith('dashboard_ent_register')) {
      initialMenu = 'enterprise';
      initialSubMenu = 'ent_register';
      if (view === 'dashboard_ent_register') {
        initialRegisterConfig = { step: 1, mode: 'manual' };
      } else if (view === 'dashboard_ent_register_excel') {
        initialRegisterConfig = { step: 1, mode: 'excel' };
      } else if (view === 'dashboard_ent_register_excel_uploaded') {
        initialRegisterConfig = { step: 1, mode: 'excel', action: 'uploaded' };
      } else if (view === 'dashboard_ent_register_delete') {
        initialRegisterConfig = { step: 1, mode: 'manual', action: 'delete' };
      } else if (view === 'dashboard_ent_register_step2') {
        initialRegisterConfig = { step: 2 };
      } else if (view === 'dashboard_ent_register_step3') {
        initialRegisterConfig = { step: 3 };
      }
    } else if (view === 'dashboard_ent_users') {
      initialMenu = 'enterprise';
      initialSubMenu = 'ent_users';
    } else if (view === 'dashboard_fund_status') {
      initialMenu = 'enterprise';
      initialSubMenu = 'fund_status';
    } else if (view === 'dashboard_exception_management') {
      initialMenu = 'enterprise';
      initialSubMenu = 'exception_management';
    } else if (view === 'dashboard_admin_list') {
      initialMenu = 'admin';
      initialSubMenu = 'admin_list';
    } else if (view === 'dashboard_permission_group') {
      initialMenu = 'admin';
      initialSubMenu = 'permission_group';
    } else if (view === 'dashboard_menu') {
      initialMenu = 'menu_manage';
      initialSubMenu = '';
    } else if (view === 'dashboard_notice_list') {
      initialMenu = 'content';
      initialSubMenu = 'notice';
    } else if (view === 'dashboard_banner_management') {
      initialMenu = 'content';
      initialSubMenu = 'banner';
    } else if (view === 'dashboard_faq_management') {
      initialMenu = 'content';
      initialSubMenu = 'faq';
    } else if (view === 'dashboard_email_template') {
      initialMenu = 'content';
      initialSubMenu = 'email_template';
    } else if (view === 'dashboard_push_mgmt') {
      initialMenu = 'content';
      initialSubMenu = 'push_mgmt';
    } else if (view === 'dashboard_popup_management') {
      initialMenu = 'content';
      initialSubMenu = 'popup';
    } else if (view === 'dashboard_code') {
      initialMenu = 'code';
      initialSubMenu = 'code_manage';
    } else if (view === 'dashboard_statistics') {
      initialMenu = 'statistics';
      initialSubMenu = '';
    } else if (view === 'dashboard_log_history') {
      initialMenu = 'logs';
      initialSubMenu = 'work_history';
    } else if (view === 'dashboard_firmbanking_fail') {
      initialMenu = 'logs';
      initialSubMenu = 'firmbanking_fail';
    } else if (view === 'dashboard_service_status') {
      initialMenu = 'monitoring';
      initialSubMenu = '';
    }

    const dashboardElement = (
      <>
        <Dashboard onLogout={() => setView('login')} initialMenu={initialMenu} initialSubMenu={initialSubMenu} initialRegisterConfig={initialRegisterConfig} />
        <button
          onClick={() => setView('gate')}
          className="fixed bottom-6 right-6 bg-gray-800/90 hover:bg-gray-900 text-white px-5 py-2.5 rounded-full text-body font-medium shadow-lg transition-all z-50 backdrop-blur-sm"
        >
          목록으로 이동
        </button>
      </>
    );

    return (
    <Routes>
      <Route path="/dashboard/:menuId/:subMenuId" element={dashboardElement} />
      <Route path="/dashboard/:menuId" element={dashboardElement} />
      <Route path="/dashboard" element={dashboardElement} />
      <Route path="*" element={dashboardElement} />
    </Routes>
);
  }

  const handleKeyboardConfirm = (val: string) => {
    if (keyboardTarget === 'password') {
      setPassword(val);
      setLoginPasswordError('');
    } else if (keyboardTarget === 'otp') {
      setOtpCode(val);
      setOtpError('');
    } else if (keyboardTarget === 'resetOtp') {
      setVerificationCode(val);
      setVerificationCodeError('');
      setIsKeyboardOpen(false);
      setKeyboardTarget(null);
      setView('reset_password');
      return;
    } else if (keyboardTarget === 'newPassword') {
      setNewPassword(val);
      setNewPasswordError('');
    } else if (keyboardTarget === 'confirmPassword') {
      setConfirmPassword(val);
      setConfirmPasswordError('');
    }
    setIsKeyboardOpen(false);
  };

  const handleAuthenticateOtp = () => {
    const emailErr = validateEmail(resetEmail);
    if (emailErr) {
      setResetEmailError(emailErr);
      return;
    }
    setResetEmailError('');
    setKeyboardTarget('resetOtp');
    setIsKeyboardOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-gray flex items-center justify-center p-4 font-sans pb-20">
      <motion.div
        className={`${view === 'gate' ? 'max-w-[1200px]' : 'max-w-[460px]'} w-full transition-all duration-500`}
      >
        <div className="bg-white rounded-xl border border-border-gray p-8 lg:p-12 shadow-none relative overflow-hidden">
        
          <AnimatePresence mode="wait">
            {view === 'gate' && (
              <motion.div key="gate" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }} className="py-2">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-display-sm font-bold text-text-main">화면 퍼블리싱 목록</h2>
                    <p className="text-body-sm text-text-sub mt-1">화면명 클릭 시 이동 · 팝업 열기 버튼으로 즉시 미리보기</p>
                  </div>
                  <div className="flex gap-5 text-body-sm">
                    <div className="text-center">
                      <p className="text-text-sub mb-0.5">화면</p>
                      <p className="font-bold text-title-sm text-text-main">{SCREEN_COUNT}</p>
                    </div>
                    <div className="w-px bg-border-gray" />
                    <div className="text-center">
                      <p className="text-text-sub mb-0.5">팝업</p>
                      <p className="font-bold text-title-sm text-text-main">{POPUP_COUNT}</p>
                    </div>
                  </div>
                </div>

                {/* 목록 테이블 */}
                <div>
                  <div className="overflow-x-auto rounded-lg border border-border-gray">
                    <table className="w-full text-body-sm border-collapse">
                      <thead>
                        <tr className="bg-bg-gray border-b border-border-gray">
                          <th className="px-4 py-3 text-left font-semibold text-text-body w-[42px]">No.</th>
                          <th className="px-4 py-3 text-left font-semibold text-text-body w-[140px]">카테고리</th>
                          <th className="px-4 py-3 text-left font-semibold text-text-body">화면 / 팝업명</th>
                          <th className="px-4 py-3 text-center font-semibold text-text-body w-[72px]">열기</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 유틸리티 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">유틸리티 (게이트 화면)</td></tr>
                        {[
                          { no:1, label:'로그인',                            view:'login',          popup:false },
                          { no:3, label:'OTP 등록 (Google OTP)',             view:'otp_register',   popup:false },
                          { no:4, label:'비밀번호 변경 - OTP 인증',          view:'reset_otp',      popup:false },
                          { no:5, label:'비밀번호 변경 - 새 비밀번호 설정',  view:'reset_password', popup:false },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">유틸리티</td>
                            <td className="px-4 py-3"><button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button></td>
                            <td className="px-4 py-3 text-center"><span className="text-caption text-text-disabled">&#8212;</span></td>
                          </tr>
                        ))}
                        <tr className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                          <td className="px-4 py-3 text-text-sub text-center">2</td>
                          <td className="px-4 py-3 text-caption text-text-sub">유틸리티</td>
                          <td className="px-4 py-3 font-medium text-text-main">가상 키보드 (보안 키패드)</td>
                          <td className="px-4 py-3 text-center"><button onClick={() => { setKeyboardTarget('password'); setIsKeyboardOpen(true); }} className="inline-flex items-center px-3 py-1 text-caption font-semibold rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors">열기</button></td>
                        </tr>
                        {/* 메인 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">메인</td></tr>
                        <tr className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                          <td className="px-4 py-3 text-text-sub text-center">6</td>
                          <td className="px-4 py-3 text-caption text-text-sub">메인</td>
                          <td className="px-4 py-3"><button onClick={() => setView('dashboard')} className="text-text-link font-medium hover:underline text-left">대시보드 (HOME)</button></td>
                          <td className="px-4 py-3 text-center"><span className="text-caption text-text-disabled">&#8212;</span></td>
                        </tr>
                        {/* 기업 관리 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">기업 관리</td></tr>
                        {[
                          { no:7,  label:'테넌트 관리',                              view:'dashboard_tenant',              popup:false },
                          { no:8,  label:'기업 관리',                                view:'dashboard_ent_list',            popup:false },
                          { no:9,  label:'기업 정보 수정 팝업',                      view:'dashboard_ent_list',            popup:true,  popupId:'ent_edit_modal' },
                          { no:10, label:'기업 등록 - 기본 정보 (Step 1)',           view:'dashboard_ent_register',        popup:false },
                          { no:11, label:'기업 등록 - VAN/펌뱅킹 ID 등록 (Step 2)', view:'dashboard_ent_register_step2',  popup:false },
                          { no:12, label:'기업 등록 - 인터페이스 설정 (Step 3)',     view:'dashboard_ent_register_step3',  popup:false },
                          { no:13, label:'이전 단계 이탈 확인 팝업',                 view:'dashboard_ent_register',        popup:true,  popupId:'dirty_check_prev' },
                          { no:14, label:'건너뛰기 이탈 확인 팝업',                  view:'dashboard_ent_register',        popup:true,  popupId:'dirty_check_skip' },
                          { no:15, label:'테넌트 중복 확인 팝업',                    view:'dashboard_ent_register',        popup:true,  popupId:'tenant_check_status' },
                          { no:16, label:'기업별 사용자 목록',                        view:'dashboard_ent_users',           popup:false },
                          { no:17, label:'자금 현황 조회',                            view:'dashboard_fund_status',         popup:false },
                          { no:18, label:'타행계좌 예외 관리',                        view:'dashboard_exception_management',popup:false },
                          { no:19, label:'타행계좌 예외 등록 / 수정 팝업',           view:'dashboard_exception_management',popup:true,  popupId:'exception_register_modal' },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">기업 관리</td>
                            <td className="px-4 py-3 font-medium text-text-main">{r.popup ? r.label : <button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button>}</td>
                            <td className="px-4 py-3 text-center">{r.popup ? <button onClick={() => r.popupId ? setGatePopupId(r.popupId) : setView(r.view)} className="inline-flex items-center px-3 py-1 text-caption font-semibold rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors">열기</button> : <span className="text-caption text-text-disabled">&#8212;</span>}</td>
                          </tr>
                        ))}
                        {/* 관리자 관리 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">관리자 관리</td></tr>
                        {[
                          { no:20, label:'관리자 관리',                  view:'dashboard_admin_list',      popup:false },
                          { no:21, label:'관리자 등록 / 수정 팝업',      view:'dashboard_admin_list',      popup:true,  popupId:'admin_register_modal' },
                          { no:21.5, label:'권한 그룹 관리 (신규) ★',   view:'dashboard_permission_group', popup:false },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">관리자 관리</td>
                            <td className="px-4 py-3 font-medium text-text-main">{r.popup ? r.label : <button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button>}</td>
                            <td className="px-4 py-3 text-center">{r.popup ? <button onClick={() => r.popupId ? setGatePopupId(r.popupId) : setView(r.view)} className="inline-flex items-center px-3 py-1 text-caption font-semibold rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors">열기</button> : <span className="text-caption text-text-disabled">&#8212;</span>}</td>
                          </tr>
                        ))}
                        {/* 메뉴 관리 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">메뉴 관리</td></tr>
                        {[
                          { no:22, label:'메뉴 관리',      view:'dashboard_menu', popup:false },
                          { no:23, label:'메뉴 수정 팝업', view:'dashboard_menu', popup:true,  popupId:'menu_edit_modal' },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">메뉴 관리</td>
                            <td className="px-4 py-3 font-medium text-text-main">{r.popup ? r.label : <button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button>}</td>
                            <td className="px-4 py-3 text-center">{r.popup ? <button onClick={() => r.popupId ? setGatePopupId(r.popupId) : setView(r.view)} className="inline-flex items-center px-3 py-1 text-caption font-semibold rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors">열기</button> : <span className="text-caption text-text-disabled">&#8212;</span>}</td>
                          </tr>
                        ))}
                        {/* 콘텐츠 관리 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">콘텐츠 관리</td></tr>
                        {[
                          { no:24, label:'공지사항 관리',                     view:'dashboard_notice_list',       popup:false },
                          { no:25, label:'공지사항 등록 / 수정 팝업',         view:'dashboard_notice_list',       popup:true,  popupId:'notice_modal' },
                          { no:26, label:'공지사항 작성 취소 확인 팝업',      view:'dashboard_notice_list',       popup:true,  popupId:'notice_cancel_warning' },
                          { no:27, label:'공지사항 삭제 확인 팝업',           view:'dashboard_notice_list',       popup:true,  popupId:'notice_delete_warning' },
                          { no:28, label:'배너 관리',                         view:'dashboard_banner_management', popup:false },
                          { no:29, label:'배너 등록 / 수정 팝업',             view:'dashboard_banner_management', popup:true,  popupId:'banner_modal' },
                          { no:30, label:'배너 작성 취소 확인 팝업',          view:'dashboard_banner_management', popup:true,  popupId:'banner_cancel_warning' },
                          { no:31, label:'배너 삭제 확인 팝업',               view:'dashboard_banner_management', popup:true,  popupId:'banner_delete_warning' },
                          { no:32, label:'FAQ 관리',                          view:'dashboard_faq_management',    popup:false },
                          { no:33, label:'FAQ 등록 / 수정 팝업',              view:'dashboard_faq_management',    popup:true,  popupId:'faq_modal' },
                          { no:34, label:'FAQ 작성 취소 확인 팝업',           view:'dashboard_faq_management',    popup:true,  popupId:'faq_cancel_warning' },
                          { no:35, label:'FAQ 삭제 확인 팝업',                view:'dashboard_faq_management',    popup:true,  popupId:'faq_delete_warning' },
                          { no:36, label:'이메일 템플릿 관리',                view:'dashboard_email_template',    popup:false },
                          { no:37, label:'이메일 템플릿 등록 / 수정 팝업',    view:'dashboard_email_template',    popup:true,  popupId:'email_modal' },
                          { no:38, label:'이메일 템플릿 작성 취소 확인 팝업', view:'dashboard_email_template',    popup:true,  popupId:'email_cancel_warning' },
                          { no:39, label:'PUSH 알림 관리',                    view:'dashboard_push_mgmt',         popup:false },
                          { no:40, label:'PUSH 템플릿 등록 / 수정 팝업',      view:'dashboard_push_mgmt',         popup:true,  popupId:'push_modal' },
                          { no:41, label:'PUSH 템플릿 삭제 확인 팝업',        view:'dashboard_push_mgmt',         popup:true,  popupId:'push_delete_warning' },
                          { no:41.1, label:'팝업 관리',                        view:'dashboard_popup_management',  popup:false },
                          { no:41.2, label:'팝업 등록 / 수정 팝업',            view:'dashboard_popup_management',  popup:true,  popupId:'popup_modal' },
                          { no:41.3, label:'팝업 작성 취소 확인 팝업',         view:'dashboard_popup_management',  popup:true,  popupId:'popup_cancel_warning' },
                          { no:41.4, label:'팝업 삭제 확인 팝업',              view:'dashboard_popup_management',  popup:true,  popupId:'popup_delete_warning' },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">콘텐츠 관리</td>
                            <td className="px-4 py-3 font-medium text-text-main">{r.popup ? r.label : <button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button>}</td>
                            <td className="px-4 py-3 text-center">{r.popup ? <button onClick={() => r.popupId ? setGatePopupId(r.popupId) : setView(r.view)} className="inline-flex items-center px-3 py-1 text-caption font-semibold rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors">열기</button> : <span className="text-caption text-text-disabled">&#8212;</span>}</td>
                          </tr>
                        ))}
                        {/* 코드 관리 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">코드 관리</td></tr>
                        {[
                          { no:42, label:'코드 관리',                  view:'dashboard_code', popup:false },
                          { no:43, label:'코드 등록 / 수정 팝업',      view:'dashboard_code', popup:true,  popupId:'code_modal' },
                          { no:44, label:'코드 미저장 이탈 확인 팝업', view:'dashboard_code', popup:true,  popupId:'code_unsaved_warning' },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">코드 관리</td>
                            <td className="px-4 py-3 font-medium text-text-main">{r.popup ? r.label : <button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button>}</td>
                            <td className="px-4 py-3 text-center">{r.popup ? <button onClick={() => r.popupId ? setGatePopupId(r.popupId) : setView(r.view)} className="inline-flex items-center px-3 py-1 text-caption font-semibold rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors">열기</button> : <span className="text-caption text-text-disabled">&#8212;</span>}</td>
                          </tr>
                        ))}
                        {/* 로그 관리 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">로그 관리</td></tr>
                        {[
                          { no:47, label:'작업 이력 (로그)',       view:'dashboard_log_history',     popup:false },
                          { no:48, label:'펌뱅킹 실패 현황',       view:'dashboard_firmbanking_fail', popup:false },
                          { no:49, label:'펌뱅킹 실패 상세 팝업',  view:'dashboard_firmbanking_fail', popup:true,  popupId:'firmbanking_detail' },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">로그 관리</td>
                            <td className="px-4 py-3 font-medium text-text-main">{r.popup ? r.label : <button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button>}</td>
                            <td className="px-4 py-3 text-center">{r.popup ? <button onClick={() => r.popupId ? setGatePopupId(r.popupId) : setView(r.view)} className="inline-flex items-center px-3 py-1 text-caption font-semibold rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors">열기</button> : <span className="text-caption text-text-disabled">&#8212;</span>}</td>
                          </tr>
                        ))}
                        {/* 시스템 모니터링 / 통계 */}
                        <tr className="bg-bg-muted"><td colSpan={4} className="px-4 py-2 text-caption font-bold text-text-body uppercase tracking-wide">시스템 모니터링 / 통계</td></tr>
                        {[
                          { no:50, label:'시스템 모니터링', view:'dashboard_service_status', popup:false },
                          { no:51, label:'통계',            view:'dashboard_statistics',     popup:false },
                        ].map(r => (
                          <tr key={r.no} className="border-t border-bg-muted hover:bg-bg-subtle transition-colors">
                            <td className="px-4 py-3 text-text-sub text-center">{r.no}</td>
                            <td className="px-4 py-3 text-caption text-text-sub">시스템/통계</td>
                            <td className="px-4 py-3 font-medium text-text-main">{r.popup ? r.label : <button onClick={() => setView(r.view)} className="text-text-link font-medium hover:underline text-left">{r.label}</button>}</td>
                            <td className="px-4 py-3 text-center"><span className="text-caption text-text-disabled">&#8212;</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {view === 'login' && (
              <motion.div key="login" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                <div className="text-center mb-10">
                  <h1 className="text-display-lg font-bold text-text-main tracking-tight mb-3 leading-tight">
                    하나은행 ERP 뱅킹<br />통합 관리 시스템
                  </h1>
                  <h2 className="text-title font-medium text-text-body mb-4">
                    통합 관리시스템 로그인
                  </h2>
                  <p className="text-body text-text-sub leading-relaxed max-w-[280px] mx-auto">
                    기업 자금 관리, 더 빠르고 간편하게<br/>
                    이체, 집금, 조회 업무를 ERP 뱅킹에서 한 번에 처리해보세요.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6" noValidate>
                  <div className="space-y-1.5 relative">
                    <label htmlFor="adminId" className="block text-body font-semibold text-text-main">
                      이메일 (ID)
                    </label>
                    <input
                      id="adminId"
                      type="email"
                      placeholder="email@email.com"
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value);
                        if (loginIdError) setLoginIdError('');
                      }}
                      onBlur={() => {
                        if (!id) setLoginIdError('이메일을 입력해 주세요.');
                      }}
                      className={`w-full px-4 h-[44px] rounded-lg border ${loginIdError ? 'border-status-error focus:ring-0' : 'border-border-input focus:border-primary'} transition-all outline-none text-body placeholder-[#8B95A1]`}
                    />
                    {loginIdError && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{loginIdError}</p>}
                  </div>

                  <div className="space-y-1.5 relative mt-6">
                    <label htmlFor="password" className="block text-body font-semibold text-text-main">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginPasswordError) setLoginPasswordError('');
                        }}
                        onBlur={() => {
                          if (!password) setLoginPasswordError('비밀번호를 입력해 주세요.');
                        }}
                        className={`w-full px-4 h-[44px] pr-20 rounded-lg border ${loginPasswordError ? 'border-status-error focus:ring-0' : 'border-border-input focus:border-primary'} transition-all outline-none text-body placeholder-[#8B95A1]`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="p-1.5 text-text-sub hover:text-text-body focus:outline-none"
                        >
                          {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {loginPasswordError && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{loginPasswordError}</p>}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center h-5">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        className="h-4 w-4 rounded border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                      />
                      <label htmlFor="rememberMe" className="ml-2 text-body text-text-body cursor-pointer">
                        아이디 저장
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setView('reset_otp')}
                      className="text-body text-text-body hover:text-primary transition-colors"
                    >
                      비밀번호 설정
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-semibold text-body-lg py-4 h-[52px] rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm"
                  >
                    로그인
                  </button>
                </form>
              </motion.div>
            )}

            {view === 'otp_register' && (
              <motion.div key="otp_register" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-title-lg font-bold text-text-main mb-1">하나은행 ERP 뱅킹 서비스</h1>
                  <h2 className="text-title font-semibold text-text-main mb-4">구글 OTP 등록</h2>
                  <p className="text-body-sm text-text-body leading-relaxed">
                    현재 계정에 Google OTP가 등록되어 있지 않습니다.<br/>아래 QR 코드 또는 등록키를 이용해 OTP를 등록해 주세요.
                  </p>
                </div>

                {/* QR Code Area */}
                <div className="flex justify-center mb-5">
                  <div className="w-[180px] h-[180px] bg-bg-muted border border-border-gray rounded-lg flex items-center justify-center">
                    <span className="text-body text-text-sub font-medium">QR영역</span>
                  </div>
                </div>

                {/* 수동 등록키 */}
                <div className="mb-5">
                  <p className="text-caption text-text-sub mb-2">수동 등록키</p>
                  <div className="flex items-center border border-border-gray rounded-lg overflow-hidden">
                    <span className="flex-1 px-4 py-3 text-body-lg font-mono font-medium text-text-main tracking-wider bg-white">
                      7QMDK2VZ8NTR5BWC
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('7QMDK2VZ8NTR5BWC').catch(() => {});
                        showToast('수동 등록키가 복사되었습니다.');
                      }}
                      className="px-4 py-3 bg-primary hover:bg-primary-hover text-white text-body font-medium transition-colors shrink-0"
                    >
                      복사
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="border border-border-gray rounded-lg p-4 mb-6 space-y-2">
                  <p className="text-body-sm text-text-body">1. Google Authenticator 앱을 실행해 주세요.</p>
                  <p className="text-body-sm text-text-body">2. QR 코드를 스캔하거나 등록키를 입력해 주세요.</p>
                  <p className="text-body-sm text-text-body">3. 생성된 인증번호를 입력해 등록을 완료해 주세요.</p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setOtpError('');
                      setOtpCode('');
                    }}
                    className="flex-1 bg-white hover:bg-bg-muted text-text-body border border-border-input font-medium text-body-lg h-[52px] rounded-lg transition-all duration-200"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setKeyboardTarget('otp');
                      setIsKeyboardOpen(true);
                    }}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold text-body-lg h-[52px] rounded-lg transition-all duration-200"
                  >
                    인증번호 입력
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'otp_verify' && (
              <motion.div key="otp_verify" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                <div className="text-center mb-10">
                  <h2 className="text-display-sm font-bold text-text-main mb-3">2단계 인증</h2>
                  <p className="text-body text-text-body leading-relaxed">
                    Google 인증 앱을 열고<br/>
                    6자리 코드를 입력해 주세요.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
                  <div className="space-y-1.5 relative">
                    <label htmlFor="verifyOtp" className="block text-body font-semibold text-text-main text-center">
                      6자리 인증 코드
                    </label>
                      <div className="flex flex-col items-center justify-center">
                        <input
                          id="verifyOtp"
                          type="text"
                          placeholder="000000"
                          value={otpCode}
                          readOnly
                          onClick={() => {
                            setKeyboardTarget('otp');
                            setIsKeyboardOpen(true);
                          }}
                          className={`w-full px-4 h-[64px] rounded-lg border cursor-pointer ${otpError ? 'border-status-error focus:ring-0' : 'border-border-input focus:border-primary'} transition-all outline-none text-display placeholder-[#E5E8EB] font-serif tracking-[0.5em] text-center bg-white hover:border-primary`}
                          maxLength={6}
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setKeyboardTarget('otp');
                            setIsKeyboardOpen(true);
                          }}
                          className="mt-3 text-primary text-body-sm font-bold flex items-center gap-1.5 hover:underline"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/></svg>
                          보안 키패드 사용하기
                        </button>
                      </div>
                    {otpError && <p className="text-caption text-status-error flex items-center justify-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{otpError}</p>}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setOtpError('');
                        setOtpCode('');
                      }}
                      className="w-1/3 bg-white hover:bg-bg-muted text-text-body border border-border-input font-medium text-body-lg h-[52px] rounded-lg transition-all duration-200 shadow-sm"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-primary hover:bg-primary-hover text-white font-semibold text-body-lg h-[52px] rounded-lg transition-all duration-200 shadow-sm"
                    >
                      인증하기
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'reset_otp' && (
              <motion.div key="reset_otp" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                <div className="text-center mb-10">
                  <h2 className="text-title-lg font-bold text-text-main mb-3">비밀번호 재설정</h2>
                  <p className="text-body-sm text-text-body leading-relaxed">
                    비밀번호를 재설정하려면 본인인증이 필요합니다.<br/>
                    본인인증은 구글 OTP 인증으로 진행됩니다.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAuthenticateOtp(); }} className="space-y-6" noValidate>
                  <div className="space-y-1.5 relative">
                    <label htmlFor="resetEmail" className="block text-body font-semibold text-text-main">
                      이메일(ID)
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      placeholder="email@email.com"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (resetEmailError) setResetEmailError('');
                      }}
                      onBlur={() => {
                        setResetEmailError(validateEmail(resetEmail));
                      }}
                      className={`w-full px-4 h-[44px] rounded-lg border ${resetEmailError ? 'border-status-error focus:ring-0' : 'border-border-input focus:border-primary'} transition-all outline-none text-body placeholder-[#8B95A1]`}
                    />
                    {resetEmailError && <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{resetEmailError}</p>}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setResetEmailError('');
                        setLoginIdError('');
                        setLoginPasswordError('');
                      }}
                      className="flex-1 bg-white hover:bg-bg-muted text-text-body border border-border-input font-medium text-body-lg h-[52px] rounded-lg transition-colors duration-200"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleAuthenticateOtp}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold text-body-lg h-[52px] rounded-lg transition-all duration-200 shadow-sm"
                    >
                      인증하기
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'reset_password' && (
              <motion.div key="reset_password" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.3 }}>
                <div className="text-center mb-10">
                  <h2 className="text-title-lg font-bold text-text-main mb-3">새 비밀번호 설정</h2>
                  <p className="text-body-sm text-text-body leading-relaxed">
                    인증이 완료되었습니다.<br/>
                    로그인에 사용할 새 비밀번호를 입력해 주세요.
                  </p>
                </div>

                <form onSubmit={handleSetNewPassword} className="space-y-6" noValidate>
                  <div className="space-y-1.5 relative">
                    <label htmlFor="newPassword" className="block text-body font-semibold text-text-main">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="비밀번호 입력"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (newPasswordError) setNewPasswordError('');
                          if (confirmPassword) setConfirmPasswordError(validateConfirmPassword(confirmPassword, e.target.value));
                        }}
                        onBlur={(e) => setNewPasswordError(validateNewPassword(e.target.value))}
                        className={`w-full px-4 h-[44px] pr-20 rounded-lg border ${newPasswordError ? 'border-status-error focus:ring-0' : 'border-border-input focus:border-primary'} transition-all outline-none text-body placeholder-[#8B95A1]`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="p-1.5 text-text-sub hover:text-text-body focus:outline-none"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {newPasswordError ? (
                      <p className="text-caption text-status-error flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{newPasswordError}</p>
                    ) : (
                      <p className="text-caption text-text-sub mt-2">
                        * 영문 소문자, 영문 대문자, 숫자, 특수문자 중 3가지 이상을 포함해 주세요.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 relative mt-6">
                    <label htmlFor="confirmPassword" className="block text-body font-semibold text-text-main">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="비밀번호 확인"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmPasswordError) setConfirmPasswordError('');
                        }}
                        onBlur={(e) => setConfirmPasswordError(validateConfirmPassword(e.target.value, newPassword))}
                        className={`w-full px-4 h-[44px] pr-20 rounded-lg border ${confirmPasswordError ? 'border-status-error focus:ring-0' : 'border-border-input focus:border-primary'} transition-all outline-none text-body placeholder-[#8B95A1]`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="p-1.5 text-text-sub hover:text-text-body focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    {confirmPasswordError && (
                      <p className="text-caption text-status-error flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />{confirmPasswordError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 bg-primary hover:bg-primary-hover text-white font-semibold text-body-lg h-[52px] rounded-lg transition-all duration-200 shadow-sm"
                  >
                    비밀번호 변경
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          <VirtualKeyboard
            isOpen={isKeyboardOpen}
            onClose={() => setIsKeyboardOpen(false)}
            onConfirm={handleKeyboardConfirm}
          />
        </div>
      </motion.div>

      {/* 화면 퍼블리싱 목록 - 팝업 미리보기 렌더링 */}
      {gatePopupId && POPUP_MAP[gatePopupId]?.(() => setGatePopupId(null))}

      {view !== 'gate' && (
        <button
          onClick={() => setView('gate')}
          className="fixed bottom-6 right-6 bg-gray-800/90 hover:bg-gray-900 text-white px-5 py-2.5 rounded-full text-body font-medium shadow-lg transition-all z-50 backdrop-blur-sm"
        >
          목록으로 이동
        </button>
      )}
    </div>
  );
}
