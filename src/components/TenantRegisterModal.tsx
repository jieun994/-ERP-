import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input } from './ui';

interface Tenant {
  id: number;
  tenantCode: string;
  tenantName: string;
  isUsed: boolean;
}

interface TenantRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, 'id'> & { id?: number }) => void;
  tenantToEdit: Tenant | null;
  existingCodes: string[];
}

export default function TenantRegisterModal({
  isOpen,
  onClose,
  onSave,
  tenantToEdit,
  existingCodes,
}: TenantRegisterModalProps) {
  const isEdit = !!tenantToEdit;

  const [tenantCode, setTenantCode] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [isUsed, setIsUsed] = useState(true);

  const [codeStatus, setCodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [codeMessage, setCodeMessage] = useState('');
  const [errors, setErrors] = useState<{ tenantCode?: string; tenantName?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // 폼 초기화
  useEffect(() => {
    if (!isOpen) return;
    if (tenantToEdit) {
      setTenantCode(tenantToEdit.tenantCode);
      setTenantName(tenantToEdit.tenantName);
      setIsUsed(tenantToEdit.isUsed);
      setCodeStatus('success'); // 수정 모드에서는 기존 코드를 확인된 것으로 처리
      setCodeMessage('');
    } else {
      setTenantCode('');
      setTenantName('');
      setIsUsed(true);
      setCodeStatus('idle');
      setCodeMessage('');
    }
    setErrors({});
    setIsSuccess(false);
  }, [isOpen, tenantToEdit]);

  const handleCheckCode = () => {
    if (!tenantCode.trim()) {
      setCodeStatus('error');
      setCodeMessage('테넌트 코드를 입력해주세요.');
      return;
    }

    // 수정 모드에서 본인 코드는 중복 제외
    const otherCodes = isEdit
      ? existingCodes.filter(c => c !== tenantToEdit?.tenantCode)
      : existingCodes;

    if (otherCodes.includes(tenantCode.trim())) {
      setCodeStatus('error');
      setCodeMessage('이미 사용 중인 테넌트 코드입니다.');
    } else {
      setCodeStatus('success');
      setCodeMessage('사용 가능한 테넌트 코드입니다.');
      setErrors(prev => ({ ...prev, tenantCode: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!tenantCode.trim()) {
      newErrors.tenantCode = '테넌트 코드를 입력해주세요.';
    } else if (codeStatus !== 'success') {
      newErrors.tenantCode = '테넌트 코드 중복 확인을 완료해주세요.';
    }

    if (!tenantName.trim()) {
      newErrors.tenantName = '테넌트명을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(isEdit ? { id: tenantToEdit!.id } : {}),
      tenantCode: tenantCode.trim(),
      tenantName: tenantName.trim(),
      isUsed,
    });

    setIsSuccess(true);

    if (!isEdit) {
      setTimeout(() => {
        onClose();
      }, 1200);
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
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0">
              <h3 className="font-semibold text-title-sm text-text-main">
                {isEdit ? '테넌트 수정' : '테넌트 등록'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-bg-muted rounded-full transition-colors text-text-sub"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 overflow-y-auto">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-title font-bold text-text-main">
                      {isEdit ? '수정이 완료되었습니다.' : '등록이 완료되었습니다.'}
                    </h4>
                    <p className="text-body text-text-sub mt-1">
                      테넌트 정보가 성공적으로 {isEdit ? '업데이트' : '저장'}되었습니다.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* 테넌트 코드 */}
                  <div className="space-y-1.5">
                    <label className="block text-body font-semibold text-text-main">
                      테넌트 코드 {!isEdit && <span className="text-status-error">*</span>}
                    </label>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <Input
                          fullWidth
                          error={!!errors.tenantCode || codeStatus === 'error'}
                          placeholder="영문, 숫자, _ 만 입력 (예: toss_01)"
                          value={tenantCode}
                          disabled={isEdit}
                          onChange={e => {
                            const filtered = e.target.value.replace(/[^A-Za-z0-9_]/g, '');
                            setTenantCode(filtered);
                            setCodeStatus('idle');
                            setCodeMessage('');
                            setErrors(prev => ({ ...prev, tenantCode: undefined }));
                          }}
                        />
                        {/* 중복 확인 메시지 */}
                        {codeMessage && (
                          <p
                            className={`text-caption flex items-center gap-1 ${
                              codeStatus === 'error' ? 'text-status-error' : 'text-primary'
                            }`}
                          >
                            {codeStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                            {codeStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                            {codeMessage}
                          </p>
                        )}
                        {errors.tenantCode && !codeMessage && (
                          <p className="text-caption flex items-center gap-1 text-status-error">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            {errors.tenantCode}
                          </p>
                        )}
                      </div>
                      {!isEdit && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="md"
                          onClick={handleCheckCode}
                          className="shrink-0"
                        >
                          중복 확인
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 테넌트명 */}
                  <div className="space-y-1.5">
                    <label className="block text-body font-semibold text-text-main">
                      테넌트명 <span className="text-status-error">*</span>
                    </label>
                    <Input
                      fullWidth
                      error={!!errors.tenantName}
                      placeholder="테넌트명 입력"
                      value={tenantName}
                      onChange={e => {
                        setTenantName(e.target.value);
                        setErrors(prev => ({ ...prev, tenantName: undefined }));
                      }}
                    />
                    {errors.tenantName && (
                      <p className="text-caption flex items-center gap-1 text-status-error">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {errors.tenantName}
                      </p>
                    )}
                  </div>

                  {/* 사용여부 */}
                  <div className="space-y-2">
                    <label className="block text-body font-semibold text-text-main">사용여부</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isUsed"
                          className="w-4 h-4 accent-[#008d75]"
                          checked={isUsed === true}
                          onChange={() => setIsUsed(true)}
                        />
                        <span className="text-body text-text-main font-medium">사용</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isUsed"
                          className="w-4 h-4 accent-[#008d75]"
                          checked={isUsed === false}
                          onChange={() => setIsUsed(false)}
                        />
                        <span className="text-body text-text-main font-medium">미사용</span>
                      </label>
                    </div>
                  </div>

                  {/* 버튼 영역 */}
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="ghost" size="md" fullWidth onClick={onClose}>
                      취소
                    </Button>
                    <Button type="submit" variant="primary" size="md" fullWidth>
                      {isEdit ? '수정 완료' : '등록'}
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
