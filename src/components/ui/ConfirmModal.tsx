import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

type ConfirmVariant = 'danger' | 'warning' | 'primary';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const iconStyle: Record<ConfirmVariant, { wrap: string; text: string }> = {
  danger:  { wrap: 'bg-red-50 text-[#F04452]',   text: '' },
  warning: { wrap: 'bg-amber-50 text-amber-500',  text: '' },
  primary: { wrap: 'bg-emerald-50 text-[#008d75]',text: '' },
};

/**
 * 공통 ConfirmModal 컴포넌트
 *
 * @example
 * // 삭제 확인
 * <ConfirmModal
 *   open={showDelete}
 *   variant="danger"
 *   title="공지사항을 삭제하시겠습니까?"
 *   description="삭제 후 복구할 수 없습니다."
 *   confirmLabel="삭제하기"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 * />
 *
 * // 저장되지 않은 변경사항
 * <ConfirmModal
 *   open={showUnsaved}
 *   variant="warning"
 *   title="저장되지 않은 변경사항"
 *   description="현재 입력한 내용이 저장되지 않습니다. 닫으시겠습니까?"
 *   confirmLabel="닫기"
 *   cancelLabel="계속 작성"
 *   onConfirm={handleClose}
 *   onCancel={() => setShowUnsaved(false)}
 * />
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const icon = iconStyle[variant];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-8 text-center"
          >
            <div className={`w-12 h-12 ${icon.wrap} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-[18px] font-bold text-[#191F28] mb-3">{title}</h3>

            {description && (
              <p className="text-[14px] text-[#4E5968] mb-10 leading-relaxed">{description}</p>
            )}

            <div className="flex gap-2 justify-center">
              <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                size="md"
                fullWidth
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
