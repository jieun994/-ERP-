import React, { useState } from 'react';
import AdminRegisterModal from './AdminRegisterModal';
import { Button, FilterBar, DataTable, StatusBadge, PageLayout, Select, Input, ConfirmModal } from './ui';
import { Role, ROLES, ROLE_LABELS, ROLE_TEXT_COLORS, OTP_LABELS } from '../types/auth';

interface AdminUser {
  id: number;
  loginId: string;
  name: string;
  role: Role;
  isUsed: boolean;
  otpStatus: 'REGISTERED' | 'UNREGISTERED';
  createdAt: string;
}

const mockAdmins: AdminUser[] = [
  { id: 1, loginId: 'super@etribe.co.kr',      name: '김슈퍼', role: 'SUPER',             isUsed: true,  otpStatus: 'REGISTERED',   createdAt: '2026-01-15' },
  { id: 2, loginId: 'enterprise@etribe.co.kr', name: '이기업', role: 'ENTERPRISE_INFO',   isUsed: true,  otpStatus: 'REGISTERED',   createdAt: '2026-02-03' },
  { id: 3, loginId: 'interface@etribe.co.kr',  name: '박인터', role: 'ENTERPRISE_INFO_2', isUsed: true,  otpStatus: 'UNREGISTERED', createdAt: '2026-04-22' },
  { id: 4, loginId: 'other@etribe.co.kr',      name: '최기타', role: 'OTHER',             isUsed: false, otpStatus: 'REGISTERED',   createdAt: '2026-05-10' },
  { id: 5, loginId: 'jung.dam@etribe.co.kr',   name: '정담당', role: 'ENTERPRISE_INFO',   isUsed: true,  otpStatus: 'REGISTERED',   createdAt: '2026-05-15' },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPwResetConfirm, setShowPwResetConfirm] = useState(false);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? admins.map(a => a.id) : []);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const doToggleUse = () => {
    setAdmins(admins.map(a => selectedIds.includes(a.id) ? { ...a, isUsed: !a.isUsed } : a));
    setSelectedIds([]);
    setShowToggleConfirm(false);
  };

  const doDelete = () => {
    setAdmins(admins.map(a => selectedIds.includes(a.id) ? { ...a, isUsed: false } : a));
    setSelectedIds([]);
    setShowDeleteConfirm(false);
  };

  const doPasswordReset = () => {
    const targets = admins.filter(a => selectedIds.includes(a.id));
    const emails = targets.map(a => a.loginId).join('\n');
    alert(`임시 비밀번호가 발송되었습니다.\n\n${emails}`);
    setSelectedIds([]);
    setShowPwResetConfirm(false);
  };

  const handleOpenEdit = () => {
    const target = admins.find(a => a.id === selectedIds[0]);
    if (target) { setEditAdmin(target); setIsModalOpen(true); }
  };

  const handleRowClick = (admin: AdminUser) => {
    setEditAdmin(admin);
    setIsModalOpen(true);
  };

  return (
    <PageLayout>
      <ConfirmModal
        open={showToggleConfirm}
        variant="warning"
        title="사용여부를 변경하시겠습니까?"
        description="선택한 관리자의 사용여부 상태가 반전됩니다."
        confirmLabel="변경"
        cancelLabel="취소"
        onConfirm={doToggleUse}
        onCancel={() => setShowToggleConfirm(false)}
      />
      <ConfirmModal
        open={showDeleteConfirm}
        variant="danger"
        title="선택한 관리자를 삭제하시겠습니까?"
        description="비활성화 처리되며, 데이터는 보존됩니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={doDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <ConfirmModal
        open={showPwResetConfirm}
        variant="primary"
        title="비밀번호를 초기화하시겠습니까?"
        description={`선택한 관리자 ${selectedIds.length}명의 등록 이메일로 임시 비밀번호가 발송됩니다.`}
        confirmLabel="발송"
        cancelLabel="취소"
        onConfirm={doPasswordReset}
        onCancel={() => setShowPwResetConfirm(false)}
      />

      <FilterBar onSearch={() => {}} onReset={() => {}}>
        <FilterBar.Field label="검색어">
          <Input type="text" placeholder="이름 또는 이메일 입력" fullWidth />
        </FilterBar.Field>
        <FilterBar.Field label="권한 그룹">
          <Select fullWidth>
            <option value="ALL">전체</option>
            {ROLES.map(r => (<option key={r} value={r}>{ROLE_LABELS[r]}</option>))}
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="OTP">
          <Select fullWidth>
            <option value="ALL">전체</option>
            <option value="REGISTERED">등록</option>
            <option value="UNREGISTERED">미등록</option>
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="사용여부">
          <Select fullWidth>
            <option value="ALL">전체</option>
            <option value="use">사용</option>
            <option value="unused">미사용</option>
          </Select>
        </FilterBar.Field>
      </FilterBar>

      <DataTable.Controls total={admins.length}>
        <Button variant="primary" size="sm" onClick={() => { setEditAdmin(null); setIsModalOpen(true); }}>등록</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length !== 1} onClick={handleOpenEdit}>수정</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => setShowDeleteConfirm(true)}>삭제</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => setShowToggleConfirm(true)}>사용여부 변경</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => setShowPwResetConfirm(true)}>비밀번호 초기화</Button>
        <Button variant="ghost" size="sm" onClick={() => alert('엑셀 다운로드를 실행합니다.')}>엑셀 다운로드</Button>
      </DataTable.Controls>

      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center border-r border-[#E5E8EB] w-12">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={admins.length > 0 && selectedIds.length === admins.length} onChange={toggleSelectAll} />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">관리자명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">이메일(아이디)</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-48">권한 그룹</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-28">OTP</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-28">사용여부</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-36">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {admins.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-[14px] text-[#8B95A1]">조회된 관리자가 없습니다.</td></tr>
              ) : admins.map(admin => (
                <tr key={admin.id} onClick={() => handleRowClick(admin)}
                  className={`h-[52px] transition-colors cursor-pointer hover:bg-[#F2F9F7] ${selectedIds.includes(admin.id) ? 'bg-[#008d7508]' : 'bg-white'}`}>
                  <td className="px-4 text-center border-r border-[#E5E8EB]" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                      checked={selectedIds.includes(admin.id)} onChange={() => toggleSelect(admin.id)} />
                  </td>
                  <td className="px-4 text-[14px] font-medium text-[#191F28] border-r border-[#E5E8EB]">{admin.name}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{admin.loginId}</td>
                  <td className="px-4 border-r border-[#E5E8EB]">
                    <span className={`text-[14px] font-medium ${ROLE_TEXT_COLORS[admin.role]}`}>{ROLE_LABELS[admin.role]}</span>
                  </td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <StatusBadge status={OTP_LABELS[admin.otpStatus]}
                      colorClass={admin.otpStatus === 'REGISTERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'} />
                  </td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <StatusBadge status={admin.isUsed ? 'ON' : 'OFF'} />
                  </td>
                  <td className="px-4 text-[13px] text-center text-[#8B95A1] font-mono">{admin.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        adminToEdit={editAdmin}
        onSave={(updated) => {
          if (editAdmin) {
            setAdmins(admins.map(a => a.id === updated.id ? updated : a));
          } else {
            setAdmins([{ ...updated, id: admins.length + 1, createdAt: new Date().toISOString().split('T')[0] }, ...admins]);
          }
        }}
      />
    </PageLayout>
  );
}
