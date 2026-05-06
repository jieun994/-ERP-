import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Enterprise {
  id: number;
  name: string;
}

export default function EnterpriseInterfaceSettings({ enterprises }: { enterprises: Enterprise[] }) {
  const [selectedEnt, setSelectedEnt] = useState<Enterprise | null>(enterprises[0] || null);
  const [interfaceType, setInterfaceType] = useState('REST');

  return (
    <div className="flex flex-col h-[600px] gap-6">
      {/* 1. Common Settings */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg p-6 shadow-sm">
        <h3 className="text-[15px] font-bold text-gray-900 mb-4">공통 인터페이스 설정</h3>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-semibold text-gray-700 w-24">인터페이스 방식</span>
            <select className="w-48 h-[40px] px-4 border border-[#D1D6DB] rounded-md text-[13px]" value={interfaceType} onChange={(e) => setInterfaceType(e.target.value)}>
                <option value="REST">REST</option>
                <option value="OData">OData</option>
                <option value="RFC">RFC</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-semibold text-gray-700 w-24">인증 방식</span>
            <select className="w-48 h-[40px] px-4 border border-[#D1D6DB] rounded-md text-[13px]">
                <option>None</option>
                <option>Basic Auth</option>
                <option>Bearer Token</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Enterprise Parameter Panel */}
      <div className="flex flex-1 border border-[#E5E8EB] rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Left: Enterprise List */}
        <div className="w-[300px] border-r border-[#E5E8EB] bg-[#F9FAFB] flex flex-col">
            <div className="p-3 border-b border-[#E5E8EB]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    <input className="w-full pl-9 pr-3 py-2 border border-[#D1D6DB] rounded-md text-[13px]" placeholder="기업명 검색..." />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {enterprises.map(ent => (
                    <div 
                        key={ent.id} 
                        className={`p-4 border-b border-[#E5E8EB] cursor-pointer hover:bg-gray-100 ${selectedEnt?.id === ent.id ? 'bg-white border-l-4 border-l-[#008d75]' : ''}`}
                        onClick={() => setSelectedEnt(ent)}
                    >
                        <div className="text-[13px] font-bold text-gray-900">{ent.name}</div>
                        <div className="text-[12px] text-gray-500 mt-1">상태: 필수 항목 누락</div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Right: Detail Settings */}
        <div className="flex-1 p-6 overflow-y-auto">
            {selectedEnt ? (
                <div className="space-y-6">
                    <h3 className="text-[15px] font-bold text-gray-900 pb-2 border-b border-[#E5E8EB]">{selectedEnt.name} 상세 파라미터</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <label className="block text-[12px] font-semibold text-gray-600 mb-1">파라미터 {i}</label>
                                <input className="w-full px-3 py-2 border border-[#D1D6DB] rounded-md text-[13px]" placeholder="값 입력"/>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-[13px]">기업을 선택해주세요.</div>
            )}
        </div>
      </div>
    </div>
  );
}
