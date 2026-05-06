import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ScrollText, 
  LayoutList, 
  FileText, 
  Wrench,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  Home,
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Code,
  Monitor,
  BarChart3,
  User,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EnterpriseList from './components/EnterpriseList';
import EnterpriseRegister from './components/EnterpriseRegister';
import TenantList from './components/TenantList';
import EnterpriseUsers from './components/EnterpriseUsers';
import FundStatus from './components/FundStatus';
import ExceptionManagement from './components/ExceptionManagement';
import MenuManagement from './components/MenuManagement';
import NoticeManagement from './components/NoticeManagement';
import BannerManagement from './components/BannerManagement';
import FAQManagement from './components/FAQManagement';
import EmailTemplateManagement from './components/EmailTemplateManagement';
import PushNotificationManagement from './components/PushNotificationManagement';
import CodeManagement from './components/CodeManagement';
import MessageManagement from './components/MessageManagement';
import Statistics from './components/Statistics';
import ServiceStatus from './components/ServiceStatus';
import LogManagement from './components/LogManagement';
import FirmBankingFailureStatus from './components/FirmBankingFailureStatus';

import PublishingStatus from './components/PublishingStatus';
import AdminManagement from './components/AdminManagement';

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
      { id: 'tenant_list', label: '테넌트 조회' },
      { id: 'ent_list', label: '기업 조회' },
      { id: 'ent_register', label: '기업 등록' },
      { id: 'ent_users', label: '기업별 사용자 목록' },
      { id: 'fund_status', label: '자금 현황 조회' },
      { id: 'exception_management', label: '타행계좌 예외 관리' },
    ]
  },
  {
    id: 'admin',
    label: '관리자 관리',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'menu_manage',
    label: '메뉴 관리',
    icon: <LayoutList className="w-5 h-5" />,
  },
  {
    id: 'content',
    label: '콘텐츠 관리',
    icon: <FileText className="w-5 h-5" />,
    subMenus: [
      { id: 'notice', label: '공지사항 관리' },
      { id: 'banner', label: '배너 관리' },
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
    subMenus: [
      { id: 'service_status', label: '서비스 상태' }
    ]
  },
  {
    id: 'statistics',
    label: '통계',
    icon: <BarChart3 className="w-5 h-5" />,
  }
];

