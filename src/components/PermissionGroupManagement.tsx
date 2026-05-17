import React, { useState, useMemo } from 'react';
import { Copy, Plus, Save, ChevronDown, ChevronRight, AlertCircle, Shield } from 'lucide-react';
import { Button, PageLayout, Select } from './ui';
import {
  Role,
  ROLES,
  ROLE_LABELS,
  ROLE_NUMBERS,
  ROLE_BADGE_COLORS,
  ROLE_DESCRIPTIONS,
} from '../types/auth';

/** 권한 매트릭스 셀 액션 */
type Action = 'read' | 'create' | 'update' | 'delete' | 'download';

const ACTION_LABELS: Record<Action, string> = {
  read: '조회',
  create: '등록',
  update: '수정',
  delete: '삭제',
  download: '다운로드',
};

/** 메뉴 노드 */
interface MenuNode {
  id: string;
  label: string;
  path?: string;
  /** 이 메뉴가 지원하는 액션 */
  actions: Action[];
  children?: MenuNode[];
  /** 섹션별 미세 권한 (예: 기업 수정 모달의 인터페이스/SSO 섹션) */
  sections?: { id: string; label: string }[];
  note?: string;
}

/** 전체 메뉴 트리 (권한 매트릭스의 행) */
const MENU_TREE: MenuNode[] = [
  { id: 'dashboard', label: '대시보드', path: '/dashboard/main', actions: ['read'] },
  {
    id: 'enterprise',
    label: '기업 관리',
    actions: [],
    children: [
      { id: 'tenant_list', label: '테넌트 관리', path: '/dashboard/enterprise/tenant_list', actions: ['read', 'create', 'update', 'delete', 'download'] },
      {
        id: 'ent_list',
        label: '기업 관리',
        path: '/dashboard/enterprise/ent_list',
        actions: ['read', 'update', 'delete', 'download'],
        sections: [
          { id: 'basic', label: '기본정보 섹션' },
          { id: 'van', label: 'VAN·펌뱅킹 섹션' },
          { id: 'interface', label: '인터페이스 정보' },
          { id: 'param', label: '파라미터 설정' },
          { id: 'sso', label: 'SSO 정보' },
        ],
        note: '★ 섹션별 미세 권한',
      },
      { id: 'ent_register', label: '기업 등록', path: '/dashboard/enterprise/ent_register', actions: ['create'] },
      { id: 'ent_users', label: '기업별 사용자 목록', path: '/dashboard/enterprise/ent_users', actions: ['read', 'update', 'download'] },
      { id: 'fund_status', label: '자금 현황 조회', path: '/dashboard/enterprise/fund_status', actions: ['read', 'download'], note: '★ 금융 민감 데이터' },
      { id: 'exception_management', label: '타행계좌 예외 관리', path: '/dashboard/enterprise/exception_management', actions: ['read', 'create', 'update', 'delete'] },
    ],
  },
  { id: 'admin', label: '관리자 관리', path: '/dashboard/admin', actions: ['read', 'create', 'update', 'delete'], note: '★ ① 슈퍼관리자 전용 (SoD)' },
  { id: 'permission_group', label: '권한 그룹 관리', path: '/dashboard/admin/permission_group', actions: ['read', 'create', 'update', 'delete'], note: '★ ① 슈퍼관리자 전용 (SoD)' },
  { id: 'menu_manage', label: '메뉴 관리', path: '/dashboard/menu_manage', actions: ['read', 'update'] },
  {
    id: 'content',
    label: '콘텐츠 관리',
    actions: [],
    children: [
      { id: 'notice', label: '공지사항 관리', path: '/dashboard/content/notice', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'banner', label: '배너 관리', path: '/dashboard/content/banner', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'faq', label: 'FAQ 관리', path: '/dashboard/content/faq', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'email_template', label: '이메일 템플릿 관리', path: '/dashboard/content/email_template', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'push_mgmt', label: 'PUSH 알림 관리', path: '/dashboard/content/push_mgmt', actions: ['read', 'create', 'update', 'delete'] },
    ],
  },
  {
    id: 'code',
    label: '코드 관리',
    actions: [],
    children: [
      { id: 'code_manage', label: '코드 관리', path: '/dashboard/code/code_manage', actions: ['read', 'create', 'update', 'delete', 'download'] },
      { id: 'message_manage', label: '메시지 관리', path: '/dashboard/code/message_manage', actions: ['read', 'create', 'update', 'delete', 'download'] },
    ],
  },
  {
    id: 'logs',
    label: '로그 관리',
    actions: [],
    children: [
      { id: 'work_history', label: '작업 이력', path: '/dashboard/logs/work_history', actions: ['read'] },
      { id: 'firmbanking_fail', label: '펌뱅킹 실패 현황', path: '/dashboard/logs/firmbanking_fail', actions: ['read'], note: '★ 금융 민감 데이터' },
    ],
  },
  { id: 'monitoring', label: '시스템 모니터링', path: '/dashboard/monitoring', actions: ['read'] },
  { id: 'statistics', label: '통계', path: '/dashboard/statistics', actions: ['read', 'download'] },
];

