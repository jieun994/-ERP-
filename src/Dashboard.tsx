import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Users,
  ScrollText,
  FileText,
  ChevronDown,
  ChevronUp,
  Menu,
  Home,
  Code,
  Monitor,
  BarChart3,
  User,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import EnterpriseList from './components/EnterpriseList';
import EnterpriseRegister from './components/EnterpriseRegister';
import TenantList from './components/TenantList';
import EnterpriseUsers from './components/EnterpriseUsers';
import FundStatus from './components/FundStatus';
import ExceptionManagement from './components/ExceptionManagement';
import NoticeManagement from './components/NoticeManagement';
import BannerManagement from './components/BannerManagement';
import FAQManagement from './components/FAQManagement';
import EmailTemplateManagement from './components/EmailTemplateManagement';
import PushNotificationManagement from './components/PushNotificationManagement';
import PopupManagement from './components/PopupManagement';
import CodeManagement from './components/CodeManagement';
import MessageManagement from './components/MessageManagement';
import Statistics from './components/Statistics';
import ServiceStatus from './components/ServiceStatus';
import LogManagement from './components/LogManagement';
import FirmBankingFailureStatus from './components/FirmBankingFailureStatus';

import PublishingStatus from './components/PublishingStatus';
import AdminManagement from './components/AdminManagement';
import PermissionGroupManagement from './components/PermissionGroupManagement';
import MenuManagement from './components/MenuManagement';

interface DashboardProps {
  onLogout: () => void;
  initialMenu?: string;
  initialSubMenu?: string;
  initialRegisterConfig?: any;
}

type MenuConfig = {
  id: string;
  label: string;
  icon: React.ReactNode;
  subMenus?: { id: string; label: string }[];
};

const menus: MenuConfig[] = [
  {
    id: 'main',
    label: 'HOME',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'enterprise',
    label: '기업 관리',
    icon: <Building2 className="w-5 h-5" />,
    subMenus: [
      { id: 'tenant_list', label: '테넌트 관리' },
      { id: 'ent_list', label: '기업 관리' },
      { id: 'ent_register', label: '기업 등록' },
      { id: 'ent_users', label: '기업별 사용자 목록' },
      { id: 'fund_status', label: '자금 현황 조회' },
      { id: 'exception_management', label: '타행계좌 예외 관리' },
    ]
  },
  {
    id: 'admin',
    label: '관리자 관리',
    icon: <Users className="w-5 h-5" />,
    subMenus: [
      { id: 'admin_list', label: '관리자 관리' },
      { id: 'permission_group', label: '권한 그룹 관리' },
    ]
  },
  {
    id: 'menu_manage',
    label: '메뉴 관리',
    icon: <Menu className="w-5 h-5" />
  },
  {
    id: 'content',
    label: '콘텐츠 관리',
    icon: <FileText className="w-5 h-5" />,
    subMenus: [
      { id: 'notice', label: '공지사항 관리' },
      { id: 'banner', label: '배너 관리' },
      { id: 'popup', label: '팝업 관리' },
      { id: 'faq', label: 'FAQ 관리' },
      { id: 'email_template', label: '이메일 템플릿 관리' },
      { id: 'push_mgmt', label: 'PUSH 알림 관리' },
    ]
  },
  {
    id: 'code',
    label: '코드 관리',
    icon: <Code className="w-5 h-5" />,
    subMenus: [
      { id: 'code_manage', label: '코드 관리' },
      { id: 'message_manage', label: '메시지 관리' }
    ]
  },
  {
    id: 'logs',
    label: '로그 관리',
    icon: <ScrollText className="w-5 h-5" />,
    subMenus: [
      { id: 'work_history', label: '작업 이력' },
      { id: 'firmbanking_fail', label: '펌뱅킹 실패 현황' },
    ]
  },
  {
    id: 'monitoring',
    label: '시스템 모니터링',
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    id: 'statistics',
    label: '통계',
    icon: <BarChart3 className="w-5 h-5" />,
  }
];

