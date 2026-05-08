import React, { useRef, useState } from 'react';
import { EnterpriseBlock, ExcelRow } from './types';
import { Plus, Trash2, AlertCircle, FileSpreadsheet, Download, Upload } from 'lucide-react';

interface Step1Props {
  registerMode: 'manual' | 'excel';
  setRegisterMode: (mode: 'manual' | 'excel') => void;
  tenantCode: string;
  setTenantCode: (code: string) => void;
  tenantError: string;
  setTenantError: (err: string) => void;
  enterprises: EnterpriseBlock[];
  setEnterprises: (ents: EnterpriseBlock[]) => void;
  excelData: ExcelRow[];
  setExcelData: (data: ExcelRow[]) => void;
  isUploaded: boolean;
  setIsUploaded: (val: boolean) => void;
  excelError: string;
  initialAction?: string;
}

export default function Step1({
  registerMode, setRegisterMode,
  tenantCode, setTenantCode, tenantError, setTenantError,
  enterprises, setEnterprises,
  excelData, setExcelData, isUploaded, setIsUploaded, excelError,
  initialAction
}: Step1Props) {
  
  const [formState, setFormState] = useState<EnterpriseBlock>({ id: '', name: '', bizNumber: '', corpNumber: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<'manual' | 'excel' | null>(null);
  const isEditMode = !!formState.id;

  React.useEffect(() => {
    if (initialAction === 'delete') {
      const mockId = Date.now().toString();
      setEnterprises([{ id: mockId, name: '혁신기업(주)', bizNumber: '1234567890', corpNumber: '1234567890123' }]);
      setSelectedIds([mockId]);
      setDeleteTarget('manual');
    }
  }, [initialAction]);

  const validateBizNumber = (num: string) => /^\d{10}$/.test(num);
  const validateCorpNumber = (num: string) => !num || /^\d{13}$/.test(num);

  const handleDuplicateCheck = () => {
    if (!tenantCode.trim()) {
      setTenantError('테넌트를 먼저 입력해주세요.');
      return;
    }
    
    // 임시: 'duplicate' 입력 시 중복으로 간주
    const isDuplicate = tenantCode === 'duplicate';
    
    if (isDuplicate) {
      setToast({ message: '이미 사용 중인 테넌트입니다.', type: 'error' });
      setTenantError('이미 사용 중인 테넌트입니다.');
    } else {
      setToast({ message: '사용 가능한 테넌트입니다.', type: 'success' });
      setTenantError('');
    }

    setTimeout(() => setToast(null), 3000);
  };

  const handleFormChange = (field: keyof EnterpriseBlock, value: string) => {
    let sanitizedValue = value;
    if (field === 'bizNumber' || field === 'corpNumber') {
      sanitizedValue = value.replace(/[^0-9]/g, '');
    }
    setFormState({ ...formState, [field]: sanitizedValue });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const handleReset = () => {
    setFormState({ id: '', name: '', bizNumber: '', corpNumber: '' });
    setFormErrors({});
  };

  const handleAddOrEdit = () => {
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) {
      errors.name = '기업명을 입력해주세요.';
    } else {
      const hasDuplicateName = enterprises.some(e => e.id !== formState.id && e.name === formState.name);
      if (hasDuplicateName) errors.name = '중복된 기업명입니다.';
    }
    if (!formState.bizNumber.trim()) {
      errors.bizNumber = '사업자등록번호를 입력해주세요.';
    } else if (!validateBizNumber(formState.bizNumber)) {
      errors.bizNumber = '10자리 숫자로 입력해주세요 (하이픈 제외).';
    } else {
      const hasDuplicate = enterprises.some(e => e.id !== formState.id && e.bizNumber === formState.bizNumber);
      if (hasDuplicate) errors.bizNumber = '중복된 사업자번호입니다.';
    }

    if (formState.corpNumber && !validateCorpNumber(formState.corpNumber)) {
      errors.corpNumber = '13자리 숫자로 입력해주세요 (하이픈 제외).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (isEditMode) {
      setEnterprises(enterprises.map(e => e.id === formState.id ? formState : e));
    } else {
      setEnterprises([...enterprises, { ...formState, id: Date.now().toString() }]);
    }
    handleReset();
  };

  const handleEditClick = (ent: EnterpriseBlock) => {
    setFormState(ent);
    setFormErrors({});
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget('manual');
  };

  const handleExcelDeleteSelected = () => {
    if (!excelData.some(d => d.selected)) return;
    setDeleteTarget('excel');
  };

  const confirmDelete = () => {
    if (deleteTarget === 'manual') {
      setEnterprises(enterprises.filter(e => !selectedIds.includes(e.id)));
      setSelectedIds([]);
      if (selectedIds.includes(formState.id)) {
        handleReset();
      }
    } else if (deleteTarget === 'excel') {
      setExcelData(excelData.filter(d => !d.selected));
    }
    setDeleteTarget(null);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(enterprises.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(v => v !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleUploadExcel = () => {
    // Mock upload
    setIsUploaded(true);
    setExcelData([
      { id: '1', selected: false, name: '혁신기업(주)', bizNumber: '1234567890', corpNumber: '1234567890123' },
      { id: '2', selected: false, name: '미래상사', bizNumber: '0987654321', corpNumber: '', errors: { bizNumber: '이미 등록된 번호입니다.' } },
      { id: '3', selected: false, name: '테스트컴퍼니', bizNumber: '11122233', corpNumber: '', errors: { bizNumber: '10자리 숫자로 입력해주세요.' } },
    ]);
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto min-h-[500px]">
      <div className="mb-6">
        <div className="flex gap-1 border-b border-gray-200">
          <button
            className={`pb-3 px-4 font-semibold text-[14px] border-b-2 transition-colors ${
              registerMode === 'manual' ? 'border-[#008d75] text-[#008d75]' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setRegisterMode('manual')}
          >
            직접 입력
          </button>
          <button
            className={`pb-3 px-4 font-semibold text-[14px] border-b-2 transition-colors ${
              registerMode === 'excel' ? 'border-[#008d75] text-[#008d75]' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setRegisterMode('excel')}
          >
            엑셀 업로드
          </button>
        </div>
      </div>

      {/* Tenant String */}
      <div className="mb-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-[14px] font-bold text-gray-800 mb-2">테넌트 (상위기업) <span className="text-red-500">*</span></label>
          <div className="flex gap-2 w-full max-w-md">
            <input
              className={`flex-1 px-3 py-2 bg-white border rounded-md text-[14px] outline-none transition-colors ${
                tenantError ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:bg-white focus:border-[#008d75]'
              }`}
              value={tenantCode}
              onChange={e => {
                setTenantCode(e.target.value);
                if (tenantError) setTenantError('');
              }}
              placeholder="테넌트값 입력"
            />
            <button 
              onClick={handleDuplicateCheck}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              중복 확인
            </button>
          </div>
          {tenantError && <p className="text-red-500 text-[12px] mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {tenantError}</p>}
        </div>
      </div>

      {registerMode === 'manual' && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><span className="text-red-500">*</span> 기업명</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md text-[14px] outline-none ${formErrors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#008d75]'}`}
                  value={formState.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  placeholder="기업명 입력"
                />
                {formErrors.name && <p className="text-red-500 text-[12px] mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><span className="text-red-500">*</span> 사업자등록번호</label>
                <input
                  type="text"
                  maxLength={10}
                  className={`w-full px-3 py-2 border rounded-md text-[14px] outline-none ${formErrors.bizNumber ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#008d75]'}`}
                  value={formState.bizNumber}
                  onChange={e => handleFormChange('bizNumber', e.target.value)}
                  placeholder="10자리 숫자 입력"
                />
                {formErrors.bizNumber && <p className="text-red-500 text-[12px] mt-1">{formErrors.bizNumber}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">법인등록번호</label>
                <input
                  type="text"
                  maxLength={13}
                  className={`w-full px-3 py-2 border rounded-md text-[14px] outline-none ${formErrors.corpNumber ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-[#008d75]'}`}
                  value={formState.corpNumber}
                  onChange={e => handleFormChange('corpNumber', e.target.value)}
                  placeholder="13자리 숫자 입력(선택)"
                />
                {formErrors.corpNumber && <p className="text-red-500 text-[12px] mt-1">{formErrors.corpNumber}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
              <button onClick={handleReset} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-[14px] font-semibold hover:bg-gray-50 transition-colors">
                {isEditMode ? '취소' : '초기화'}
              </button>
              <button onClick={handleAddOrEdit} className="px-8 py-2 bg-white border border-[#008d75] text-[#008d75] rounded-md text-[14px] font-semibold hover:bg-[#008d75]/5 transition-colors">
                {isEditMode ? '수정' : '추가'}
              </button>
            </div>
          </div>

          <div className="bg-white">
            <div className="flex justify-end mb-3">
              <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="px-4 py-1.5 border border-gray-300 text-gray-700 text-[13px] font-semibold rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-100 transition-colors">
                삭제
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[13px] text-gray-700 font-semibold">
                    <th className="py-3 px-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll} 
                        checked={enterprises.length > 0 && selectedIds.length === enterprises.length}
                        className="rounded border-gray-300 text-[#008d75] focus:ring-[#008d75]"
                      />
                    </th>
                    <th className="py-3 px-4 w-16 text-center">No.</th>
                    <th className="py-3 px-4">기업명</th>
                    <th className="py-3 px-4">사업자등록번호</th>
                    <th className="py-3 px-4">법인등록번호</th>
                    <th className="py-3 px-4 w-20 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enterprises.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 text-[13px]">
                        등록된 기업이 없습니다. 위에서 정보를 입력하고 추가해주세요.
                      </td>
                    </tr>
                  ) : (
                    enterprises.map((ent, idx) => (
                      <tr key={ent.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(ent.id)} 
                            onChange={() => handleSelect(ent.id)} 
                            className="rounded border-gray-300 text-[#008d75] focus:ring-[#008d75]"
                          />
                        </td>
                        <td className="py-3 px-4 text-center text-[13px] text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-4 text-[13px] text-gray-900 font-medium">{ent.name}</td>
                        <td className="py-3 px-4 text-[13px] text-gray-900">{ent.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</td>
                        <td className="py-3 px-4 text-[13px] text-gray-900">{ent.corpNumber ? ent.corpNumber.replace(/(\d{6})(\d{7})/, '$1-$2') : '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => handleEditClick(ent)} 
                            className="text-[#008d75] hover:text-[#007a65] text-[13px] font-semibold underline underline-offset-2"
                          >
                            수정
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {registerMode === 'excel' && (
        <div className="space-y-4">
          {!isUploaded ? (
            <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-sm transition-colors hover:border-[#008d75]/50">
              <div className="w-16 h-16 bg-[#008d75]/10 text-[#008d75] rounded-full flex items-center justify-center mb-5">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="text-gray-900 font-bold text-[16px] mb-2">엑셀 파일을 업로드하여 일괄 등록하세요</h3>
              <p className="text-gray-500 text-[14px] mb-8 text-center max-w-md leading-relaxed">
                지정된 양식에 여러 기업 정보를 작성한 후 업로드 할 수 있습니다.<br/>
                최대 100건까지 한 번에 등록 가능합니다.
              </p>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-md text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                   양식 다운로드
                </button>
                <button onClick={handleUploadExcel} className="px-5 py-2.5 bg-[#008d75] border border-transparent rounded-md text-[13px] font-semibold text-white hover:bg-[#007a65] flex items-center gap-2 transition-colors shadow-sm">
                   파일 업로드 (.xlsx, .xls)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900 text-[15px]">업로드 결과</h3>
                  <div className="flex gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[12px] font-bold">{excelData.filter(d => !d.errors || Object.keys(d.errors).length === 0).length}건 정상</span>
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[12px] font-bold">{excelData.filter(d => d.errors && Object.keys(d.errors).length > 0).length}건 오류 발견</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleExcelDeleteSelected} 
                    disabled={!excelData.some(d => d.selected)}
                    className="text-[13px] font-medium text-gray-500 border border-gray-300 bg-white px-3 py-1.5 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-100 transition-colors"
                  >
                    삭제
                  </button>
                  <button onClick={() => setIsUploaded(false)} className="text-[13px] font-medium text-gray-500 border border-gray-300 bg-white px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                    초기화
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-600 font-semibold">
                      <th className="px-4 py-3 w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={excelData.length > 0 && excelData.every(d => d.selected)}
                          onChange={(e) => setExcelData(excelData.map(d => ({ ...d, selected: e.target.checked })))}
                          className="rounded border-gray-300 text-[#008d75] focus:ring-[#008d75]" 
                        />
                      </th>
                      <th className="px-4 py-3 w-16 text-center">No</th>
                      <th className="px-4 py-3">기업명</th>
                      <th className="px-4 py-3">사업자등록번호</th>
                      <th className="px-4 py-3">법인등록번호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, idx) => (
                      <tr key={row.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/50 ${row.errors && Object.keys(row.errors).length > 0 ? 'bg-red-50/20' : ''}`}>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => {
                              setExcelData(excelData.map(d => d.id === row.id ? { ...d, selected: !d.selected } : d))
                            }}
                            className="rounded border-gray-300 text-[#008d75] focus:ring-[#008d75]"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3">
                          {row.name}
                          {row.errors?.name && <span className="block text-[11px] text-red-500 mt-1 font-medium">{row.errors.name}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={row.errors?.bizNumber ? 'text-red-500 font-medium' : ''}>{row.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</span>
                          {row.errors?.bizNumber && <span className="block text-[11px] text-red-500 mt-1 font-medium">{row.errors.bizNumber}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={row.errors?.corpNumber ? 'text-red-500 font-medium' : ''}>{row.corpNumber ? row.corpNumber.replace(/(\d{6})(\d{7})/, '$1-$2') : '-'}</span>
                          {row.errors?.corpNumber && <span className="block text-[11px] text-red-500 mt-1 font-medium">{row.errors.corpNumber}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {excelError && (
                <div className="px-5 py-3 bg-red-50 border-t border-red-100 text-red-600 text-[13px] flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4" /> {excelError}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg font-semibold text-[14px] flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-gray-800 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">기업 삭제</h3>
              <p className="text-[14px] text-gray-600 leading-relaxed">선택한 기업 정보를 삭제하시겠습니까?<br/>삭제 후에는 복구할 수 없습니다.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-center gap-2 border-t border-gray-100">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 bg-white border border-gray-300 rounded-md text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 rounded-md text-[14px] font-semibold text-white hover:bg-red-600 transition-colors">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