/** 권한 키 형식: "menuId.action" 또는 "menuId.section.update" */
type PermissionMap = Record<string, boolean>;

/** 권한 키 생성 헬퍼 */
const permKey = (menuId: string, action: Action | string, sectionId?: string) =>
  sectionId ? `${menuId}.${sectionId}.update` : `${menuId}.${action}`;

/** 권한 그룹별 디폴트 권한 매트릭스 (매트릭스 엑셀과 동일) */
const DEFAULT_PERMISSIONS: Record<Role, PermissionMap> = {
  SUPER: {}, // 모두 true로 동적 생성
  ENTERPRISE_INFO: {
    'dashboard.read': true,
    'tenant_list.read': true, 'tenant_list.create': true, 'tenant_list.update': true, 'tenant_list.delete': true, 'tenant_list.download': true,
    'ent_list.read': true, 'ent_list.update': true, 'ent_list.delete': true, 'ent_list.download': true,
    'ent_list.basic.update': true, 'ent_list.van.update': true, 'ent_list.interface.update': true, 'ent_list.param.update': true, 'ent_list.sso.update': true,
    'ent_register.create': true,
    'ent_users.read': true, 'ent_users.update': true, 'ent_users.download': true,
    // 자금 현황 조회는 제외 (가정 A)
    'exception_management.read': true, 'exception_management.create': true, 'exception_management.update': true, 'exception_management.delete': true,
  },
  ENTERPRISE_INFO_2: {
    'dashboard.read': true,
    'ent_list.read': true,
    // 기본정보, VAN·펌뱅킹은 readonly = 미체크
    'ent_list.interface.update': true,
    'ent_list.param.update': true,
    'ent_list.sso.update': true,
  },
  OTHER: {},
};

// SUPER 디폴트 자동 생성 (모든 권한 허용)
const initSuperPermissions = () => {
  const map: PermissionMap = {};
  const collect = (nodes: MenuNode[]) => {
    nodes.forEach((n) => {
      n.actions.forEach((a) => (map[permKey(n.id, a)] = true));
      n.sections?.forEach((s) => (map[permKey(n.id, '', s.id)] = true));
      if (n.children) collect(n.children);
    });
  };
  collect(MENU_TREE);
  return map;
};
DEFAULT_PERMISSIONS.SUPER = initSuperPermissions();

