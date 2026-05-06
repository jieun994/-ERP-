import React, { useState } from 'react';
import { Search, Download, Plus, MoreVertical, Shield, User, Filter, AlertCircle, Mail, RotateCcw, Trash2, Home, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminRegisterModal from './AdminRegisterModal';

interface AdminUser {
  id: string;
  loginId: string;
  name: string;
  role: 'BUSINESS' | 'ENGINEER' | 'VIEWER';
  roleLabel: string;
  isUsed: boolean;
  createdAt: string;
}

const mockAdmins: AdminUser[] = [
  { 
    id: '1', 
    loginId: 'admin_toss@example.com', 
    name: '김토스', 
    role: 'BUSINESS', 
    roleLabel: '기업등록자(현업)', 
    isUsed: true, 
    createdAt: '2024-03-01'
  },
  { 
    id: '2', 
    loginId: 'eng_kim@example.com', 
    name: '박엔지', 
    role: 'ENGINEER', 
    roleLabel: '기업인터페이스 설정자(엔지니어)', 
    isUsed: true, 
    createdAt: '2024-03-15'
  },
  { 
    id: '3', 
    loginId: 'viewer_lee@example.com', 
    name: '이조회', 
    role: 'VIEWER', 
    roleLabel: '조회자', 
    isUsed: false, 
    createdAt: '2024-04-10'
  },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredAdmins = admins.filter(admin => {
    const matchQuery = admin.name.includes(searchQuery) || admin.loginId.includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' ? true : statusFilter === 'USED' ? admin.isUsed === true : admin.isUsed === false;
    return matchQuery && matchStatus;
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
    <div className="w-full space-y-0 pb-20">
      {/* Search Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8">
        <div className="flex flex-wrap items-center justify-start gap-x-12 gap-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">검색어</span>
            <input 
              type="text" 
              placeholder="이름 또는 이메일 입력" 
              className="w-80 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">사용여부</span>
            <select 
              className="w-48 h-[40px] px-4 bg-white border border-gray-300 rounded-lg text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">전체</option>
              <option value="USED">사용</option>
              <option value="UNUSED">미사용</option>
            </select>
          </div>
          <div className="flex-1 flex justify-end gap-3">
            <button className="h-[40px] px-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap">
              초기화
            </button>
            <button className="h-[40px] px-10 bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-bold transition-colors shadow-sm whitespace-nowrap">
              조회하기
            </button>
          </div>
        </div>
      </div>

      {/* Grid Controls (Total count and Buttons) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="text-[14px]">
          <span className="text-[#191F28]">총 </span>
          <span className="text-[#008d75] font-bold">{filteredAdmins.length.toLocaleString()}</span>
          <span className="text-[#191F28]"> 건</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setEditAdmin(null);
              setIsModalOpen(true);
            }}
            className="h-[32px] bg-[#008d75] hover:bg-black text-white px-4 rounded-md text-[13px] font-medium transition-colors shadow-sm"
          >
             등록
          </button>
          <button 
            onClick={() => {
              if (selectedIds.length !== 1) {
                alert('수정할 관리자를 1명 선택해주세요.');
                return;
              }
              const admin = admins.find(a => a.id === selectedIds[0]);
              if (admin) {
                setEditAdmin(admin);
                setIsModalOpen(true);
              }
            }}
            className="h-[32px] border border-[#D1D6DB] px-4 rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors flex items-center justify-center shadow-sm"
          >
            수정
          </button>
          <button 
            onClick={handleBatchDelete}
            className="h-[32px] border border-[#D1D6DB] px-4 rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors flex items-center justify-center shadow-sm"
          >삭제</button>
          <button className="h-[32px] border border-[#D1D6DB] px-4 rounded-md text-[13px] font-medium hover:bg-[#F9FAFB] bg-white text-[#333333] transition-colors flex items-center justify-center shadow-sm">
            엑셀 다운로드
          </button>
          
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center w-12 border-r border-[#E5E8EB]">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" 
                     checked={selectedIds.length === filteredAdmins.length && filteredAdmins.length > 0}
                     onChange={toggleSelectAll}
                   />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">관리자명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">이메일(아이디)</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">권한 등급</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-32">사용 여부</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-40">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className={`h-[52px] hover:bg-[#F9FAFB] transition-colors ${selectedIds.includes(admin.id) ? 'bg-[#008d7508]' : ''}`}>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]" 
                      checked={selectedIds.includes(admin.id)}
                      onChange={() => toggleSelect(admin.id)}
                    />
                  </td>
                  <td className="px-4 text-[14px] text-[#191F28] font-medium border-r border-[#E5E8EB]">{admin.name}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{admin.loginId}</td>
                  <td className="px-4 border-r border-[#E5E8EB]">
                    <span className={`text-[13px] font-medium flex items-center gap-1.5 ${admin.role === 'BUSINESS' ? 'text-[#008d75]' : admin.role === 'ENGINEER' ? 'text-emerald-700' : 'text-[#8B95A1]'}`}>
                      <Shield className="w-3.5 h-3.5" />
                      {admin.roleLabel}
                    </span>
                  </td>
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <span className={`text-[14px] font-semibold ${admin.isUsed ? 'text-[#008d75]' : 'text-[#8B95A1]'}`}>
                      {admin.isUsed ? '사용' : '미사용'}
                    </span>
                  </td>
                  <td className="px-4 text-[13px] text-[#8B95A1] font-mono text-center">{admin.createdAt}</td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-[#8B95A1] text-[14px]">
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
    </div>
  );
}
