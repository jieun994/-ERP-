import React, { useState, useEffect } from 'react';
import { X, User, Shield, Lock, Mail, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui';
import {
  Role,
  ROLES,
  ROLE_LABELS,
  ROLE_NUMBERS,
  ROLE_BADGE_COLORS,
  ROLE_DESCRIPTIONS,
} from '../types/auth';

interface AdminUser {
  id: string;
  loginId: string;
  name: string;
  role: Role;
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
    name: '', loginId: '', role: 'OTHER', isUsed: true, otpStatus: 'UNREGISTERED',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPermissionPreview, setShowPermissionPreview] = useState(false);

  useEffect(() => {
    if (adminToEdit) setFormData(adminToEdit);
    else setFormData({ name: '', loginId: '', role: 'OTHER', isUsed: true, otpStatus: 'UNREGISTERED' });
    setIsSuccess(false);
    setShowPermissionPreview(false);
  }, [adminToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRole = (formData.role as Role) || 'OTHER';
    const newAdmin: AdminUser = {
      id: formData.id || '',
      loginId: formData.loginId || '',
      name: formData.name || '',
      role: selectedRole,
      roleLabel: ROLE_LABELS[selectedRole],
      isUsed: formData.isUsed !== undefined ? formData.isUsed : true,
      otpStatus: formData.otpStatus || 'UNREGISTERED',
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0]
    };
    onSave(newAdmin);
    setIsSuccess(true);
    if (!adminToEdit) setTimeout(() => onClose(), 1500);
    else onClose();
  };

  const handleOtpReset = () => {
    if (window.confirm(`${formData.name}님의 OTP를 초기화하시겠습니까?\n초기화 후 다음 로그인 시 재등록이 필요합니다.`)) {
      setFormData({ ...formData, otpStatus: 'UNREGISTERED' });
      alert('OTP가 초기화되었습니다.');
    }
  };

  const handlePasswordReset = () => {
    if (window.confirm(`${formData.name}님의 비밀번호를 초기화하시겠습니까?\n임시 비밀번호가 이메일로 발송됩니다.`)) {
      alert(`${formData.loginId} 주소로 임시 비밀번호가 발송되었습니다.`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
              <h3 className="font-semibold text-title-sm text-text-main">{adminToEdit ? '관리자 정보 수정' : '신규 관리자 등록'}</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-text-sub" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-title font-bold text-gray-900">
                      {adminToEdit ? '수정이 완료되었습니다.' : '임시 비밀번호가 발송되었습니다.'}
                    </h4>
                    <p className="text-body text-gray-500 mt-1">
                      {adminToEdit ? '정보가 성공적으로 업데이트 되었습니다.' : `${formData.loginId} 주소로 임시 비밀번호가 전송되었습니다.`}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-body-sm font-bold text-gray-700">이름</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input required type="text" className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-body outline-none focus:border-primary transition-all"
                        placeholder="이름을 입력하세요" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-body-sm font-bold text-gray-700">
                      이메일(아이디) {!adminToEdit && <span className="font-normal text-text-sub">(임시 비밀번호 발송)</span>}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input required type="email" readOnly={!!adminToEdit}
                        className={`w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-body outline-none transition-all ${adminToEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white focus:border-primary'}`}
                        placeholder="email@etribe.co.kr" value={formData.loginId} onChange={e => setFormData({...formData, loginId: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-body-sm font-bold text-gray-700">권한 그룹 선택</label>
                      <button type="button" onClick={() => setShowPermissionPreview(!showPermissionPreview)}
                        className="text-caption text-primary hover:underline flex items-center gap-1 font-medium">
                        {showPermissionPreview ? '상세 권한 닫기' : '이 그룹의 상세 권한 보기'}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {ROLES.map(roleId => {
                        const isSelected = formData.role === roleId;
                        return (
                          <label key={roleId}
                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" name="role" className="w-4 h-4 mt-1 text-primary focus:ring-0 accent-[#008d75]"
                              checked={isSelected} onChange={() => setFormData({...formData, role: roleId})} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-0.5 rounded text-caption font-semibold ${ROLE_BADGE_COLORS[roleId]}`}>
                                  {ROLE_NUMBERS[roleId]}
                                </span>
                                <span className={`text-body-sm font-bold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                  {ROLE_LABELS[roleId]}
                                </span>
                              </div>
                              {showPermissionPreview && (
                                <p className="text-caption text-text-sub mt-1 leading-relaxed">{ROLE_DESCRIPTIONS[roleId]}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {showPermissionPreview && (
                      <p className="text-caption text-text-sub mt-2 pl-1">
                        ※ 상세 메뉴별 권한은 <strong className="text-text-body">관리자 관리 &gt; 권한 그룹 관리</strong> 메뉴에서 확인·수정할 수 있습니다.
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                      <div className="text-caption text-blue-900 leading-relaxed">
                        <strong className="font-bold">OTP 등록 안내</strong>
                        <p className="mt-0.5">
                          {adminToEdit
                            ? formData.otpStatus === 'REGISTERED'
                              ? 'OTP가 등록된 상태입니다. 분실 시 슈퍼관리자가 초기화할 수 있습니다.'
                              : 'OTP 미등록 상태입니다. 다음 로그인 시 등록이 강제됩니다.'
                            : '첫 로그인 시 OTP 등록이 의무화됩니다. 임시 비밀번호는 이메일로 발송됩니다.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {adminToEdit && (
                    <>
                      <div className="pt-1">
                        <label className="block text-body-sm font-bold text-gray-700 mb-2">계정 사용 활성화</label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="isUsed" className="w-4 h-4 text-primary focus:ring-[#008d75]"
                              checked={formData.isUsed === true} onChange={() => setFormData({...formData, isUsed: true})} />
                            <span className="text-body-sm text-gray-700 font-medium">사용</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="isUsed" className="w-4 h-4 text-primary focus:ring-[#008d75]"
                              checked={formData.isUsed === false} onChange={() => setFormData({...formData, isUsed: false})} />
                            <span className="text-body-sm text-gray-700 font-medium">미사용</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={handlePasswordReset}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-body-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Lock className="w-3.5 h-3.5" />
                          비밀번호 초기화
                        </button>
                        <button type="button" onClick={handleOtpReset}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-body-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Shield className="w-3.5 h-3.5" />
                          OTP 초기화
                        </button>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" size="md" fullWidth onClick={onClose}>취소</Button>
                    <Button type="submit" variant="primary" size="md" fullWidth>
                      {adminToEdit ? '수정 완료' : '등록'}
                    </Button>
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
