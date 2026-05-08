import React, { useState } from 'react';
import { EnterpriseBlock, VanInfo } from './types';
import { CheckCircle2, Edit2, Search } from 'lucide-react';

interface Step2Props {
  enterprises: EnterpriseBlock[];
  vanIds: Record<string, VanInfo>;
  setVanIds: (val: Record<string, VanInfo>) => void;
}

export default function Step2({ enterprises, vanIds, setVanIds }: Step2Props) {
  const [selectedEntId, setSelectedEntId] = useState<string>(enterprises[0]?.id || '');
  const [currentRow, setCurrentRow] = useState<VanInfo>(() => {
    return vanIds[enterprises[0]?.id] || {
      van: '',
      won: '',
      foreign: '',
      foreignLoan: '',
      payment: '',
      virtual: ''
    };
  });

  // Load selected enterprise data into input fields
  const handleSelectEnterprise = (id: string) => {
    setSelectedEntId(id);
    const existing = vanIds[id] || { van: '', won: '', foreign: '', foreignLoan: '', payment: '', virtual: '' };
    setCurrentRow(existing);
  };

  const handleInputChange = (field: keyof VanInfo, value: string) => {
    setCurrentRow(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    if (!selectedEntId) return;
    setVanIds({
      ...vanIds,
      [selectedEntId]: { ...currentRow }
    });
    
    // Optional: Select next incomplete enterprise for better flow
    const currentIndex = enterprises.findIndex(e => e.id === selectedEntId);
    if (currentIndex < enterprises.length - 1) {
      const nextEnt = enterprises[currentIndex + 1];
      setSelectedEntId(nextEnt.id);
      setCurrentRow(vanIds[nextEnt.id] || { van: '', won: '', foreign: '', foreignLoan: '', payment: '', virtual: '' });
    }
  };

  const isCompleted = (id: string) => {
    const info = vanIds[id];
    if (!info) return false;
    return !!(info.van || info.won || info.foreign || info.foreignLoan || info.payment || info.virtual);
  };

  const completedCount = enterprises.filter(e => isCompleted(e.id)).length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[600px] pb-20">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-1.5">기업별 VAN/펌뱅킹 ID 등록</h2>
          <p className="text-[14px] text-gray-500">기업별로 해당되는 VAN 및 펌뱅킹 연동 ID를 입력하고 '변경사항 저장/적용' 버튼을 클릭하세요.</p>
        </div>
        <div className="text-right">
          <div className="bg-[#008d75]/5 border border-[#008d75]/20 px-3 py-1.5 rounded-lg">
            <span className="text-[13px] text-gray-600 font-medium">등록 현황: </span>
            <span className="text-[#008d75] font-bold">{completedCount}</span>
            <span className="text-[13px] text-gray-400 px-1">/</span>
            <span className="text-gray-700 font-semibold">{enterprises.length}</span>
          </div>
        </div>
      </div>

      {/* Input Area (Common Field Area) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8 border-t-4 border-t-[#008d75]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-bold text-gray-700">대상 기업 선택</label>
              {isCompleted(selectedEntId) && (
                <span className="text-[10px] bg-[#008d7510] text-[#008d75] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  ID 등록됨
                </span>
              )}
            </div>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] bg-white h-[40px] font-medium"
              value={selectedEntId}
              onChange={(e) => handleSelectEnterprise(e.target.value)}
            >
              {enterprises.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">VAN ID</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] h-[40px] bg-white" 
              placeholder="VAN ID 입력"
              value={currentRow.van}
              onChange={(e) => handleInputChange('van', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">원화 펌뱅킹 ID</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] h-[40px] bg-white" 
              placeholder="펌뱅킹 ID 입력"
              value={currentRow.won}
              onChange={(e) => handleInputChange('won', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">외화 ID</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] h-[40px] bg-white" 
              placeholder="외화 펌뱅킹 ID"
              value={currentRow.foreign}
              onChange={(e) => handleInputChange('foreign', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">외화대금 ID</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] h-[40px] bg-white" 
              placeholder="외화대금 펌뱅킹 ID"
              value={currentRow.foreignLoan}
              onChange={(e) => handleInputChange('foreignLoan', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">지급 ID</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] h-[40px] bg-white" 
              placeholder="지급 펌뱅킹 ID"
              value={currentRow.payment}
              onChange={(e) => handleInputChange('payment', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">가상계좌 ID</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] h-[40px] bg-white" 
              placeholder="가상계좌 펌뱅킹 ID"
              value={currentRow.virtual}
              onChange={(e) => handleInputChange('virtual', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleApply}
              className="w-full bg-[#008d75] hover:bg-[#007a65] text-white font-bold py-2 px-4 rounded-md h-[40px] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] ring-offset-2 focus:ring-2 focus:ring-[#008d75]"
            >
              
              변경사항 저장/적용
            </button>
          </div>
        </div>
      </div>

      {/* Accumulated List Area (Results) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-800 uppercase tracking-wider">등록 리스트</h3>
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
             <span>* 행을 클릭하면 해당 기업의 정보를 수정할 수 있습니다.</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100/50 text-left border-b border-gray-200">
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-12 text-center">No.</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700">기업명</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700">VAN ID</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700">원화 ID</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700">외화 ID</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 text-xs">외화대금</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 text-xs">지급 ID</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700">가상계좌</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-16 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enterprises.map((ent, idx) => {
                const info = vanIds[ent.id];
                const isActive = selectedEntId === ent.id;
                const completed = isCompleted(ent.id);
                
                return (
                  <tr 
                    key={ent.id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer group ${isActive ? 'bg-[#008d7508]' : ''}`}
                    onClick={() => handleSelectEnterprise(ent.id)}
                  >
                    <td className="px-4 py-4 text-[13px] text-gray-400 text-center">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col min-w-[140px]">
                        <span className={`text-[14px] font-bold ${isActive ? 'text-[#008d75]' : 'text-gray-900'} group-hover:text-[#008d75] transition-colors`}>
                          {ent.name}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono tracking-tighter mt-0.5">{ent.bizNumber}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-[12px] font-mono ${info?.van ? 'text-gray-800 font-medium' : 'text-gray-300 small'}`}>
                      {info?.van || '-'}
                    </td>
                    <td className={`px-4 py-4 text-[12px] font-mono ${info?.won ? 'text-gray-800 font-medium' : 'text-gray-300 small'}`}>
                      {info?.won || '-'}
                    </td>
                    <td className={`px-4 py-4 text-[12px] font-mono ${info?.foreign ? 'text-gray-800 font-medium' : 'text-gray-300 small'}`}>
                      {info?.foreign || '-'}
                    </td>
                    <td className={`px-4 py-4 text-[12px] font-mono ${info?.foreignLoan ? 'text-gray-800 font-medium' : 'text-gray-300 small'}`}>
                      {info?.foreignLoan || '-'}
                    </td>
                    <td className={`px-4 py-4 text-[12px] font-mono ${info?.payment ? 'text-gray-800 font-medium' : 'text-gray-300 small'}`}>
                      {info?.payment || '-'}
                    </td>
                    <td className={`px-4 py-4 text-[12px] font-mono ${info?.virtual ? 'text-gray-800 font-medium' : 'text-gray-300 small'}`}>
                      {info?.virtual || '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                       {completed ? (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#008d7510] text-[#008d75] text-[11px] font-bold border border-[#008d7520]">
                           <CheckCircle2 className="w-3 h-3" />
                           등록 완료
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[11px] font-medium border border-gray-100 italic">
                           대기중
                         </span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {enterprises.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-gray-500 text-[14px]">표시할 기업 정보가 없습니다.</p>
              <p className="text-gray-400 text-[12px] mt-1.5">1단계(기업 선택)에서 등록할 기업을 먼저 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
