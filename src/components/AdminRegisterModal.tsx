import React, { useState, useEffect } from 'react';
import { X, User, Shield, Lock, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminUser {
  id: string;
  loginId: string;
  name: string;
  role: 'SUPER' | 'ENTERPRISE' | 'SYSTEM' | 'OPERATION' | 'VIEWER';
  roleLabel: string;
  isUsed: boolean;
  otpStatus: 'REGISTERED' | 'UNREGISTERED';
  createdAt: string;
}

interface AdminRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (admin: AdminUser) => void;
  adminToEdit: AdminUser | null;
}

export default function AdminRegisterModal({ isOpen, onClose, onSave, adminToEdit }: AdminRegisterModalProps) {
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    loginId: '',
    role: 'VIEWER',
    isUsed: true
  });
  
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (adminToEdit) {
      setFormData(adminToEdit);
    } else {
      setFormData({
        name: '',
        loginId: '',
        role: 'VIEWER',
        isUsed: true
      });
    }
    setIsSuccess(false);
  }, [adminToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const roleLabels = {
      SUPER: '슈퍼관리자',
      ENTERPRISE: '기업관리자',
      SYSTEM: '시스템관리자',
      OPERATION: '운영관리자',
      VIEWER: '조회자'
    };

    const newAdmin: AdminUser = {
      id: formData.id || '',
      loginId: formData.loginId || '',
      name: formData.name || '',
      role: (formData.role as any) || 'VIEWER',
      roleLabel: roleLabels[(formData.role as 'SUPER' | 'ENTERPRISE' | 'SYSTEM' | 'OPERATION' | 'VIEWER') || 'VIEWER'],
      isUsed: formData.isUsed !== undefined ? formData.isUsed : true,
      otpStatus: formData.otpStatus || 'UNREGISTERED',
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0]
    };

    onSave(newAdmin);
    setIsSuccess(true);
    
    // Auto close after 1.5s if successful registration
    if (!adminToEdit) {
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0 bg-white">
              <h3 className="font-semibold text-[16px] text-[#191F28]">{adminToEdit ? '관리자 정보 수정' : '신규 관리자 등록'}</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">X</button>
            </div>

            <div className="p-6">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#008d7510] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-[#008d75]" />
                  </div>
                  <div>
                    <h4 className="text-[18px] font-bold text-gray-900">
                      {adminToEdit ? '수정이 완료되었습니다.' : '임시 비밀번호가 발송되었습니다.'}
                    </h4>
                    <p className="text-[14px] text-gray-500 mt-1">
                      {adminToEdit 
                        ? '정보가 성공적으로 업데이트 되었습니다.' 
                        : `${formData.loginId} 주소로 임시 비밀번호가 전송되었습니다.`}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-gray-700">이름</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#008d75] transition-all"
                        placeholder="이름을 입력하세요"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-gray-700">이메일(아이디) (임시 비밀번호 발송)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="email" 
                        readOnly={!!adminToEdit}
                        className={`w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-[14px] outline-none transition-all ${adminToEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white focus:border-[#008d75]'}`}
                        placeholder="example@email.com"
                        value={formData.loginId}
                        onChange={e => setFormData({...formData, loginId: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-gray-700">권한 등급 선택</label>
                    <div className="grid grid-cols-1 gap-2">
                       {[
                         { id: 'SUPER', label: '슈퍼관리자' },
                         { id: 'ENTERPRISE', label: '기업관리자' },
                         { id: 'SYSTEM', label: '시스템관리자' },
                         { id: 'OPERATION', label: '운영관리자' },
                         { id: 'VIEWER', label: '조회자' }
                       ].map(role => (
                         <label key={role.id} className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${formData.role === role.id ? 'border-[#008d75] bg-[#008d7508]' : 'border-gray-200 hover:bg-gray-50'}`}>
                           <input 
                             type="radio" 
                             name="role" 
                             className="w-4 h-4 text-[#008d75] focus:ring-0 accent-[#008d75]" 
                             checked={formData.role === role.id}
                             onChange={() => setFormData({...formData, role: role.id as any})}
                           />
                           <div className="flex flex-col">
                             <span className={`text-[13px] font-bold ${formData.role === role.id ? 'text-[#008d75]' : 'text-gray-700'}`}>{role.label}</span>
                           </div>
                         </label>
                       ))}
                    </div>
                  </div>

                  {adminToEdit && (
                    <div className="pt-2">
                       <label className="block text-[13px] font-bold text-gray-700 mb-2">계정 사용 활성화</label>
                       <div className="flex items-center gap-6">
                         <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="radio" 
                             name="isUsed"
                             className="w-4 h-4 text-[#008d75] focus:ring-[#008d75]" 
                             checked={formData.isUsed === true}
                             onChange={() => setFormData({...formData, isUsed: true})}
                           />
                           <span className="text-[13px] text-gray-700 font-medium">사용</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="radio" 
                             name="isUsed"
                             className="w-4 h-4 text-[#008d75] focus:ring-[#008d75]" 
                             checked={formData.isUsed === false}
                             onChange={() => setFormData({...formData, isUsed: false})}
                           />
                           <span className="text-[13px] text-gray-700 font-medium">미사용</span>
                         </label>
                       </div>
                    </div>
                  )}



                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-[14px] font-bold hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-2.5 bg-[#008d75] text-white rounded-lg text-[14px] font-bold hover:bg-[#007a65] transition-colors shadow-sm"
                    >
                      {adminToEdit ? '수정 완료' : '등록'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
