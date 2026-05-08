import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EnterpriseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseId: number | null;
}

export default function EnterpriseEditModal({ isOpen, onClose, enterpriseId }: EnterpriseEditModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-[18px] font-bold text-gray-900">기업 정보 수정</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">X</button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">테넌트 (상위기업)</label>
                 <input type="text" readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 outline-none" value="(주)토스페이먼츠" />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">기업명 (수정불가)</label>
                 <input type="text" readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 outline-none" value="(주)토스페이먼츠" />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">사업자 등록번호 (수정불가)</label>
                 <input type="text" readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 outline-none" value="120-81-12345" />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">법인 등록번호 (수정불가)</label>
                 <input type="text" readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 outline-none" value="110111-1234567" />
               </div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-2">수정 가능 정보</h3>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">사용여부</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isUsed" className="w-4 h-4 accent-[#008d75]" defaultChecked />
                    <span className="text-sm text-gray-800">사용</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isUsed" className="w-4 h-4 accent-[#008d75]" />
                    <span className="text-sm text-gray-800">미사용</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">VAN / 펌뱅킹 ID 설정</label>
                  <button className="text-xs text-[#008d75] font-semibold px-2 py-1 bg-[#008d75]/10 rounded">+ 추가</button>
                </div>
                <div className="space-y-2">
                  {[
                    { type: 'VAN ID', id: 'TEST_VAN_01', acc: '' },
                    { type: '원화 펌뱅킹 ID', id: 'KRW_FB_01', acc: '123-456-7890' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select defaultValue={item.type} className="w-[140px] px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-[#008d75]">
                        <option>VAN ID</option>
                        <option>원화 펌뱅킹 ID</option>
                        <option>외화 펌뱅킹 ID</option>
                        <option>외화대금 펌뱅킹 ID</option>
                        <option>지급 펌뱅킹 ID</option>
                        <option>가상계좌 펌뱅킹 ID</option>
                      </select>
                      <input type="text" defaultValue={item.id} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-[#008d75]" placeholder="ID 입력" />
                      <input type="text" defaultValue={item.acc} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-[#008d75]" placeholder="계좌번호 입력" />
                      <button className="text-red-500 hover:text-red-700 p-1"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">인터페이스 (API / File 등)</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white outline-none focus:border-[#008d75]">
                   <option>API (실시간)</option>
                   <option>SFTP (배치)</option>
                   <option>Host-to-Host</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">추가 파라미터</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#008d75]" placeholder="JSON 형식 파라미터 입력"></textarea>
              </div>

            </div>
          </div>
          
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 gap-3">
             <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
               취소
             </button>
             <button className="px-5 py-2.5 text-sm font-medium text-white bg-[#008d75] rounded-lg hover:bg-[#007a65]">
               저장
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
