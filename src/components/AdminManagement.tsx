import React, { useState } from 'react';
import AdminRegisterModal from './AdminRegisterModal';
import { Button, FilterBar, DataTable, StatusBadge, PageLayout, Select, Input } from './ui';
import {
  Role,
  ROLES,
  ROLE_LABELS,
  ROLE_NUMBERS,
  ROLE_BADGE_COLORS,
  OTP_LABELS,
} from '../types/auth';

interface AdminUser {
  id: string;
  loginId: string;
  name: string;
  role: Role;
  roleLabel: string;
  isUsed: boolean;
  createdAt: string;
  otpStatus: 'REGISTERED' | 'UNREGISTERED';
}

const mockAdmins: AdminUser[] = [
  { id: '1', loginId: 'super@etribe.co.kr',      name: '김슈퍼', role: 'SUPER',             roleLabel: ROLE_LABELS.SUPER,             isUsed: true,  createdAt: '2026-01-15', otpStatus: 'REGISTERED'   },
  { id: '2', loginId: 'enterprise@etribe.co.kr', name: '이기업', role: 'ENTERPRISE_INFO',   roleLabel: ROLE_LABELS.ENTERPRISE_INFO,   isUsed: true,  createdAt: '2026-02-03', otpStatus: 'REGISTERED'   },
  { id: '3', loginId: 'interface@etribe.co.kr',  name: '박인터', role: 'ENTERPRISE_INFO_2', roleLabel: ROLE_LABELS.ENTERPRISE_INFO_2, isUsed: true,  createdAt: '2026-04-22', otpStatus: 'UNREGISTERED' },
  { id: '4', loginId: 'other@etribe.co.kr',      name: '최기타', role: 'OTHER',             roleLabel: ROLE_LABELS.OTHER,             isUsed: false, createdAt: '2026-05-10', otpStatus: 'REGISTERED'   },
  { id: '5', loginId: 'jung.dam@etribe.co.kr',   name: '정담당', role: 'ENTERPRISE_INFO',   roleLabel: ROLE_LABELS.ENTERPRISE_INFO,   isUsed: true,  createdAt: '2026-05-15', otpStatus: 'REGISTERED'   },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [otpFilter, setOtpFilter] = useState<'ALL' | 'REGISTERED' | 'UNREGISTERED'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredAdmins = admins.filter(admin => {
    const matchQuery = admin.name.includes(searchQuery) || admin.loginId.includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' ? true : statusFilter === 'USED' ? admin.isUsed === true : admin.isUsed === false;
    const matchRole = roleFilter === 'ALL' ? true : admin.role === roleFilter;
    const matchOtp = otpFilter === 'ALL' ? true : admin.otpStatus === otpFilter;
    return matchQuery && matchStatus && matchRole && matchOtp;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAdmins.length) setSelectedIds([]);
    else setSelectedIds(filteredAdmins.map(a => a.id));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(idx => idx !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBatchToggleUse = () => {
    if (selectedIds.length === 0) { alert('사용여부를 변경할 관리자를 선택해주세요.'); return; }
    if (window.confirm(`선택한 관리자 ${selectedIds.length}명의 사용여부를 변경하시겠습니까?`)) {
      setAdmins(admins.map(a => selectedIds.includes(a.id) ? { ...a, isUsed: !a.isUsed } : a));
      setSelectedIds([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) { alert('비활성화할 관리자를 선택해주세요.'); return; }
    if (window.confirm(`선택한 관리자 ${selectedIds.length}명을 비활성화 처리하시겠습니까? (소프트 삭제)`)) {
      setAdmins(admins.map(a => selectedIds.includes(a.id) ? { ...a, isUsed: false } : a));
      setSelectedIds([]);
    }
  };

  return (
    <PageLayout>
      <FilterBar
        onSearch={() => {}}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); setRoleFilter('ALL'); setOtpFilter('ALL'); }}
      >
        <FilterBar.Field label="검색어">
          <Input type="text" placeholder="이름 또는 이메일 입력" width="lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </FilterBar.Field>
        <FilterBar.Field label="권한 그룹">
          <Select width="lg" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'ALL' | Role)}>
            <option value="ALL">전체</option>
            {ROLES.map((r) => (<option key={r} value={r}>{ROLE_NUMBERS[r]} {ROLE_LABELS[r]}</option>))}
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="OTP 상태">
          <Select width="md" value={otpFilter} onChange={(e) => setOtpFilter(e.target.value as 'ALL' | 'REGISTERED' | 'UNREGISTERED')}>
            <option value="ALL">전체</option>
            <option value="REGISTERED">등록</option>
            <option value="UNREGISTERED">미등록</option>
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="사용여부">
          <Select width="md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">전체</option>
            <option value="USED">사용</option>
            <option value="UNUSED">미사용</option>
          </Select>
        </FilterBar.Field>
      </FilterBar>

      <DataTable.Controls total={filteredAdmins.length}>
        <Button variant="primary" size="sm" onClick={() => { setEditAdmin(null); setIsModalOpen(true); }}>등록</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length !== 1} onClick={() => {
          if (selectedIds.length !== 1) { alert('수정할 관리자를 1명 선택해주세요.'); return; }
          const admin = admins.find(a => a.id === selectedIds[0]);
          if (admin) { setEditAdmin(admin); setIsModalOpen(true); }
        }}>수정</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleBatchDelete}>삭제(비활성화)</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleBatchToggleUse}>사용여부 변경</Button>
        <Button variant="ghost" size="sm">엑셀 다운로드</Button>
      </DataTable.Controls>

      <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-center w-12 border-r border-border-gray">
                  <input type="checkbox" className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" checked={selectedIds.length === filteredAdmins.length && filteredAdmins.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">관리자명</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">이메일(아이디)</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">권한 그룹</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-32">OTP 상태</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-32">사용 여부</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-40">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className={`h-[52px] hover:bg-bg-gray transition-colors cursor-pointer ${selectedIds.includes(admin.id) ? 'bg-primary/5' : ''}`}
                  onClick={() => toggleSelect(admin.id)}
                  onDoubleClick={() => {
                    setSelectedIds([admin.id]);
                    const found = admins.find(a => a.id === admin.id);
                    if (found) { setEditAdmin(found); setIsModalOpen(true); }
                  }}>
                  <td className="px-4 text-center border-r border-border-gray">
                    <input type="checkbox" className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" checked={selectedIds.includes(admin.id)} onChange={() => toggleSelect(admin.id)} onClick={(e) => e.stopPropagation()} />
                  </td>
                  <td className="px-4 text-body text-text-main font-medium border-r border-border-gray">{admin.name}</td>
                  <td className="px-4 text-body text-text-body border-r border-border-gray">{admin.loginId}</td>
                  <td className="px-4 border-r border-border-gray">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-caption font-semibold ${ROLE_BADGE_COLORS[admin.role]}`}>
                      {ROLE_NUMBERS[admin.role]} {admin.roleLabel}
                    </span>
                  </td>
                  <td className="px-4 text-center border-r border-border-gray">
                    <StatusBadge status={OTP_LABELS[admin.otpStatus]} colorClass={admin.otpStatus === 'REGISTERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'} />
                  </td>
                  <td className="px-4 text-center border-r border-border-gray">
                    <StatusBadge status={admin.isUsed ? 'ON' : 'OFF'} />
                  </td>
                  <td className="px-4 text-body-sm text-text-sub font-mono text-center">{admin.createdAt}</td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr><td colSpan={7} className="py-20 text-center text-text-sub text-body">검색 결과가 없습니다.</td></tr>
              )}
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
            setAdmins([{ ...updated, id: String(admins.length + 1), createdAt: new Date().toISOString().split('T')[0] }, ...admins]);
          }
        }}
      />
    </PageLayout>
  );
}