export default function Dashboard({ onLogout, initialMenu = 'main', initialSubMenu = '', initialRegisterConfig }: DashboardProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(initialMenu);
  const [activeSubMenu, setActiveSubMenu] = useState<string>(initialSubMenu);
  const [activeMenu, setActiveMenu] = useState<string>(initialMenu);
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
    }
  };

  const handleSubMenuClick = (subMenuId: string, parentId: string) => {
    setActiveSubMenu(subMenuId);
    setActiveMenu(parentId);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-[64px] bg-white border-b border-[#E5E8EB] flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-[18px] tracking-tight text-[#191F28]">
            하나은행 ERP 뱅킹 통합 관리 시스템
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
              <User className="w-4 h-4"/>
            </div>
            <span className="text-[14px] font-medium text-[#191F28]">홍길동 님</span>
          </div>
          <div className="w-px h-4 bg-[#E5E8EB]"></div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-[#4E5968] hover:text-[#191F28] transition-colors"
          >
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[240px] bg-white border-right border-[#E5E8EB] flex-shrink-0 flex flex-col z-20 overflow-hidden">
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
                        ? 'text-[#008d75] bg-[#F2F4F6] font-semibold border-l-2 border-[#008d75] rounded-l-none' 
                        : (isExpanded ? 'text-[#191F28] font-bold' : 'text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28]')
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 flex items-center justify-center ${isActiveParent || isExpanded ? 'text-[#008d75]' : 'text-[#8B95A1] group-hover:text-[#4E5968]'}`}>
                          {React.cloneElement(menu.icon as React.ReactElement, { className: "w-full h-full" })}
                        </div>
                        <span className="text-[14px]">{menu.label}</span>
                      </div>
                      {menu.subMenus && (
                        <span className={`${isExpanded ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
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
                                    className={`w-full text-left py-3.5 px-4 rounded-lg transition-all text-[14px] whitespace-nowrap ${
                                      isActiveSub 
                                      ? 'text-[#008d75] bg-[#F2F4F6] font-bold border-l-4 border-[#008d75] rounded-l-none text-[15px]' 
                                      : 'text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28]'
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
        <main className="flex-1 overflow-auto bg-[#F9FAFB]">
          <div className="p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
            {activeMenu !== 'main' && (
              <div className="mb-8">
                <div className="flex items-center gap-2 text-[13px] text-[#8B95A1] mb-2">
                  <Home className="w-3.5 h-3.5" />
                  <ChevronRight className="w-3 h-3 text-[#D1D6DB]" />
                  <span className={activeSubMenu ? "" : "text-[#008d75] font-medium"}>
                    {menus.find(m => m.id === activeMenu)?.label}
                  </span>
                  {activeSubMenu && (
                    <>
                      <ChevronRight className="w-3 h-3 text-[#D1D6DB]" />
                      <span className="text-[#008d75] font-medium">
                        {menus.find(m => m.id === activeMenu)?.subMenus?.find(s => s.id === activeSubMenu)?.label}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-[24px] font-bold text-[#191F28]">
                  {activeSubMenu ? menus.find(m => m.id === activeMenu)?.subMenus?.find(s => s.id === activeSubMenu)?.label : menus.find(m => m.id === activeMenu)?.label}
                </h2>
              </div>
            )}
            {activeMenu === 'main' ? (
            <div className="w-full space-y-6">
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">총 가입 기업</h3>
                    <div className="w-10 h-10 rounded-full bg-[#008d7510] flex items-center justify-center text-[#008d75]">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">1,240</span>
                    <span className="text-sm text-gray-500">개</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-[#008d75]">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    <span>전월 대비 12% 증가</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">금일 트랜잭션</h3>
                    <div className="w-10 h-10 rounded-full bg-[#008d7510] flex items-center justify-center text-[#008d75]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">82,394</span>
                    <span className="text-sm text-gray-500">건</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-[#008d75]">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    <span>어제 대비 5.4% 증가</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">일일 활성 사용자 (DAU)</h3>
                    <div className="w-10 h-10 rounded-full bg-[#008d7510] flex items-center justify-center text-[#008d75]">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">45,281</span>
                    <span className="text-sm text-gray-500">명</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>최근 24시간 기준</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">시스템 오류 접수</h3>
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">12</span>
                    <span className="text-sm text-gray-500">건</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-red-500">
                     <span>신규 접수 3건 (미확인)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-6">주간 트랜잭션 추이</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="transactions" stroke="#008d75" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="트랜잭션(건)" />
                        <Line type="monotone" dataKey="activeUsers" stroke="#3BB19C" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="활성 사용자" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity / Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[16px] font-bold text-gray-900">최근 기업 등록 및 승인</h3>
                    <button className="text-sm text-gray-500 hover:text-gray-700">전체보기</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {recentEnterprises.map((ent) => (
                      <div key={ent.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-semibold text-[14px] text-gray-900 mb-0.5">{ent.name}</p>
                          <p className="text-xs text-gray-500 font-mono mb-1">{ent.regNo}</p>
                          <p className="text-xs text-gray-400">{ent.date}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium border ${
                          ent.status === '활성' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          ent.status === '대기' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {ent.status === '활성' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {ent.status === '대기' && <Clock className="w-3 h-3 mr-1" />}
                          {ent.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full py-2.5 text-sm font-medium text-[#008d75] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                      신규 기업 등록하기
                    </button>
                  </div>
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
          ) : activeMenu === 'admin' ? (
            <div className="w-full space-y-6">
              <AdminManagement />
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
          ) : activeMenu === 'menu_manage' ? (
            <div className="w-full space-y-6">
              <MenuManagement />
            </div>
          ) : activeSubMenu === 'code_manage' ? (
            <div className="w-full space-y-6">
              <CodeManagement />
            </div>
          ) : activeSubMenu === 'message_manage' ? (
            <div className="w-full space-y-6">
              <MessageManagement />
            </div>
          ) : activeSubMenu === 'service_status' ? (
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
              <h3 className="text-[20px] font-bold text-gray-900 mb-2">
                 {activeSubMenu ? menus.find(m => m.id === activeMenu)?.subMenus?.find(s => s.id === activeSubMenu)?.label : menus.find(m => m.id === activeMenu)?.label}
              </h3>
              <p className="text-gray-500 text-[14px]">
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
