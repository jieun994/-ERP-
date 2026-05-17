import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Copy, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, PageLayout, Select, ConfirmModal } from './ui';
import { Role, ROLES, ROLE_LABELS } from '../types/auth';

type Action = 'read' | 'create' | 'update' | 'delete' | 'download';

interface MenuNode {
  id: string;
  label: string;
  actions: Action[];
  children?: MenuNode[];
  sections?: { id: string; label: string }[];
}

const MENU_TREE: MenuNode[] = [
  { id: 'dashboard', label: '대시보드', actions: ['read'] },
  {
    id: 'enterprise', label: '기업 관리', actions: [],
    children: [
      { id: 'tenant_list', label: '테넌트 관리', actions: ['read', 'create', 'update', 'delete', 'download'] },
      {
        id: 'ent_list', label: '기업 관리', actions: ['read', 'update', 'delete', 'download'],
        sections: [
          { id: 'basic', label: '기본정보' },
          { id: 'van', label: 'VAN·펌뱅킹' },
          { id: 'interface', label: '인터페이스' },
          { id: 'param', label: '파라미터' },
          { id: 'sso', label: 'SSO' },
        ],
      },
      { id: 'ent_register', label: '기업 등록', actions: ['create'] },
      { id: 'ent_users', label: '기업별 사용자 목록', actions: ['read', 'update', 'download'] },
      { id: 'fund_status', label: '자금 현황 조회', actions: ['read', 'download'] },
      { id: 'exception_management', label: '타행계좌 예외 관리', actions: ['read', 'create', 'update', 'delete'] },
    ],
  },
  { id: 'admin', label: '관리자 관리', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'permission_group', label: '권한 그룹 관리', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'menu_manage', label: '메뉴 관리', actions: ['read', 'update'] },
  {
    id: 'content', label: '콘텐츠 관리', actions: [],
    children: [
      { id: 'notice', label: '공지사항', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'banner', label: '배너', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'faq', label: 'FAQ', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'email_template', label: '이메일 템플릿', actions: ['read', 'create', 'update', 'delete'] },
      { id: 'push_mgmt', label: 'PUSH 알림', actions: ['read', 'create', 'update', 'delete'] },
    ],
  },
  {
    id: 'code', label: '코드 관리', actions: [],
    children: [
      { id: 'code_manage', label: '코드 관리', actions: ['read', 'create', 'update', 'delete', 'download'] },
      { id: 'message_manage', label: '메시지 관리', actions: ['read', 'create', 'update', 'delete', 'download'] },
    ],
  },
  {
    id: 'logs', label: '로그 관리', actions: [],
    children: [
      { id: 'work_history', label: '작업 이력', actions: ['read'] },
      { id: 'firmbanking_fail', label: '펌뱅킹 실패 현황', actions: ['read'] },
    ],
  },
  { id: 'monitoring', label: '시스템 모니터링', actions: ['read'] },
  { id: 'statistics', label: '통계', actions: ['read', 'download'] },
];

type PermissionMap = Record<string, boolean>;
const permKey = (menuId: string, action: string, sectionId?: string) =>
  sectionId ? `${menuId}.${sectionId}.update` : `${menuId}.${action}`;

const initSuper = (): PermissionMap => {
  const m: PermissionMap = {};
  const walk = (nodes: MenuNode[]) => nodes.forEach(n => {
    n.actions.forEach(a => (m[permKey(n.id, a)] = true));
    n.sections?.forEach(s => (m[permKey(n.id, '', s.id)] = true));
    if (n.children) walk(n.children);
  });
  walk(MENU_TREE);
  return m;
};

const DEFAULT_PERMISSIONS: Record<string, PermissionMap> = {
  SUPER: initSuper(),
  ENTERPRISE_INFO: {
    'dashboard.read': true,
    'tenant_list.read': true, 'tenant_list.create': true, 'tenant_list.update': true, 'tenant_list.delete': true, 'tenant_list.download': true,
    'ent_list.read': true, 'ent_list.update': true, 'ent_list.delete': true, 'ent_list.download': true,
    'ent_list.basic.update': true, 'ent_list.van.update': true, 'ent_list.interface.update': true, 'ent_list.param.update': true, 'ent_list.sso.update': true,
    'ent_register.create': true,
    'ent_users.read': true, 'ent_users.update': true, 'ent_users.download': true,
    'exception_management.read': true, 'exception_management.create': true, 'exception_management.update': true, 'exception_management.delete': true,
  },
  ENTERPRISE_INFO_2: {
    'dashboard.read': true,
    'ent_list.read': true,
    'ent_list.interface.update': true, 'ent_list.param.update': true, 'ent_list.sso.update': true,
  },
  OTHER: {},
};