export default function Dashboard({ onLogout, initialMenu = 'main', initialSubMenu = '', initialRegisterConfig }: DashboardProps) {
  const params = useParams<{ menuId?: string; subMenuId?: string }>();
  
  useEffect(() => {
    if (params.menuId) {
      setActiveMenu(params.menuId);
      setActiveSubMenu(params.subMenuId || '');
    }
  }, [params.menuId, params.subMenuId]);
  const navigate = useNavigate();
  const { menu, subMenu } = useParams();
  
  const [expandedMenu, setExpandedMenu] = useState<string | null>(menu || initialMenu);
  const [activeSubMenu, setActiveSubMenu] = useState<string>(subMenu || initialSubMenu);
  const [activeMenu, setActiveMenu] = useState<string>(menu || initialMenu);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock data for Dashboard
  const chartData = [
    { name: '10.01', transactions: 4000, activeUsers: 2400 },
    { name: '10.02', transactions: 3000, activeUsers: 1398 },
    { name: '10.03', transactions: 2000, activeUsers: 6800 },
    { name: '10.04', transactions: 2780, activeUsers: 3908 },
    { name: '10.05', transactions: 5890, activeUsers: 4800 },
    { name: '10.06', transactions: 2390, activeUsers: 3800 },
    { name: '10.07', transactions: 6490, activeUsers: 4300 },
  ];

  const recentEnterprises = [
    { id: 1, name: '(주)토스페이먼츠', regNo: '120-81-12345', date: '2023-10-07 14:22', status: '활성' },
    { id: 2, name: '우아한형제들', regNo: '120-81-67890', date: '2023-10-07 11:05', status: '대기' },
    { id: 3, name: '당근마켓', regNo: '120-81-54321', date: '2023-10-06 16:40', status: '활성' },
    { id: 4, name: '야놀자', regNo: '120-81-09876', date: '2023-10-06 09:15', status: '중지' },
  ];

  const handleMenuClick = (menuId: string, hasSubMenus: boolean) => {
    if (hasSubMenus) {
      setExpandedMenu(expandedMenu === menuId ? null : menuId);
    } else {
      setActiveMenu(menuId);
      setActiveSubMenu('');
      setExpandedMenu(null);
      navigate(`/dashboard/${menuId}`);
    }
  };

  const handleSubMenuClick = (subMenuId: string, parentId: string) => {
    setActiveSubMenu(subMenuId);
    setActiveMenu(parentId);
    navigate(`/dashboard/${parentId}/${subMenuId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-gray overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-[64px] bg-white border-b border-border-gray flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-title tracking-tight text-text-main">
            하나은행 ERP 뱅킹 통합 관리 시스템
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bg-gray flex items-center justify-center text-text-sub border border-border-gray">
              <User className="w-4 h-4"/>
            </div>
            <span className="text-body font-medium text-text-main">홍길동 님</span>
          </div>
          <div className="w-px h-4 bg-border-gray"></div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 text-body font-medium text-text-body hover:text-text-main transition-colors"
          >
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[240px] bg-white border-right border-border-gray flex-shrink-0 flex flex-col z-20 overflow-hidden">
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar py-4 px-3">
            <nav className="w-full flex flex-col gap-1">
              {menus.map((menu, index) => {
                const isActiveParent = activeMenu === menu.id;
                const isExpanded = expandedMenu === menu.id;
                
                return (
                  <div key={menu.id} className="w-full">
                    <button
                      onClick={() => handleMenuClick(menu.id, !!menu.subMenus)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all whitespace-nowrap group ${
                        isActiveParent && !menu.subMenus 
                        ? 'text-primary bg-bg-muted font-semibold border-l-2 border-primary rounded-l-none' 
                        : (isExpanded ? 'text-text-main font-bold' : 'text-text-body hover:bg-bg-muted hover:text-text-main')
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 flex items-center justify-center ${isActiveParent || isExpanded ? 'text-primary' : 'text-text-sub group-hover:text-text-body'}`}>
                          {React.cloneElement(menu.icon as React.ReactElement, { className: "w-full h-full" })}
                        </div>
                        <span className="text-body">{menu.label}</span>
                      </div>
                      {menu.subMenus && (
                        <span className={`${isExpanded ? 'text-primary' : 'text-text-sub'}`}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      )}
                    </button>
                    
                    {menu.subMenus && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden w-full"
                          >
                            <div className="flex flex-col py-1.5 w-full pl-12 gap-2 mt-2">
                              {menu.subMenus.map((subMenu) => {
                                const isActiveSub = activeSubMenu === subMenu.id;
                                return (
                                  <button
                                    key={subMenu.id}
                                    onClick={() => handleSubMenuClick(subMenu.id, menu.id)}
                                    className={`w-full text-left py-3.5 px-4 rounded-lg transition-all text-body whitespace-nowrap ${
                                      isActiveSub 
                                      ? 'text-primary bg-bg-muted font-bold border-l-4 border-primary rounded-l-none text-body-lg' 
                                      : 'text-text-body hover:bg-bg-muted hover:text-text-main'
                                    }`}
                                  >
                                    {subMenu.label}
                                  </button>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 min-w-0 overflow-auto bg-bg-gray">
          <div className="p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
            {activeMenu !== 'main' && (
              <div className="mb-8">
                <div className="flex items-center gap-2 text-body-sm text-text-sub mb-2">
                  <Home className="w-3.5 h-3.5" />
                  <ChevronRight className="w-3 h-3 text-border-input" />
                  <span className={activeSubMenu ? "" : "text-primary font-medium"}>
                    {menus.find(m => m.id === activeMenu)?.label}
                  </span>
                  {activeSubMenu && (
                    <>
                      <ChevronRight className="w-3 h-3 text-border-input" />
                      <span className="text-primary font-medium">
                        {menus.find(m => m.id === activeMenu)?.subMenus?.find(s => s.id === activeSubMenu)?.label}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-display font-bold text-text-main">
                  {activeSubMenu ? menus.find(m => m.id === activeMenu)?.subMenus?.find(s => s.id === activeSubMenu)?.label : menus.find(m => m.id === activeMenu)?.label}
                </h2>
              </div>
            )}
            {activeMenu === 'main' ? (
            <div className="w-full space-y-6">
              {/* Dashboard Header */}
              <div className="flex items-end justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-title-lg font-bold text-text-main">통합 운영 대시보드</h2>
                  <p className="text-body-sm text-text-sub mt-1">로그 · 시스템 모니터링 · 통계 · 기업등록 핵심 지표를 한눈에 확인합니다.</p>
                </div>
                <div className="text-caption text-text-sub">
                  최종 동기화 2026-05-13 14:30
                </div>
              </div>

              {/* 4 Widget Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ────────── 1. 로그 관리 위젯 ────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-border-gray p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-title-sm font-bold text-text-main">로그 관리</h3>
                      <p className="text-caption text-text-sub mt-0.5">금일 작업 이력 · 오류 추이</p>
                    </div>
                    <button
                      onClick={() => { setActiveMenu('logs'); setActiveSubMenu('work_history'); setExpandedMenu('logs'); navigate('/dashboard/logs/work_history'); }}
                      className="flex items-center gap-0.5 text-caption font-medium text-text-body hover:text-primary"
                    >
                      전체보기 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg bg-bg-gray border border-border-gray px-3 py-2.5">
                      <p className="text-caption text-text-sub">총 로그</p>
                      <p className="text-title font-bold text-text-main mt-0.5">12,847<span className="text-caption text-text-sub font-normal ml-0.5">건</span></p>
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                      <p className="text-caption text-red-600">ERROR</p>
                      <p className="text-title font-bold text-red-600 mt-0.5">38<span className="text-caption text-red-400 font-normal ml-0.5">건</span></p>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                      <p className="text-caption text-amber-700">WARN</p>
                      <p className="text-title font-bold text-amber-700 mt-0.5">142<span className="text-caption text-amber-500 font-normal ml-0.5">건</span></p>
                    </div>
                  </div>

                  <div className="h-[120px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { t: '08시', error: 2, warn: 8 },
                        { t: '10시', error: 5, warn: 14 },
                        { t: '12시', error: 3, warn: 11 },
                        { t: '14시', error: 9, warn: 22 },
                        { t: '16시', error: 7, warn: 18 },
                        { t: '18시', error: 12, warn: 26 },
                      ]} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }} />
                        <Area type="monotone" dataKey="warn" stackId="1" stroke="#f59e0b" fill="#fef3c7" name="WARN" />
                        <Area type="monotone" dataKey="error" stackId="1" stroke="#ef4444" fill="#fee2e2" name="ERROR" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border-t border-border-gray pt-3 space-y-2">
                    <p className="text-caption font-semibold text-text-sub mb-1">최근 ERROR 로그</p>
                    {[
                      { time: '14:22', code: 'MAIL_SEND_TIMEOUT', resource: 'svc-email-v2' },
                      { time: '13:55', code: 'API_ACCESS_DENIED', resource: '/api/v1/fund' },
                      { time: '11:08', code: 'DB_CONN_FAIL', resource: 'erp-int-2' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-caption">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-caption font-bold bg-red-50 text-red-600 border border-red-200">ERROR</span>
                          <span className="font-mono text-text-main truncate">{log.code}</span>
                        </div>
                        <span className="text-caption text-text-sub font-mono shrink-0 ml-2">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ────────── 2. 시스템 모니터링 위젯 ────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-border-gray p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-title-sm font-bold text-text-main">시스템 모니터링</h3>
                      <p className="text-caption text-text-sub mt-0.5">기업별 시스템 연결 상태 · 응답시간</p>
                    </div>
                    <button
                      onClick={() => { setActiveMenu('monitoring'); setActiveSubMenu(''); setExpandedMenu(null); navigate('/dashboard/monitoring'); }}
                      className="flex items-center gap-0.5 text-caption font-medium text-text-body hover:text-primary"
                    >
                      전체보기 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5">
                      <p className="text-caption text-primary">정상</p>
                      <p className="text-title font-bold text-primary mt-0.5">182<span className="text-caption text-primary/70 font-normal ml-0.5">건</span></p>
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                      <p className="text-caption text-red-600">오류</p>
                      <p className="text-title font-bold text-red-600 mt-0.5">4<span className="text-caption text-red-400 font-normal ml-0.5">건</span></p>
                    </div>
                    <div className="rounded-lg bg-bg-muted border border-border-gray px-3 py-2.5">
                      <p className="text-caption text-text-sub">미연결</p>
                      <p className="text-title font-bold text-text-sub mt-0.5">6<span className="text-caption text-text-sub font-normal ml-0.5">건</span></p>
                    </div>
                  </div>

                  <div className="h-[120px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { t: '08시', ms: 145 },
                        { t: '10시', ms: 162 },
                        { t: '12시', ms: 188 },
                        { t: '14시', ms: 156 },
                        { t: '16시', ms: 172 },
                        { t: '18시', ms: 158 },
                      ]} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }} formatter={(v: any) => [`${v}ms`, '평균 응답']} />
                        <Line type="monotone" dataKey="ms" stroke="#008d75" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} name="평균 응답시간" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border-t border-border-gray pt-3 space-y-2">
                    <p className="text-caption font-semibold text-text-sub mb-1">이슈 발생 기업</p>
                    {[
                      { name: '(주)한국전자', system: 'Biz-서비스 1', status: '오류', tone: 'red' },
                      { name: '(주)미래산업', system: 'Biz-서비스 1,2', status: '미연결', tone: 'gray' },
                      { name: '(주)한강건설', system: 'Biz-서비스 2', status: '오류', tone: 'red' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between text-caption">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-text-main truncate">{row.name}</span>
                          <span className="text-caption text-text-sub truncate">· {row.system}</span>
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-caption font-semibold border shrink-0 ml-2 ${
                          row.tone === 'red' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-bg-muted text-text-sub border-border-gray'
                        }`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ────────── 3. 통신통계 위젯 ────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-border-gray p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-title-sm font-bold text-text-main">통신통계</h3>
                      <p className="text-caption text-text-sub mt-0.5">채널별 거래량 · 주간 추이</p>
                    </div>
                    <button
                      onClick={() => { setActiveMenu('statistics'); setActiveSubMenu(''); setExpandedMenu(null); navigate('/dashboard/statistics'); }}
                      className="flex items-center gap-0.5 text-caption font-medium text-text-body hover:text-primary"
                    >
                      전체보기 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="rounded-lg bg-bg-gray border border-border-gray px-2.5 py-2.5">
                      <p className="text-caption text-text-sub">금일 총 거래</p>
                      <p className="text-title-sm font-bold text-text-main mt-0.5">82,394</p>
                      <p className="text-caption text-primary mt-0.5">+5.4%</p>
                    </div>
                    <div className="rounded-lg bg-bg-gray border border-border-gray px-2.5 py-2.5">
                      <p className="text-caption text-text-sub flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: '#008d75' }} />VAN</p>
                      <p className="text-title-sm font-bold text-text-main mt-0.5">45,316</p>
                      <p className="text-caption text-text-sub mt-0.5">55%</p>
                    </div>
                    <div className="rounded-lg bg-bg-gray border border-border-gray px-2.5 py-2.5">
                      <p className="text-caption text-text-sub flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: '#5BB8A4' }} />ERP</p>
                      <p className="text-title-sm font-bold text-text-main mt-0.5">24,718</p>
                      <p className="text-caption text-text-sub mt-0.5">30%</p>
                    </div>
                    <div className="rounded-lg bg-bg-gray border border-border-gray px-2.5 py-2.5">
                      <p className="text-caption text-text-sub flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: '#B7E0D4' }} />오픈뱅킹</p>
                      <p className="text-title-sm font-bold text-text-main mt-0.5">12,360</p>
                      <p className="text-caption text-text-sub mt-0.5">15%</p>
                    </div>
                  </div>

                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { d: '05.07', van: 41200, erp: 22100, ob: 10800 },
                        { d: '05.08', van: 43800, erp: 23600, ob: 11400 },
                        { d: '05.09', van: 19500, erp: 10200, ob: 5100 },
                        { d: '05.10', van: 18800, erp: 9800, ob: 4900 },
                        { d: '05.11', van: 42100, erp: 23200, ob: 11600 },
                        { d: '05.12', van: 44300, erp: 24100, ob: 12100 },
                        { d: '05.13', van: 45316, erp: 24718, ob: 12360 },
                      ]} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }} />
                        <Bar dataKey="van" stackId="a" fill="#008d75" name="VAN" />
                        <Bar dataKey="erp" stackId="a" fill="#5BB8A4" name="ERP" />
                        <Bar dataKey="ob" stackId="a" fill="#B7E0D4" name="오픈뱅킹" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ────────── 4. 기업 등록 위젯 ────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-border-gray p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-title-sm font-bold text-text-main">기업 등록</h3>
                      <p className="text-caption text-text-sub mt-0.5">신규 등록 현황 · 승인 대기</p>
                    </div>
                    <button
                      onClick={() => { setActiveMenu('enterprise'); setActiveSubMenu('ent_list'); setExpandedMenu('enterprise'); navigate('/dashboard/enterprise/ent_list'); }}
                      className="flex items-center gap-0.5 text-caption font-medium text-text-body hover:text-primary"
                    >
                      전체보기 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="rounded-lg bg-bg-gray border border-border-gray px-2.5 py-2.5">
                      <p className="text-caption text-text-sub">총 가입</p>
                      <p className="text-title-sm font-bold text-text-main mt-0.5">1,240</p>
                      <p className="text-caption text-primary mt-0.5">+12%</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-2.5">
                      <p className="text-caption text-emerald-700">활성</p>
                      <p className="text-title-sm font-bold text-emerald-700 mt-0.5">1,102</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-2.5">
                      <p className="text-caption text-amber-700">대기</p>
                      <p className="text-title-sm font-bold text-amber-700 mt-0.5">94</p>
                    </div>
                    <div className="rounded-lg bg-bg-gray border border-border-gray px-2.5 py-2.5">
                      <p className="text-caption text-text-sub">중지</p>
                      <p className="text-title-sm font-bold text-text-main mt-0.5">44</p>
                    </div>
                  </div>

                  <div className="h-[100px] w-full mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { m: '12월', n: 18 },
                        { m: '01월', n: 22 },
                        { m: '02월', n: 28 },
                        { m: '03월', n: 35 },
                        { m: '04월', n: 41 },
                        { m: '05월', n: 47 },
                      ]} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B95A1', fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }} formatter={(v: any) => [`${v}개`, '신규 등록']} />
                        <Area type="monotone" dataKey="n" stroke="#008d75" fill="#008d7520" strokeWidth={2} name="신규 등록" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border-t border-border-gray pt-3 space-y-2 mb-3">
                    <p className="text-caption font-semibold text-text-sub mb-1">최근 등록 기업</p>
                    {recentEnterprises.slice(0, 3).map((ent) => (
                      <div key={ent.id} className="flex items-center justify-between text-caption">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-text-main truncate">{ent.name}</span>
                          <span className="text-caption text-text-sub font-mono truncate">· {ent.regNo}</span>
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-caption font-medium border shrink-0 ml-2 ${
                          ent.status === '활성' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          ent.status === '대기' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-bg-gray text-text-sub border-border-gray'
                        }`}>{ent.status}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { setActiveMenu('enterprise'); setActiveSubMenu('ent_register'); setExpandedMenu('enterprise'); navigate('/dashboard/enterprise/ent_register'); }}
                    className="w-full h-[40px] inline-flex items-center justify-center gap-1.5 text-body font-semibold text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm transition-colors"
                  >
                    + 신규 기업 등록하기
                  </button>
                </div>
              </div>
            </div>
          ) : activeSubMenu === 'tenant_list' ? (
            <div className="w-full space-y-6">
              <TenantList />
            </div>
          ) : activeSubMenu === 'ent_list' ? (
            <div className="w-full space-y-6">
              <EnterpriseList />
            </div>
          ) : activeSubMenu === 'ent_register' ? (
            <div className="w-full space-y-6">
              <EnterpriseRegister 
                initialConfig={initialRegisterConfig} 
                onComplete={() => console.log('Complete')} 
                onClose={() => console.log('Close')} 
              />
            </div>
          ) : activeSubMenu === 'ent_users' ? (
            <div className="w-full space-y-6">
              <EnterpriseUsers />
            </div>
          ) : activeSubMenu === 'fund_status' ? (
            <div className="w-full space-y-6">
              <FundStatus />
            </div>
          ) : activeSubMenu === 'exception_management' ? (
            <div className="w-full space-y-6">
              <ExceptionManagement />
            </div>
          ) : activeMenu === 'admin' && activeSubMenu === 'permission_group' ? (
            <div className="w-full space-y-6">
              <PermissionGroupManagement />
            </div>
          ) : activeMenu === 'admin' ? (
            <div className="w-full space-y-6">
              <AdminManagement />
            </div>
          ) : activeMenu === 'menu_manage' ? (
            <div className="w-full space-y-6">
              <MenuManagement />
            </div>
          ) : activeSubMenu === 'notice' ? (
            <div className="w-full space-y-6">
              <NoticeManagement />
            </div>
          ) : activeSubMenu === 'banner' ? (
            <div className="w-full space-y-6">
              <BannerManagement />
            </div>
          ) : activeSubMenu === 'faq' ? (
            <div className="w-full space-y-6">
              <FAQManagement />
            </div>
          ) : activeSubMenu === 'email_template' ? (
            <div className="w-full space-y-6">
              <EmailTemplateManagement />
            </div>
          ) : activeSubMenu === 'push_mgmt' ? (
            <div className="w-full space-y-6">
              <PushNotificationManagement />
            </div>
          ) : activeSubMenu === 'popup' ? (
            <div className="w-full space-y-6">
              <PopupManagement />
            </div>
          ) : activeSubMenu === 'code_manage' ? (
            <div className="w-full space-y-6">
              <CodeManagement />
            </div>
          ) : activeSubMenu === 'message_manage' ? (
            <div className="w-full space-y-6">
              <MessageManagement />
            </div>
          ) : activeMenu === 'monitoring' ? (
            <div className="w-full space-y-6">
              <ServiceStatus />
            </div>
          ) : activeMenu === 'statistics' ? (
            <div className="w-full space-y-6">
              <Statistics />
            </div>
          ) : activeSubMenu === 'work_history' ? (
            <div className="w-full space-y-6">
              <LogManagement />
            </div>
          ) : activeSubMenu === 'firmbanking_fail' ? (
            <div className="w-full space-y-6">
              <FirmBankingFailureStatus />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-border-gray p-8 min-h-[500px]">
              <h3 className="text-title-lg font-bold text-text-main mb-2">
                 {activeSubMenu ? menus.find(m => m.id === activeMenu)?.subMenus?.find(s => s.id === activeSubMenu)?.label : menus.find(m => m.id === activeMenu)?.label}
              </h3>
              <p className="text-text-sub text-body">
                이 영역에 해당 메뉴의 기능이 구현됩니다.
              </p>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
