import React, { useState } from 'react';
import { EnterpriseBlock, CommonSettings, EnterpriseParams } from './types';
import { Settings, Shield, Link2, CheckCircle2, AlertCircle, Edit2, Search } from 'lucide-react';

interface Step3Props {
  enterprises: EnterpriseBlock[];
  commonSettings: CommonSettings;
  setCommonSettings: (val: CommonSettings) => void;
  enterpriseParams: Record<string, EnterpriseParams>;
  setEnterpriseParams: (val: Record<string, EnterpriseParams>) => void;
}

export default function Step3({ enterprises, commonSettings, setCommonSettings, enterpriseParams, setEnterpriseParams }: Step3Props) {
  const [selectedEntId, setSelectedEntId] = useState<string>(enterprises[0]?.id || '');
  
  // Local state for current inputs
  const [currentRow, setCurrentRow] = useState<EnterpriseParams>(() => {
    return enterpriseParams[enterprises[0]?.id] || {
      interfaceMethod: commonSettings.interfaceMethod,
      baseUrl: commonSettings.baseUrl,
      authMethod: commonSettings.authMethod,
      channelCode: '',
      callbackPath: '',
      tokenEndpoint: '',
      clientId: '',
      clientSecret: ''
    };
  });

  const handleSelectEnterprise = (id: string) => {
    setSelectedEntId(id);
    const existing = enterpriseParams[id] || {
      interfaceMethod: commonSettings.interfaceMethod,
      baseUrl: commonSettings.baseUrl,
      authMethod: commonSettings.authMethod,
      channelCode: '',
      callbackPath: '',
      tokenEndpoint: '',
      clientId: '',
      clientSecret: ''
    };
    setCurrentRow(existing);
  };

  const handleInputChange = (field: string, value: string) => {
    setCurrentRow(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    if (!selectedEntId) return;
    setEnterpriseParams({
      ...enterpriseParams,
      [selectedEntId]: { ...currentRow }
    });
    
    // Move to next if editing in sequence
    const currentIndex = enterprises.findIndex(e => e.id === selectedEntId);
    if (currentIndex < enterprises.length - 1) {
      const nextEnt = enterprises[currentIndex + 1];
      setSelectedEntId(nextEnt.id);
      setCurrentRow(enterpriseParams[nextEnt.id] || {
        interfaceMethod: commonSettings.interfaceMethod,
        baseUrl: commonSettings.baseUrl,
        authMethod: commonSettings.authMethod,
        channelCode: '',
        callbackPath: '',
        tokenEndpoint: '',
        clientId: '',
        clientSecret: ''
      });
    }
  };

  const isCompleted = (id: string) => {
    const params = enterpriseParams[id];
    if (!params) return false;
    return !!params['channelCode'] && !!params['baseUrl'];
  };

  const completedCount = enterprises.filter(e => isCompleted(e.id)).length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[600px] pb-20">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-1.5">인터페이스 및 파라미터 설정</h2>
          <p className="text-[14px] text-gray-500">각 기업별로 통신 방식, 인증 정보 및 세부 파라미터를 입력하고 저장하세요.</p>
        </div>
        <div className="bg-[#008d75]/5 border border-[#008d75]/20 px-3 py-1.5 rounded-lg">
          <span className="text-[13px] text-gray-600 font-medium">설정 완료: </span>
          <span className="text-[#008d75] font-bold">{completedCount}</span>
          <span className="text-[13px] text-gray-400 px-1">/</span>
          <span className="text-gray-700 font-semibold">{enterprises.length}</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8 border-t-4 border-t-[#008d75]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">대상 기업 선택</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] focus:ring-1 focus:ring-[#008d75] h-[40px] bg-white font-medium"
              value={selectedEntId}
              onChange={(e) => handleSelectEnterprise(e.target.value)}
            >
              {enterprises.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> 인터페이스 방식
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] h-[40px] bg-white"
              value={currentRow.interfaceMethod}
              onChange={e => handleInputChange('interfaceMethod', e.target.value)}
            >
              <option value="REST">REST API</option>
              <option value="OData">OData</option>
              <option value="RFC">RFC (SAP)</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 인증 방식
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] h-[40px] bg-white"
              value={currentRow.authMethod}
              onChange={e => handleInputChange('authMethod', e.target.value)}
            >
              <option value="BearerToken">Bearer Token (OAuth)</option>
              <option value="BasicAuth">Basic Auth</option>
              <option value="ApiKey">API Key</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">채널코드 (Channel Code) <span className="text-red-500 font-normal">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] h-[40px]" 
              placeholder="예: CHNL_01"
              value={currentRow.channelCode || ''}
              onChange={e => handleInputChange('channelCode', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Base URL / Endpoint <span className="text-red-500 font-normal">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] h-[40px]" 
              placeholder="https://api.example.com"
              value={currentRow.baseUrl || ''}
              onChange={e => handleInputChange('baseUrl', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">콜백 경로 (Callback Path)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[14px] outline-none focus:border-[#008d75] h-[40px]" 
              placeholder="/api/callback"
              value={currentRow.callbackPath || ''}
              onChange={e => handleInputChange('callbackPath', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleApply}
              className="w-full bg-[#008d75] hover:bg-[#007a65] text-white font-bold py-2 px-4 rounded-md h-[40px] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              
              변경사항 저장/적용
            </button>
          </div>
        </div>

        {currentRow.authMethod === 'BearerToken' && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">Token Endpoint</label>
              <input 
                type="text" 
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-[13px] outline-none focus:border-[#008d75] bg-white" 
                value={currentRow.tokenEndpoint || ''}
                onChange={e => handleInputChange('tokenEndpoint', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">Client ID</label>
              <input 
                type="text" 
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-[13px] outline-none focus:border-[#008d75] bg-white" 
                value={currentRow.clientId || ''}
                onChange={e => handleInputChange('clientId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">Client Secret</label>
              <input 
                type="password" 
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-[13px] outline-none focus:border-[#008d75] bg-white" 
                value={currentRow.clientSecret || ''}
                onChange={e => handleInputChange('clientSecret', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Accumulated List Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-800 uppercase tracking-wider">설정 리스트</h3>
          <div className="text-[12px] text-gray-500">* 행을 클릭하면 해당 기업의 상세 설정을 수정할 수 있습니다.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100/50 text-left border-b border-gray-200">
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-12 text-center">No.</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-48">기업명</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-24">방식</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-32">인증</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700">Base URL / Endpoint</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-32">채널코드</th>
                <th className="px-4 py-3 text-[13px] font-bold text-gray-700 w-16 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enterprises.map((ent, idx) => {
                const params = enterpriseParams[ent.id];
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
                      <span className={`text-[14px] font-bold ${isActive ? 'text-[#008d75]' : 'text-gray-900'} group-hover:text-[#008d75] transition-colors`}>
                        {ent.name}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[12px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium border border-gray-200">
                        {params?.interfaceMethod || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-gray-600 font-medium">
                      {params?.authMethod || '-'}
                    </td>
                    <td className="px-4 py-4 text-[12px] text-gray-500 font-mono truncate max-w-[200px]">
                      {params?.baseUrl || '-'}
                    </td>
                    <td className="px-4 py-4 text-[12px] text-gray-800 font-mono">
                      {params?.channelCode || '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                       {completed ? (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#008d7510] text-[#008d75] text-[11px] font-bold border border-[#008d7520]">
                           <CheckCircle2 className="w-3 h-3" />
                           설정 완료
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[11px] font-medium border border-gray-100 italic whitespace-nowrap">
                           설정 대기
                         </span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
