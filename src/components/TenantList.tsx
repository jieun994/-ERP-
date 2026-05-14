import React, { useState } from 'react';
import { Button, FilterBar, DataTable, StatusBadge, PageLayout, Input, Select, ConfirmModal } from './ui';
import TenantRegisterModal from './TenantRegisterModal';

interface Tenant {
  id: number;
  tenantCode: string;
  tenantName: string;
  isUsed: boolean;
}

const mockData: Tenant[] = [
  { id: 1, tenantCode: 'TOSS', tenantName: '(주)토스페이먼츠', isUsed: true },
  { id: 2, tenantCode: 'WOOWAHAN', tenantName: '우아한형제들', isUsed: true },
  { id: 4, tenantCode: 'INNOVATION', tenantName: '(주)혁신테크', isUsed: true },
  { id: 3, tenantCode: 'DAANGN', tenantName: '당근마켓', isUsed: false },
];

export default function TenantList() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [data, setData] = useState<Tenant[]>(mockData);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);

  // 사용여부 변경 확인 모달
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

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

  const handleToggleUse = () => {
    if (selectedIds.length === 0) return;
    setShowToggleConfirm(true);
  };

  const doToggleUse = () => {
    setData(data.map(d => selectedIds.includes(d.id) ? { ...d, isUsed: !d.isUsed } : d));
    setSelectedIds([]);
    setShowToggleConfirm(false);
  };

  const handleExcelDownload = () => {
    alert('엑셀 다운로드를 실행합니다.');
  };

  // 등록 버튼 클릭
  const handleOpenRegister = () => {
    setTenantToEdit(null);
    setIsModalOpen(true);
  };

  // 수정 버튼 클릭 (체크박스 1개 선택 시)
  const handleOpenEdit = () => {
    const target = data.find(d => d.id === selectedIds[0]);
    if (target) {
      setTenantToEdit(target);
      setIsModalOpen(true);
    }
  };

  // 행 클릭 → 수정 모달
  const handleRowClick = (tenant: Tenant) => {
    setTenantToEdit(tenant);
    setIsModalOpen(true);
  };

  // 모달 저장 처리 (등록 / 수정)
  const handleSave = (saved: Omit<Tenant, 'id'> & { id?: number }) => {
    if (saved.id !== undefined) {
      setData(prev => prev.map(d => d.id === saved.id ? { ...d, ...saved, id: d.id } : d));
    } else {
      const newId = Math.max(0, ...data.map(d => d.id)) + 1;
      setData(prev => [...prev, { ...saved, id: newId }]);
    }
  };

  const existingCodes = data.map(d => d.tenantCode);

  return (
    <PageLayout>
      {/* 테넌트 등록/수정 모달 */}
      <TenantRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        tenantToEdit={tenantToEdit}
        existingCodes={existingCodes}
      />

      {/* 사용여부 변경 확인 모달 */}
      <ConfirmModal
        open={showToggleConfirm}
        variant="warning"
        title="사용여부를 변경하시겠습니까?"
        description="선택한 테넌트의 사용여부 상태가 반전됩니다."
        confirmLabel="변경"
        cancelLabel="취소"
        onConfirm={doToggleUse}
        onCancel={() => setShowToggleConfirm(false)}
      />

      {/* 검색 영역 */}
      <FilterBar onSearch={() => {}} onReset={() => {}}>
        <FilterBar.Field label="테넌트명">
          <Input type="text" placeholder="테넌트명 입력" fullWidth />
        </FilterBar.Field>
        <FilterBar.Field label="사용여부">
          <Select fullWidth>
            <option value="ALL">전체</option>
            <option value="use">사용</option>
            <option value="unused">미사용</option>
          </Select>
        </FilterBar.Field>
      </FilterBar>

      {/* 그리드 컨트롤 */}
      <DataTable.Controls total={data.length}>
        <Button variant="primary" size="sm" onClick={handleOpenRegister}>등록</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length !== 1} onClick={handleOpenEdit}>수정</Button>
        <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleToggleUse}>사용여부 변경</Button>
        <Button variant="ghost" size="sm" onClick={handleExcelDownload}>엑셀 다운로드</Button>
      </DataTable.Controls>

      {/* 그리드 */}
      <div className="bg-white border border-[#E5E8EB] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F2F4F6] border-b border-[#E5E8EB] text-[#4E5968]">
                <th className="h-[52px] px-4 text-center border-r border-[#E5E8EB] w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center border-r border-[#E5E8EB] w-16">No.</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB] w-36">테넌트 코드</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold border-r border-[#E5E8EB]">테넌트명</th>
                <th className="h-[52px] px-4 text-[14px] font-semibold text-center w-32">사용여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[14px] text-[#8B95A1]">
                    조회된 테넌트가 없습니다.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className={`h-[52px] transition-colors cursor-pointer hover:bg-[#F2F9F7] ${selectedIds.includes(item.id) ? 'bg-[#008d7508]' : 'bg-white'}`}
                  >
                    <td
                      className="px-4 text-center border-r border-[#E5E8EB]"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#D1D6DB] text-[#008d75] focus:ring-0 accent-[#008d75] cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="px-4 text-[13px] text-center text-[#8B95A1] border-r border-[#E5E8EB] font-mono">{index + 1}</td>
                    <td className="px-4 text-[13px] font-mono text-[#4E5968] border-r border-[#E5E8EB]">{item.tenantCode}</td>
                    <td className="px-4 text-[14px] font-medium text-[#191F28] border-r border-[#E5E8EB]">{item.tenantName}({item.tenantCode})</td>
                    <td className="px-4 text-center">
                      <StatusBadge status={item.isUsed ? 'ON' : 'OFF'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