export default function PermissionGroupManagement() {
  const [selectedRole, setSelectedRole] = useState<Role>('ENTERPRISE_INFO');
  const [permissions, setPermissions] = useState<Record<Role, PermissionMap>>({ ...DEFAULT_PERMISSIONS });
  const [groupName, setGroupName] = useState<Record<Role, string>>({
    SUPER: ROLE_LABELS.SUPER,
    ENTERPRISE_INFO: ROLE_LABELS.ENTERPRISE_INFO,
    ENTERPRISE_INFO_2: ROLE_LABELS.ENTERPRISE_INFO_2,
    OTHER: ROLE_LABELS.OTHER,
  });
  const [groupDesc, setGroupDesc] = useState<Record<Role, string>>({
    SUPER: ROLE_DESCRIPTIONS.SUPER,
    ENTERPRISE_INFO: '기업 관리 메뉴 전체 (자금 현황 조회 제외)',
    ENTERPRISE_INFO_2: ROLE_DESCRIPTIONS.ENTERPRISE_INFO_2,
    OTHER: ROLE_DESCRIPTIONS.OTHER,
  });
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['enterprise']));
  const [hasChanges, setHasChanges] = useState(false);

  const currentPerms = permissions[selectedRole];

  /** 그룹별 사용자 수 (mock) */
  const userCount: Record<Role, number> = {
    SUPER: 2,
    ENTERPRISE_INFO: 8,
    ENTERPRISE_INFO_2: 3,
    OTHER: 0,
  };

  const toggleMenu = (id: string) => {
    const next = new Set(expandedMenus);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMenus(next);
  };

  const toggleAll = (expand: boolean) => {
    if (expand) {
      const all = new Set<string>();
      MENU_TREE.forEach((m) => {
        all.add(m.id);
        m.children?.forEach((c) => all.add(c.id));
      });
      setExpandedMenus(all);
    } else {
      setExpandedMenus(new Set());
    }
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], [key]: !prev[selectedRole][key] },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (window.confirm(`'${groupName[selectedRole]}' 권한 그룹의 변경사항을 저장하시겠습니까?\n소속 사용자 ${userCount[selectedRole]}명에게 즉시 반영됩니다.`)) {
      alert('저장되었습니다.');
      setHasChanges(false);
    }
  };

  const handleCopyNew = () => {
    alert('새 권한 그룹 생성 (현재 그룹 복사) - 추후 구현 예정');
  };

  const handleNewGroup = () => {
    alert('새 권한 그룹 생성 (빈 상태) - 추후 구현 예정');
  };

  /** 메뉴 행 렌더링 */
  const renderMenuRow = (node: MenuNode, depth: number = 0): React.ReactNode => {
    const hasChildren = !!node.children?.length;
    const hasSections = !!node.sections?.length;
    const isExpanded = expandedMenus.has(node.id);
    const isGroupHeader = depth === 0 && hasChildren;

    return (
      <React.Fragment key={node.id}>
        <tr className={`border-b border-border-gray ${isGroupHeader ? 'bg-blue-50/40' : 'hover:bg-bg-gray'}`}>
          <td className="px-4 py-2.5" style={{ paddingLeft: 16 + depth * 20 }}>
            <div className="flex items-center gap-2">
              {(hasChildren || hasSections) && (
                <button
                  onClick={() => toggleMenu(node.id)}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-text-sub" /> : <ChevronRight className="w-4 h-4 text-text-sub" />}
                </button>
              )}
              <span className={`text-body-sm ${isGroupHeader ? 'font-bold text-text-main' : 'text-text-body'}`}>
                {node.label}
              </span>
              {node.note && (
                <span className="text-caption text-amber-700 ml-1">{node.note}</span>
              )}
            </div>
          </td>
          {(['read', 'create', 'update', 'delete', 'download'] as Action[]).map((action) => {
            const supported = node.actions.includes(action);
            if (!supported) {
              return <td key={action} className="px-2 py-2 text-center text-text-disabled">-</td>;
            }
            const key = permKey(node.id, action);
            return (
              <td key={action} className="px-2 py-2 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#008d75] cursor-pointer"
                  checked={!!currentPerms[key]}
                  onChange={() => togglePermission(key)}
                  disabled={selectedRole === 'SUPER'}
                />
              </td>
            );
          })}
        </tr>

        {/* 섹션별 권한 (펼침 시 표시) */}
        {hasSections && isExpanded && node.sections!.map((section) => {
          const key = permKey(node.id, '', section.id);
          return (
            <tr key={section.id} className="border-b border-border-gray bg-yellow-50/40">
              <td className="py-2" style={{ paddingLeft: 16 + (depth + 1) * 20 + 18 }}>
                <span className="text-caption text-text-body">└ {section.label} <span className="text-text-sub">(수정 권한)</span></span>
              </td>
              <td className="px-2 py-2 text-center text-text-disabled">-</td>
              <td className="px-2 py-2 text-center text-text-disabled">-</td>
              <td className="px-2 py-2 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#008d75] cursor-pointer"
                  checked={!!currentPerms[key]}
                  onChange={() => togglePermission(key)}
                  disabled={selectedRole === 'SUPER'}
                />
              </td>
              <td className="px-2 py-2 text-center text-text-disabled">-</td>
              <td className="px-2 py-2 text-center text-text-disabled">-</td>
            </tr>
          );
        })}

        {/* 하위 메뉴 (펼침 시 표시) */}
        {hasChildren && isExpanded && node.children!.map((child) => renderMenuRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <PageLayout>
      {/* 상단 안내 + 액션 버튼 */}
      <div className="bg-white border border-border-gray rounded-lg p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-title-sm font-bold text-text-main">권한 그룹 관리</h3>
              <p className="text-body-sm text-text-sub mt-0.5">권한 그룹별로 접근 가능한 메뉴와 액션을 정의합니다. 저장 시 소속 사용자 전원에게 즉시 반영됩니다.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyNew}>
              <Copy className="w-3.5 h-3.5 mr-1" />
              복사해서 새 그룹
            </Button>
            <Button variant="primary" size="sm" onClick={handleNewGroup}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              새 그룹
            </Button>
          </div>
        </div>
      </div>

      {/* 그룹 선택/정보 */}
      <div className="bg-white border border-border-gray rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-body-sm font-bold text-text-main">권한 그룹</label>
          <Select
            width="lg"
            value={selectedRole}
            onChange={(e) => {
              if (hasChanges && !window.confirm('저장하지 않은 변경사항이 있습니다. 그래도 이동하시겠습니까?')) return;
              setSelectedRole(e.target.value as Role);
              setHasChanges(false);
            }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_NUMBERS[r]} {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-caption font-semibold ${ROLE_BADGE_COLORS[selectedRole]}`}>
            {ROLE_NUMBERS[selectedRole]} {ROLE_LABELS[selectedRole]}
          </span>
          <span className="text-caption text-text-sub">
            소속 사용자: <strong className="text-text-main">{userCount[selectedRole]}명</strong>
          </span>
          {selectedRole === 'SUPER' && (
            <span className="inline-flex items-center gap-1 text-caption text-amber-700 ml-auto">
              <AlertCircle className="w-3.5 h-3.5" />
              슈퍼관리자 권한은 변경 불가
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-caption text-text-sub mb-1">그룹명</label>
            <input
              type="text"
              value={groupName[selectedRole]}
              onChange={(e) => setGroupName({ ...groupName, [selectedRole]: e.target.value })}
              className="w-full px-3 py-2 border border-border-input rounded-lg text-body-sm focus:border-primary outline-none transition-colors disabled:bg-gray-50"
              disabled={selectedRole === 'SUPER'}
            />
          </div>
          <div>
            <label className="block text-caption text-text-sub mb-1">설명</label>
            <input
              type="text"
              value={groupDesc[selectedRole]}
              onChange={(e) => setGroupDesc({ ...groupDesc, [selectedRole]: e.target.value })}
              className="w-full px-3 py-2 border border-border-input rounded-lg text-body-sm focus:border-primary outline-none transition-colors disabled:bg-gray-50"
              disabled={selectedRole === 'SUPER'}
            />
          </div>
        </div>
      </div>

      {/* 권한 매트릭스 */}
      <div className="bg-white border border-border-gray rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3 border-b border-border-gray bg-bg-muted">
          <h4 className="text-body font-bold text-text-main">메뉴 × 액션 권한</h4>
          <div className="flex gap-3 text-caption">
            <button onClick={() => toggleAll(true)} className="text-primary hover:underline font-medium">전체 펼치기</button>
            <span className="text-border-input">|</span>
            <button onClick={() => toggleAll(false)} className="text-primary hover:underline font-medium">전체 접기</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-gray border-b border-border-gray text-text-body">
                <th className="px-4 py-2.5 text-body-sm font-semibold">메뉴</th>
                <th className="px-2 py-2.5 text-body-sm font-semibold text-center w-20">조회</th>
                <th className="px-2 py-2.5 text-body-sm font-semibold text-center w-20">등록</th>
                <th className="px-2 py-2.5 text-body-sm font-semibold text-center w-20">수정</th>
                <th className="px-2 py-2.5 text-body-sm font-semibold text-center w-20">삭제</th>
                <th className="px-2 py-2.5 text-body-sm font-semibold text-center w-24">다운로드</th>
              </tr>
            </thead>
            <tbody>
              {MENU_TREE.map((node) => renderMenuRow(node))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-border-gray bg-bg-muted text-caption text-text-sub flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>💡 노란색 행: 섹션별 미세 권한 (펼치기로 표시)</span>
            <span>· 회색 - : 해당 액션 미지원</span>
          </div>
          {hasChanges && (
            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              저장되지 않은 변경사항
            </span>
          )}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="md" onClick={() => {
          setPermissions({ ...DEFAULT_PERMISSIONS });
          setHasChanges(false);
        }}>초기화</Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={!hasChanges || selectedRole === 'SUPER'}
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          저장
        </Button>
      </div>
    </PageLayout>
  );
}
