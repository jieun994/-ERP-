import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EnterpriseEditModal from './EnterpriseEditModal';
import EnterpriseRegister from './EnterpriseRegister';
import { Button, SearchBar, DataTable, StatusBadge, PageLayout, Select, Input } from './ui';

interface Enterprise {
  id: number;
  tenant: string;
  name: string;
  bizNumber: string;
  corpNumber: string;
  isUsed: boolean;
}

const mockData: Enterprise[] = [
  { id: 1, tenant: '(주)토스페이먼츠', name: '(주)토스페이먼츠', bizNumber: '120-81-12345', corpNumber: '110111-1234567', isUsed: true },
  { id: 2, tenant: '(주)토스페이먼츠', name: '(주)토스페이자회사', bizNumber: '120-81-22345', corpNumber: '110111-2234567', isUsed: true },
  { id: 3, tenant: '우아한형제들', name: '우아한형제들', bizNumber: '120-81-67890', corpNumber: '110111-3234567', isUsed: true },
  { id: 4, tenant: '당근마켓', name: '당근마켓', bizNumber: '120-81-54321', corpNumber: '110111-4234567', isUsed: false },
  { id: 7, tenant: '(주)혁신테크', name: '(주)혁신테크', bizNumber: '123-45-67890', corpNumber: '110111-7234567', isUsed: true },
  { id: 5, tenant: '야놀자', name: '야놀자', bizNumber: '120-81-09876', corpNumber: '110111-5234567', isUsed: true },
  { id: 6, tenant: '스타벅스코리아', name: '스타벅스코리아', bizNumber: '120-81-55555', corpNumber: '110111-6234567', isUsed: true },
];

export default function EnterpriseList() {
  const location = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [data, setData] = useState<Enterprise[]>(mockData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEnterpriseId, setEditEnterpriseId] = useState<number | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setEditEnterpriseId(mockData[0].id);
      setIsEditModalOpen(true);
    }
  }, []);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 기업을 선택해주세요.');
      return;
    }
    if (confirm(`선택한 ${selectedIds.length}개 기업을 삭제하시겠습니까?`)) {
      setData(data.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  const handleToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('사용여부를 변경할 기업을 선택해주세요.');
      return;
    }
    setData(data.map(d => selectedIds.includes(d.id) ? { ...d, isUsed: !d.isUsed } : d));
    setSelectedIds([]);
  };

  const handleEdit = () => {
    if (selectedIds.length === 0) {
      alert('수정할 기업을 선택해주세요.');
      return;
    }
    if (selectedIds.length > 1) {
      alert('수정은 다건 선택을 지원하지 않습니다. 1개 기업만 선택해주세요.');
      return;
    }
    setEditEnterpriseId(selectedIds[0]);
    setIsEditModalOpen(true);
  };

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  return (
    <PageLayout>
      {/* Search Area */}
      <SearchBar onSearch={() => {}} onReset={() => {}}>
        <SearchBar.Field label="테넌트명">
          <Select style={{ width: 192 }}>
            <option value="ALL">전체</option>
            <option value="toss">(주)토스페이먼츠</option>
            <option value="woowahan">우아한형제들</option>
            <option value="daangn">당근마켓</option>
            <option value="yanolja">야놀자</option>
          </Select>
        </SearchBar.Field>
        <SearchBar.Field label="기업명">
          <Input type="text" placeholder="기업명 입력" style={{ width: 224 }} />
        </SearchBar.Field>
        <SearchBar.Field label="사용여부">
          <Select style={{ width: 128 }}>
            <option value="ALL">전체</option>
            <option value="use">사용</option>
            <option value="unused">미사용</option>
          </Select>
        </SearchBar.Field>
      </SearchBar>

      {/* Grid Controls */}
      <DataTable.Controls total={data.length}>
        <Button variant="ghost" size="sm" disabled={selectedIds.length !== 1} onClick={handleEdit}>수정</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleDelete}>삭제</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleToggleUse}>사용여부 변경</Button>
        <Button variant="ghost" size="sm" onClick={handleExcelDownload}>엑셀 다운로드</Button>
      </DataTable.Controls>

      {/* Table */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center border-r border-[#E5E8EB] w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">테넌트</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">기업명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">사업자등록번호</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">법인등록번호</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center">사용여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer h-[52px] transition-colors hover:bg-[#F9FAFB] ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : 'bg-white'}`}
                  onClick={() => toggleSelect(item.id)}
                  onDoubleClick={() => { setSelectedIds([item.id]); setIsEditModalOpen(true); }}
                  >
                  <td className="px-4 text-center border-r border-[#E5E8EB]">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-[#D1D6DB] text-[#008d75] focus:ring-0 cursor-pointer accent-[#008d75]"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 text-center text-[13px] text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{index + 1}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] border-r border-[#E5E8EB]">{item.tenant}</td>
                  <td className="px-4 text-[14px] font-medium text-[#191F28] border-r border-[#E5E8EB]">
                    <div className="flex items-center gap-2">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-4 text-[14px] text-[#4E5968] font-mono tracking-tight border-r border-[#E5E8EB]">{item.bizNumber}</td>
                  <td className="px-4 text-[14px] text-[#4E5968] font-mono tracking-tight border-r border-[#E5E8EB]">{item.corpNumber}</td>
                  <td className="px-4 text-center">
                    <StatusBadge status={item.isUsed ? 'ON' : 'OFF'} />
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-[14px] text-[#8B95A1]">
                    조회된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 팝업 */}
      <EnterpriseEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        enterpriseId={editEnterpriseId}
      />
    </PageLayout>
  );
}
