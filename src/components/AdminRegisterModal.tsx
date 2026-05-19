import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui';
import { Role, ROLES, ROLE_LABELS } from '../types/auth';

interface AdminUser {
  id: number;
  loginId: string;
  name: string;
  role: Role;
  isUsed: boolean;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (admin: AdminUser) => void;
  adminToEdit: AdminUser | null;
}

export default function AdminRegisterModal({ isOpen, onClose, onSave, adminToEdit }: Props) {
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '', loginId: '', role: 'OTHER', isUsed: true,
  });

  useEffect(() => {
    if (adminToEdit) setFormData(adminToEdit);
    else setFormData({ name: '', loginId: '', role: 'OTHER', isUsed: true });
  }, [adminToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = (formData.role as Role) || 'OTHER';
    onSave({
      id: formData.id ?? 0,
      loginId: formData.loginId || '',
      name: formData.name || '',
      role,
      isUsed: formData.isUsed ?? true,
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0 bg-white">
              <h3 className="font-semibold text-[16px] text-[#191F28]">{adminToEdit ? '관리자 정보 수정' : '관리자 등록'}</h3>
              <button onClick={onClose} className="p-1 hover:bg-[#F2F4F6] rounded-full transition-colors">
                <X className="w-5 h-5 text-[#8B95A1]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#4E5968]">이름</label>
                <input required type="text"
                  className="w-full px-3 py-2.5 bg-white border border-[#D1D6DB] rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-colors"
                  placeholder="이름 입력" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#4E5968]">이메일(아이디)</label>
                <input required type="email" readOnly={!!adminToEdit}
                  className={`w-full px-3 py-2.5 border border-[#D1D6DB] rounded-lg text-[14px] outline-none transition-colors ${adminToEdit ? 'bg-[#F2F4F6] text-[#8B95A1] cursor-not-allowed' : 'bg-white focus:border-[#008d75]'}`}
                  placeholder="email@email.com" value={formData.loginId}
                  onChange={e => setFormData({ ...formData, loginId: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#4E5968]">권한 그룹</label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map(roleId => {
                    const isSelected = formData.role === roleId;
                    return (
                      <label key={roleId}
                        className={`flex items-center gap-3 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-[#008d75] bg-[#008d7508]' : 'border-[#E5E8EB] hover:bg-[#F9FAFB]'}`}>
                        <input type="radio" name="role" className="w-4 h-4 accent-[#008d75]"
                          checked={isSelected} onChange={() => setFormData({ ...formData, role: roleId })} />
                        <span className={`text-[14px] font-medium ${isSelected ? 'text-[#008d75]' : 'text-[#4E5968]'}`}>{ROLE_LABELS[roleId]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {adminToEdit && (
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-[#4E5968]">사용여부</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isUsed" className="w-4 h-4 accent-[#008d75]"
                        checked={formData.isUsed === true} onChange={() => setFormData({ ...formData, isUsed: true })} />
                      <span className="text-[14px] text-[#4E5968]">사용</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isUsed" className="w-4 h-4 accent-[#008d75]"
                        checked={formData.isUsed === false} onChange={() => setFormData({ ...formData, isUsed: false })} />
                      <span className="text-[14px] text-[#4E5968]">미사용</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" size="md" fullWidth onClick={onClose}>취소</Button>
                <Button type="submit" variant="primary" size="md" fullWidth>{adminToEdit ? '수정' : '등록'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
