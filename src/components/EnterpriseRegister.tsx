import React, { useState } from 'react';
import { ChevronRight, Check, X, AlertCircle, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnterpriseBlock, ExcelRow } from './register/types';

// Simplified Stepper
const STEPS = ['기업 기본정보 등록', 'VAN/펌뱅킹 ID 등록', '기업 인터페이스/파라미터 설정'];


// ... (imports)

import EnterpriseInterfaceSettings from './EnterpriseInterfaceSettings';
const VanFirmBankingRegistration = ({ enterprises }) => {
  const [selectedEnt, setSelectedEnt] = useState(enterprises[0] || null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  return (
    <div className="flex gap-6 h-[500px] border border-gray-200 rounded-md overflow-hidden">
        {/* 좌측 패널: 기업 목록 */}
        <div className="w-[30%] border-r border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-3 border-b border-gray-200">
                <input className="w-full px-3 py-1.5 border border-gray-300 rounded text-[13px]" placeholder="기업명 검색..." />
            </div>
            <div className="flex-1 overflow-y-auto">
                {enterprises.map(ent => (
                    <div 
                        key={ent.id} 
                        className={`p-3 border-b border-gray-200 cursor-pointer ${selectedEnt?.id === ent.id ? 'bg-white border-l-4 border-l-[#008d75]' : 'hover:bg-gray-100'}`}
                        onClick={() => setSelectedEnt(ent)}
                    >
                        <div className="text-[14px] font-bold text-gray-900">{ent.name}</div>
                        <div className="text-[12px] text-gray-500 mt-1">미입력</div>
                    </div>
                ))}
            </div>
        </div>

        {/* 우측 패널: 상세 입력 */}
        <div className="flex-1 p-6 overflow-y-auto">
            {selectedEnt ? (
                <div className="space-y-6">
                    <h3 className="text-[16px] font-bold text-gray-900 pb-4 border-b border-gray-200">{selectedEnt.name}</h3>
                    {/* 기본 연동 정보 */}
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">기본 연동 정보</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] text-gray-500 mb-1">VAN ID</label>
                                <input className="w-full px-3 py-2 border border-gray-300 rounded text-[13px]" placeholder="VAN ID 입력" />
                            </div>
                        </div>
                    </div>

                    {/* 고급 설정 (펌뱅킹 ID) */}
                    <div className="border-t border-gray-200 pt-4">
                        <div 
                            className="flex items-center gap-2 cursor-pointer mb-2"
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        >
                            <span className="text-[13px] font-semibold text-gray-700">펌뱅킹 ID 설정 {isAdvancedOpen ? '▲' : '▼'}</span>
                        </div>
                        {isAdvancedOpen && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {['원화 펌뱅킹 ID', '외화 펌뱅킹 ID', '외화대금 펌뱅킹 ID', '지급 펌뱅킹 ID', '가상계좌 펌뱅킹 ID'].map(label => (
                                    <div key={label}>
                                        <label className="block text-[12px] text-gray-500 mb-1">{label}</label>
                                        <input className="w-full px-3 py-2 border border-gray-300 rounded text-[13px]" placeholder={`${label} 입력`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">기업을 선택해주세요.</div>
            )}
        </div>
    </div>
  );
};

export default function EnterpriseRegister({ initialConfig, onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [registerMode, setRegisterMode] = useState('manual');
  
  // State for accumulated enterprises (List)
  const [enterprises, setEnterprises] = useState([]);
  
  // State for form
  const [tenantCode, setTenantCode] = useState('');
  const [tenantStatus, setTenantStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [tenantMessage, setTenantMessage] = useState('');
  const [formState, setFormState] = useState({ id: '', name: '', bizNumber: '', corpNumber: '' });
  const [formErrors, setFormErrors] = useState<any>({});
  const [tenantError, setTenantError] = useState('');
  const [pageError, setPageError] = useState('');
  const [editingId, setEditingId] = useState(null); // ID of enterprise being edited

  // Table selections
  const [selectedIds, setSelectedIds] = useState([]);

  // Excel state
  const [excelData, setExcelData] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [excelError, setExcelError] = useState('');

  // Mock functions for functionality (same as before)
  const handleCheckTenant = () => {
    setPageError('');
    if (!tenantCode.trim()) {
      setTenantStatus('error');
      setTenantMessage('테넌트값을 입력해주세요.');
      return;
    }

    // Mock redundancy check
    if (tenantCode === 'fail') {
      setTenantStatus('error');
      setTenantMessage('이미 사용 중인 테넌트값입니다.');
    } else {
      setTenantStatus('success');
      setTenantMessage('사용 가능한 테넌트값입니다.');
    }
  };

  const handleAddOrUpdate = () => {
    setPageError('');
    // Basic validation
    const errors: any = {};
    if (!formState.name.trim()) errors.name = '기업명을 입력해주세요.';
    if (!formState.bizNumber.trim()) errors.bizNumber = '사업자등록번호를 입력해주세요.';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingId) {
      setEnterprises(enterprises.map(e => e.id === editingId ? { ...formState, id: editingId } : e));
      setEditingId(null);
    } else {
      setEnterprises([...enterprises, { ...formState, id: Date.now().toString() }]);
    }
    setFormState({ id: '', name: '', bizNumber: '', corpNumber: '' });
    setFormErrors({});
  };

  const handleEditClick = (ent) => {
    setPageError('');
    setFormState(ent);
    setEditingId(ent.id);
  };

  const handleCancelEdit = () => {
    setFormState({ id: '', name: '', bizNumber: '', corpNumber: '' });
    setEditingId(null);
    setFormErrors({});
  };

  const handleDeleteSelected = () => {
    setPageError('');
    setEnterprises(enterprises.filter(e => !selectedIds.includes(e.id)));
    setSelectedIds([]);
  };

  const handleUploadExcel = () => {
    setPageError('');
    // Mock upload
    setIsUploaded(true);
    setExcelData([
      { id: '1', selected: false, name: '혁신기업(주)', bizNumber: '1234567890', corpNumber: '1234567890123' },
      { id: '2', selected: false, name: '미래상사', bizNumber: '0987654321', corpNumber: '', errors: { bizNumber: '이미 등록된 번호입니다.' } },
      { id: '3', selected: false, name: '테스트컴퍼니', bizNumber: '11122233', corpNumber: '', errors: { bizNumber: '10자리 숫자로 입력해주세요.' } },
    ]);
  };

  const handleNextStep = () => {
    setPageError('');
    if (currentStep === 1) {
      if (tenantStatus !== 'success') {
        setPageError('테넌트 중복 확인이 완료되지 않았습니다.');
        return;
      }
      if (registerMode === 'manual' && enterprises.length === 0) {
        setPageError('등록된 기업이 없습니다. 기업을 하나 이상 추가해주세요.');
        return;
      }
      if (registerMode === 'excel' && (!isUploaded || excelData.length === 0)) {
        setPageError('엑셀 파일이 업로드되지 않았습니다. 파일을 업로드해주세요.');
        return;
      }
    }
    setCurrentStep(Math.min(3, currentStep + 1));
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* 1. Stepper & Instruction */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          {STEPS.map((step, idx) => (
            <div key={step} className={`flex items-center gap-2 text-[14px] font-bold ${idx + 1 === currentStep ? 'text-[#008d75]' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${idx + 1 === currentStep ? 'bg-[#008d75] text-white' : 'bg-gray-100'}`}>{idx + 1}</span>
              {step}
            </div>
          ))}
        </div>
        
      </div>

      {/* 2. Registration Content based on Step */}
      {/* 2. Registration Content based on Step */}
      <div className="pb-6">
        {currentStep === 1 && (
          <>
            {/* Common Tenant Input */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">테넌트 <span className="text-red-500">*</span></label>
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col w-full max-w-sm gap-1">
                      <input 
                        className={`w-full px-3 py-2 border rounded-md text-[14px] ${tenantStatus === 'error' ? 'border-red-500' : 'border-gray-300'}`} 
                        placeholder="테넌트값 입력" 
                        value={tenantCode} 
                        onChange={e => {
                          setTenantCode(e.target.value);
                          setTenantStatus('idle');
                        }} 
                      />
                      {tenantMessage && (
                        <p className={`text-[12px] ${tenantStatus === 'error' ? 'text-red-500' : 'text-[#008d75]'}`}>
                          {tenantMessage}
                        </p>
                      )}
                    </div>
                    <button onClick={handleCheckTenant} className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-[13px] font-semibold">중복 확인</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-b border-gray-200 mb-6">
              {['직접 입력', '엑셀 업로드'].map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setRegisterMode(mode === '직접 입력' ? 'manual' : 'excel')}
                  className={`pb-3 text-[14px] font-bold ${registerMode.startsWith(mode === '직접 입력' ? 'manual' : 'excel') ? 'text-[#008d75] border-b-2 border-[#008d75]' : 'text-gray-400'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {registerMode === 'manual' ? (
              <>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">기업명 <span className="text-red-500">*</span></label>
                      <input className={`w-full px-3 py-2 border rounded-md text-[14px] ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="기업명 입력" value={formState.name} onChange={e => {setFormState({...formState, name: e.target.value}); setFormErrors({...formErrors, name: ''})}} />
                      {formErrors.name && <p className="text-[12px] text-red-500 mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">사업자등록번호 <span className="text-red-500">*</span></label>
                      <input 
                        className={`w-full px-3 py-2 border rounded-md text-[14px] ${formErrors.bizNumber ? 'border-red-500' : 'border-gray-300'}`} 
                        placeholder="숫자 10자리" 
                        value={formState.bizNumber} 
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setFormState({...formState, bizNumber: value}); 
                          setFormErrors({...formErrors, bizNumber: ''});
                        }} 
                      />
                      {formErrors.bizNumber && <p className="text-[12px] text-red-500 mt-1">{formErrors.bizNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">법인등록번호</label>
                      <input className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px]" placeholder="13자리 숫자(선택)" value={formState.corpNumber} onChange={e => setFormState({...formState, corpNumber: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                    <button onClick={editingId ? handleCancelEdit : () => setFormState({ id: '', name: '', bizNumber: '', corpNumber: '' })} className="px-6 py-2 bg-white border border-[#008d75] rounded-md text-[14px] font-semibold text-[#008d75]">취소</button>
                    <button onClick={handleAddOrUpdate} className="px-6 py-2 bg-[#008d75] rounded-md text-[14px] font-semibold text-white">{editingId ? '수정' : '등록'}</button>
                  </div>
                </div>
                {/* Registered Enterprise List (Manual) */}
                <div className="bg-white">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-[16px] font-bold text-gray-900 mb-1">기업 목록</h3>
                      <p className="text-[13px] text-gray-500">추가한 항목은 아래 목록에서 확인하고 삭제할 수 있습니다.</p>
                    </div>
                    <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="px-4 py-2 border border-[#d32f2f] rounded-md text-[12px] font-semibold text-[#d32f2f] disabled:bg-gray-100 disabled:border-gray-300">삭제</button>
                  </div>
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-3 w-10 text-center"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? enterprises.map(e => e.id) : [])} checked={selectedIds.length === enterprises.length && enterprises.length > 0}/></th>
                        <th className="p-3">기업명</th>
                        <th className="p-3">사업자등록번호</th>
                        <th className="p-3">법인등록번호</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {enterprises.length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-gray-500">추가된 기업이 없습니다. 상단 폼에서 기업 정보를 입력한 뒤 추가해 주세요.</td></tr>
                      ) : (
                        enterprises.map(ent => (
                          <tr key={ent.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditClick(ent)}>
                            <td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(ent.id)} onChange={(e) => { e.stopPropagation(); setSelectedIds(selectedIds.includes(ent.id) ? selectedIds.filter(id => id !== ent.id) : [...selectedIds, ent.id]) }} /></td>
                            <td className="p-3 font-semibold">{ent.name}</td>
                            <td className="p-3">{ent.bizNumber}</td>
                            <td className="p-3">{ent.corpNumber || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div>
                 {!isUploaded ? (
                    <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#008d75]/10 text-[#008d75] rounded-full flex items-center justify-center mb-5"><FileSpreadsheet className="w-8 h-8" /></div>
                      <h3 className="text-gray-900 font-bold text-[16px] mb-2">엑셀 파일을 업로드하여 일괄 등록하세요</h3>
                      <button onClick={handleUploadExcel} className="px-6 py-3 bg-[#008d75] rounded-md text-[14px] font-semibold text-white">파일 업로드 (.xlsx, .xls)</button>
                    </div>
                 ) : (
                   <div className="pt-6 border-t border-gray-200">
                     <div className="flex justify-between items-end mb-4">
                       <div>
                         <h3 className="text-[16px] font-bold text-gray-900 mb-1">기업 목록 (엑셀)</h3>
                         <button onClick={() => setIsUploaded(false)} className="text-[13px] text-[#008d75] font-semibold underline">다른 파일 업로드</button>
                       </div>
                     </div>
                     <table className="w-full text-left text-[13px]">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr><th className="p-3">기업명</th><th className="p-3">사업자등록번호</th><th className="p-3">법인등록번호</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {excelData.map(d => <tr key={d.id} className="hover:bg-gray-50"><td className="p-3">{d.name}</td><td className="p-3">{d.bizNumber}</td><td className="p-3">{d.corpNumber || '-'}</td></tr>)}
                        </tbody>
                     </table>
                   </div>
                 )}
              </div>
            )}
          </>
        )}
        {currentStep === 2 && (
          <VanFirmBankingRegistration enterprises={enterprises} />
        )}
        {currentStep === 3 && (
          <EnterpriseInterfaceSettings enterprises={enterprises} />
        )}
      </div>

      {/* 4. Footer */}
      {pageError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-[13px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {pageError}
        </div>
      )}
      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
        <button 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2.5 border border-gray-300 rounded-md text-[14px] font-bold text-gray-700 disabled:opacity-50"
        >
          이전 단계
        </button>
        <button 
          onClick={handleNextStep}
          className="px-10 py-2.5 bg-[#008d75] rounded-md text-[14px] font-bold text-white shadow-sm"
        >
          {currentStep === 3 ? '등록 완료' : '다음 단계'}
        </button>
      </div>
    </div>
  );
}