interface Group {
  id: string;
  label: string;
  isBuiltIn: boolean;
}

const BUILT_IN_GROUPS: Group[] = ROLES.map(r => ({ id: r, label: ROLE_LABELS[r], isBuiltIn: true }));

export default function PermissionGroupManagement() {
  const [groups, setGroups] = useState<Group[]>(BUILT_IN_GROUPS);
  const [selectedId, setSelectedId] = useState<string>('ENTERPRISE_INFO');
  const [permissions, setPermissions] = useState<Record<string, PermissionMap>>({ ...DEFAULT_PERMISSIONS });
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['enterprise']));
  const [hasChanges, setHasChanges] = useState(false);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'blank' | 'copy'>('blank');
  const [newGroupName, setNewGroupName] = useState('');

  const currentGroup = groups.find(g => g.id === selectedId)!;
  const currentPerms = permissions[selectedId] || {};
  const isSuper = selectedId === 'SUPER';

  const toggleMenu = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [selectedId]: { ...(prev[selectedId] || {}), [key]: !(prev[selectedId] || {})[key] },
    }));
    setHasChanges(true);
  };

  const handleSwitchGroup = (id: string) => {
    if (hasChanges && !window.confirm('저장하지 않은 변경사항이 있습니다. 이동하시겠습니까?')) return;
    setSelectedId(id);
    setHasChanges(false);
  };

  const openAddBlank = () => {
    setAddMode('blank');
    setNewGroupName('');
    setShowAddModal(true);
  };
  const openAddCopy = () => {
    setAddMode('copy');
    setNewGroupName(`${currentGroup.label} 복사본`);
    setShowAddModal(true);
  };

  const doAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) { alert('그룹명을 입력해주세요.'); return; }
    if (groups.some(g => g.label === name)) { alert('이미 존재하는 그룹명입니다.'); return; }

    const newId = `CUSTOM_${Date.now()}`;
    const newPerms: PermissionMap = addMode === 'copy' ? { ...currentPerms } : {};

    setGroups([...groups, { id: newId, label: name, isBuiltIn: false }]);
    setPermissions({ ...permissions, [newId]: newPerms });
    setSelectedId(newId);
    setHasChanges(addMode === 'blank' ? false : true);
    setShowAddModal(false);
  };

  const doDeleteGroup = () => {
    const next = groups.filter(g => g.id !== selectedId);
    const nextPerms = { ...permissions };
    delete nextPerms[selectedId];
    setGroups(next);
    setPermissions(nextPerms);
    setSelectedId(next[0]?.id || 'SUPER');
    setHasChanges(false);
    setShowDeleteConfirm(false);
  };

  const doSave = () => {
    setHasChanges(false);
    setShowSaveConfirm(false);
  };

  const renderRow = (node: MenuNode, depth = 0): React.ReactNode => {
    const hasChildren = !!node.children?.length;
    const hasSections = !!node.sections?.length;
    const isExpanded = expanded.has(node.id);

    return (
      <React.Fragment key={node.id}>
        <tr className="h-[44px] border-b border-[#E5E8EB] hover:bg-[#F2F9F7]">
          <td className="px-4 border-r border-[#E5E8EB]" style={{ paddingLeft: 16 + depth * 20 }}>
            <div className="flex items-center gap-1.5">
              {(hasChildren || hasSections) ? (
                <button onClick={() => toggleMenu(node.id)} className="p-0.5 hover:bg-[#E5E8EB] rounded shrink-0">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#8B95A1]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8B95A1]" />}
                </button>
              ) : <span className="w-4" />}
              <span className={`text-[14px] ${hasChildren ? 'font-semibold text-[#191F28]' : 'text-[#4E5968]'}`}>{node.label}</span>
            </div>
          </td>
          {(['read', 'create', 'update', 'delete', 'download'] as Action[]).map(action => {
            if (!node.actions.includes(action)) return <td key={action} className="px-2 text-center text-[#D1D6DB] border-r border-[#E5E8EB]">-</td>;
            const key = permKey(node.id, action);
            return (
              <td key={action} className="px-2 text-center border-r border-[#E5E8EB]">
                <input type="checkbox" className="w-4 h-4 accent-[#008d75] cursor-pointer disabled:cursor-not-allowed"
                  checked={!!currentPerms[key]} onChange={() => togglePermission(key)} disabled={isSuper} />
              </td>
            );
          })}
        </tr>

        {hasSections && isExpanded && node.sections!.map(section => {
          const key = permKey(node.id, '', section.id);
          return (
            <tr key={section.id} className="h-[40px] border-b border-[#E5E8EB] bg-[#FAFBFC]">
              <td className="px-4 border-r border-[#E5E8EB]" style={{ paddingLeft: 16 + (depth + 1) * 20 + 18 }}>
                <span className="text-[13px] text-[#8B95A1]">└ {section.label}</span>
              </td>
              <td className="px-2 text-center text-[#D1D6DB] border-r border-[#E5E8EB]">-</td>
              <td className="px-2 text-center text-[#D1D6DB] border-r border-[#E5E8EB]">-</td>
              <td className="px-2 text-center border-r border-[#E5E8EB]">
                <input type="checkbox" className="w-4 h-4 accent-[#008d75] cursor-pointer disabled:cursor-not-allowed"
                  checked={!!currentPerms[key]} onChange={() => togglePermission(key)} disabled={isSuper} />
              </td>
              <td className="px-2 text-center text-[#D1D6DB] border-r border-[#E5E8EB]">-</td>
              <td className="px-2 text-center text-[#D1D6DB] border-r border-[#E5E8EB]">-</td>
            </tr>
          );
        })}

        {hasChildren && isExpanded && node.children!.map(c => renderRow(c, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <PageLayout>
      <ConfirmModal
        open={showSaveConfirm}
        variant="primary"
        title="권한을 저장하시겠습니까?"
        description={`'${currentGroup.label}' 그룹의 권한이 즉시 적용됩니다.`}
        confirmLabel="저장"
        cancelLabel="취소"
        onConfirm={doSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
      <ConfirmModal
        open={showDeleteConfirm}
        variant="danger"
        title="그룹을 삭제하시겠습니까?"
        description={`'${currentGroup.label}' 그룹이 삭제됩니다. 소속된 관리자가 있는 경우 권한이 해제됩니다.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={doDeleteGroup}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* 그룹 추가 모달 */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] bg-white">
                <h3 className="font-semibold text-[16px] text-[#191F28]">
                  {addMode === 'copy' ? '그룹 복사' : '새 그룹 추가'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#F2F4F6] rounded-full">
                  <X className="w-5 h-5 text-[#8B95A1]" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-[#4E5968]">그룹명</label>
                  <input type="text" autoFocus value={newGroupName}
                    className="w-full px-3 py-2.5 border border-[#D1D6DB] rounded-lg text-[14px] outline-none focus:border-[#008d75]"
                    placeholder="예: 외부 협력사 담당자"
                    onChange={e => setNewGroupName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') doAddGroup(); }} />
                </div>
                {addMode === 'copy' && (
                  <p className="text-[13px] text-[#8B95A1]">
                    '{currentGroup.label}' 그룹의 권한을 그대로 복사한 뒤 수정할 수 있습니다.
                  </p>
                )}
                {addMode === 'blank' && (
                  <p className="text-[13px] text-[#8B95A1]">
                    빈 그룹으로 생성됩니다. 생성 후 권한을 체크박스로 설정하세요.
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="secondary" size="md" fullWidth onClick={() => setShowAddModal(false)}>취소</Button>
                  <Button type="button" variant="primary" size="md" fullWidth onClick={doAddGroup}>생성</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
      {/* 그룹 선택 + 그룹 액션 */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg p-5 shadow-sm flex items-center gap-3 flex-wrap">
        <label className="text-[13px] font-semibold text-[#4E5968]">권한 그룹</label>
        <Select value={selectedId} onChange={(e: any) => handleSwitchGroup(e.target.value)}>
          {groups.map(g => (<option key={g.id} value={g.id}>{g.label}</option>))}
        </Select>
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={openAddCopy}>
            <Copy className="w-3.5 h-3.5 mr-1 inline" />
            현재 그룹 복사
          </Button>
          <Button variant="ghost" size="sm" onClick={openAddBlank}>
            <Plus className="w-3.5 h-3.5 mr-1 inline" />
            새 그룹 추가
          </Button>
          {!currentGroup.isBuiltIn && (
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-1 inline" />
              그룹 삭제
            </Button>
          )}
        </div>
      </div>

      {/* 매트릭스 */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[44px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">메뉴</th>
                <th className="h-[44px] px-2 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-20">조회</th>
                <th className="h-[44px] px-2 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-20">등록</th>
                <th className="h-[44px] px-2 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-20">수정</th>
                <th className="h-[44px] px-2 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-20">삭제</th>
                <th className="h-[44px] px-2 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-24">다운로드</th>
              </tr>
            </thead>
            <tbody>{MENU_TREE.map(n => renderRow(n))}</tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="md" disabled={!hasChanges} onClick={() => {
          setPermissions({ ...permissions, [selectedId]: DEFAULT_PERMISSIONS[selectedId] || {} });
          setHasChanges(false);
        }}>초기화</Button>
        <Button variant="primary" size="md" disabled={!hasChanges || isSuper} onClick={() => setShowSaveConfirm(true)}>저장</Button>
      </div>
      </div>
    </PageLayout>
  );
}
