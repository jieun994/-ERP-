import React, { useState } from 'react';
import { Shield, User, AlertCircle, Mail, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminRegisterModal from './AdminRegisterModal';
import { Button, FilterBar, DataTable, StatusBadge, PageLayout, Select, Input } from './ui';

interface AdminUser {
  id: string;
  loginId: string;
  name: string;
  role: 'SUPER' | 'ENTERPRISE' | 'SYSTEM' | 'OPERATION' | 'VIEWER';
  roleLabel: string;
  isUsed: boolean;
  createdAt: string;
  otpStatus: 'REGISTERED' | 'UNREGISTERED';
}

const mockAdmins: AdminUser[] = [
  { 
    id: '1', 
    loginId: 'admin_toss@example.com', 
    name: '김토스', 
    role: 'SUPER', 
    roleLabel: '슈퍼관리자',
    isUsed: true,
    createdAt: '2024-03-01',
    otpStatus: 'REGISTERED',
  },
  {
    id: '2',
    loginId: 'eng_kim@example.com',
    name: '박엔지',
    role: 'SYSTEM',
    roleLabel: '시스템관리자',
    isUsed: true,
    createdAt: '2024-03-15',
    otpStatus: 'REGISTERED',
  },
  {
    id: '3',
    loginId: 'viewer_lee@example.com',
    name: '이조회',
    role: 'VIEWER',
    roleLabel: '조회자',
    isUsed: false,
    createdAt: '2024-04-10',
    otpStatus: 'UNREGISTERED',
  },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredAdmins = admins.filter(admin => {
    const matchQuery = admin.name.includes(searchQuery) || admin.loginId.includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' ? true : statusFilter === 'USED' ? admin.isUsed === true : admin.isUsed === false;
    const matchRole = roleFilter === 'ALL' ? true : admin.role === roleFilter;
    return matchQuery && matchStatus && matchRole;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAdmins.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAdmins.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(idx => idx !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('사용여부를 변경할 관리자를 선택해주세요.');
      return;
    }
    if (window.confirm(`선택한 관리자 ${selectedIds.length}명의 사용여부를 변경하시겠습니까?`)) {
      setAdmins(admins.map(a => 
        selectedIds.includes(a.id) ? { ...a, isUsed: !a.isUsed } : a
      ));
      setSelectedIds([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 관리자를 선택해주세요.');
      return;
    }
    if (window.confirm(`선택한 관리자 ${selectedIds.length}명을 삭제하시겠습니까?`)) {
      setAdmins(admins.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
    }
  };

  const handleToggleStatus = (id: string) => {
    setAdmins(admins.map(a => 
      a.id === id ? { ...a, isUsed: !a.isUsed } : a
    ));
  };

  return (
    <PageLayout>
      {/* Search Area */}
      <FilterBar
        onSearch={() => {}}
        onReset={() => { setSearchQuery(''); setStatusFilter('ALL'); setRoleFilter('ALL'); }}
      >
        <FilterBar.Field label="검색어">
          <Input
            type="text"
            placeholder="이름 또는 이메일 입력"
            width="lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FilterBar.Field>
        <FilterBar.Field label="권한 등급">
          <Select
            width="lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">전체</option>
            <option value="SUPER">슈퍼관리자</option>
            <option value="ENTERPRISE">기업관리자</option>
            <option value="SYSTEM">시스템관리자</option>
            <option value="OPERATION">운영관리자</option>
            <option value="VIEWER">조회자</option>
          </Select>
        </FilterBar.Field>
        <FilterBar.Field label="사용여부">
          <Select
            width="md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">전체</option>
            <option value="USED">사용</option>
            <option value="UNUSED">미사용</option>
          </Select>
        </FilterBar.Field>
      </FilterBar>

      {/* Grid Controls */}
      <DataTable.Controls total={filteredAdmins.length}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setEditAdmin(null); setIsModalOpen(true); }}
        >등록</Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={selectedIds.length !== 1}
          onClick={() => {
            if (selectedIds.length !== 1) { alert('수정할 관리자를 1명 선택해주세요.'); return; }
            const admin = admins.find(a => a.id === selectedIds[0]);
            if (admin) { setEditAdmin(admin); setIsModalOpen(true); }
          }}
        >수정</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleBatchDelete}>삭제</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleBatchToggleUse}>사용여부 변경</Button>
        <Button variant="ghost" size="sm">엑셀 다운로드</Button>
      </DataTable.Controls>

      {/* Grid */}
      <div className="bg-white border border-border-gray rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-center w-12 border-r border-border-gray">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" 
                     checked={selectedIds.length === filteredAdmins.length && filteredAdmins.length > 0}
                     onChange={toggleSelectAll}
                   />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">관리자명</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">이메일(아이디)</th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">권한 등급</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center border-r border-border-gray w-32">사용 여부</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-40">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  className={`h-[52px] hover:bg-bg-gray transition-colors cursor-pointer ${selectedIds.includes(admin.id) ? 'bg-primary/5' : ''}`}
                  onClick={() => toggleSelect(admin.id)}
                  onDoubleClick={() => {
                    setSelectedIds([admin.id]);
                    const found = admins.find(a => a.id === admin.id);
                    if (found) { setEditAdmin(found); setIsModalOpen(true); }
                  }}
                >
                  <td className="px-4 text-center border-r border-border-gray">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]" 
                      checked={selectedIds.includes(admin.id)}
                      onChange={() => toggleSelect(admin.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 text-body text-text-main font-medium border-r border-border-gray">{admin.name}</td>
                  <td className="px-4 text-body text-text-body border-r border-border-gray">{admin.loginId}</td>
                  <td className="px-4 border-r border-border-gray">
                    <span className={`text-body-sm font-medium ${admin.role === 'SUPER' ? 'text-red-500' : admin.role === 'SYSTEM' ? 'text-blue-600' : admin.role === 'ENTERPRISE' ? 'text-primary' : admin.role === 'OPERATION' ? 'text-emerald-700' : 'text-text-sub'}`}>
                      {admin.roleLabel}
                    </span>
                  </td>
                  <td className="px-4 text-center border-r border-border-gray">
                    <StatusBadge status={admin.isUsed ? 'ON' : 'OFF'} />
                  </td>
                  <td className="px-4 text-body-sm text-text-sub font-mono text-center">{admin.createdAt}</td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-text-sub text-body">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Register/Edit Modal */}
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
