import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Folder, FolderOpen, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button, DataTable, PageLayout, StatusBadge, Input } from './ui';

interface Menu {
  id: string;
  no: number;
  name: string;
  isUsed: boolean;
  parentId: string | null;
  hasChildren?: boolean;
}

// 순번(no)은 같은 부모 안에서 유일하게 부여됩니다.
// 출처: 하나은행기업자금관리시스템 메뉴구조도(IA) v0.983 (2026-05-13) - 01. ERP 뱅킹 Front
const initialData: Menu[] = [
  { id: '1', no: 1, name: 'ROOT', isUsed: true, parentId: null, hasChildren: true },
  { id: '2', no: 1, name: '온보딩', isUsed: true, parentId: '1', hasChildren: false },
  { id: '3', no: 2, name: '유틸리티', isUsed: true, parentId: '1', hasChildren: true },
  { id: '4', no: 1, name: '로그인', isUsed: true, parentId: '3', hasChildren: false },
  { id: '5', no: 2, name: '비밀번호 재설정', isUsed: true, parentId: '3', hasChildren: false },
  { id: '6', no: 3, name: '사용자 등록', isUsed: true, parentId: '3', hasChildren: false },
  { id: '7', no: 4, name: '공용 로그인', isUsed: true, parentId: '3', hasChildren: false },
  { id: '8', no: 3, name: '대시보드(메인)', isUsed: true, parentId: '1', hasChildren: false },
  { id: '9', no: 4, name: '결재', isUsed: true, parentId: '1', hasChildren: true },
  { id: '10', no: 1, name: '결재관리', isUsed: true, parentId: '9', hasChildren: true },
  { id: '11', no: 1, name: '결재진행', isUsed: true, parentId: '10', hasChildren: false },
  { id: '12', no: 2, name: '결재 완료', isUsed: true, parentId: '10', hasChildren: false },
  { id: '13', no: 5, name: '내역관리/리포트', isUsed: true, parentId: '1', hasChildren: true },
  { id: '14', no: 1, name: '거래내역관리', isUsed: true, parentId: '13', hasChildren: true },
  { id: '15', no: 1, name: '원화입출금내역', isUsed: true, parentId: '14', hasChildren: false },
  { id: '16', no: 2, name: '외화입출금내역', isUsed: true, parentId: '14', hasChildren: false },
  { id: '17', no: 3, name: '가상계좌수신내역', isUsed: true, parentId: '14', hasChildren: false },
  { id: '18', no: 4, name: '외담대수신', isUsed: true, parentId: '14', hasChildren: false },
  { id: '19', no: 5, name: '전자어음수신', isUsed: true, parentId: '14', hasChildren: false },
  { id: '20', no: 2, name: '리포트', isUsed: true, parentId: '13', hasChildren: true },
  { id: '21', no: 1, name: '계좌별 리포트', isUsed: true, parentId: '20', hasChildren: false },
  { id: '22', no: 2, name: '통합 리포트', isUsed: true, parentId: '20', hasChildren: false },
  { id: '23', no: 3, name: '수기계좌 관리', isUsed: true, parentId: '13', hasChildren: true },
  { id: '24', no: 1, name: '정기예금계좌', isUsed: true, parentId: '23', hasChildren: false },
  { id: '25', no: 2, name: '증권계좌', isUsed: true, parentId: '23', hasChildren: false },
  { id: '26', no: 3, name: '차입금계좌', isUsed: true, parentId: '23', hasChildren: false },
  { id: '27', no: 4, name: '수기계좌 내역관리', isUsed: true, parentId: '13', hasChildren: true },
  { id: '28', no: 1, name: '정기예금 내역', isUsed: true, parentId: '27', hasChildren: false },
  { id: '29', no: 2, name: '증권계좌 내역', isUsed: true, parentId: '27', hasChildren: false },
  { id: '30', no: 3, name: '차입금계좌 내역', isUsed: true, parentId: '27', hasChildren: false },
  { id: '31', no: 5, name: '수기계좌 잔액조회', isUsed: true, parentId: '13', hasChildren: true },
  { id: '32', no: 1, name: '정기예금 잔액', isUsed: true, parentId: '31', hasChildren: false },
  { id: '33', no: 2, name: '증권계좌 잔액', isUsed: true, parentId: '31', hasChildren: false },
  { id: '34', no: 3, name: '차입금계좌 잔액', isUsed: true, parentId: '31', hasChildren: false },
  { id: '35', no: 6, name: '대금지급', isUsed: true, parentId: '1', hasChildren: true },
  { id: '36', no: 1, name: '대금지급 상신/결재', isUsed: true, parentId: '35', hasChildren: true },
  { id: '37', no: 1, name: '대금지급 상신', isUsed: true, parentId: '36', hasChildren: false },
  { id: '38', no: 2, name: '대금지급 결재', isUsed: true, parentId: '36', hasChildren: false },
  { id: '39', no: 3, name: '대금지급 결과조회', isUsed: true, parentId: '36', hasChildren: false },
  { id: '40', no: 2, name: '철스크랩지급 상신/결재', isUsed: true, parentId: '35', hasChildren: true },
  { id: '41', no: 1, name: '철스크랩지급 상신', isUsed: true, parentId: '40', hasChildren: false },
  { id: '42', no: 2, name: '철스크랩지급 결재', isUsed: true, parentId: '40', hasChildren: false },
  { id: '43', no: 3, name: '철스크랩지급 결과조회', isUsed: true, parentId: '40', hasChildren: false },
  { id: '44', no: 3, name: '하도급지급 상신/결재', isUsed: true, parentId: '35', hasChildren: true },
  { id: '45', no: 1, name: '하도급지급 상신', isUsed: true, parentId: '44', hasChildren: false },
  { id: '46', no: 2, name: '하도급지급 결재', isUsed: true, parentId: '44', hasChildren: false },
  { id: '47', no: 3, name: '하도급지급 결과조회', isUsed: true, parentId: '44', hasChildren: false },
  { id: '48', no: 4, name: '수기등록거래 상신/결재', isUsed: true, parentId: '35', hasChildren: true },
  { id: '49', no: 1, name: '수기등록거래 상신', isUsed: true, parentId: '48', hasChildren: false },
  { id: '50', no: 2, name: '수기등록거래 결재', isUsed: true, parentId: '48', hasChildren: false },
  { id: '51', no: 3, name: '수기등록거래 결과조회', isUsed: true, parentId: '48', hasChildren: false },
  { id: '52', no: 7, name: '급여이체', isUsed: true, parentId: '1', hasChildren: true },
  { id: '53', no: 1, name: '급여이체 상신/결재', isUsed: true, parentId: '52', hasChildren: true },
  { id: '54', no: 1, name: '급여이체 상신', isUsed: true, parentId: '53', hasChildren: false },
  { id: '55', no: 2, name: '급여이체 결재', isUsed: true, parentId: '53', hasChildren: false },
  { id: '56', no: 3, name: '급여이체 결과조회', isUsed: true, parentId: '53', hasChildren: false },
  { id: '57', no: 4, name: '급여내역 업로드', isUsed: true, parentId: '53', hasChildren: false },
  { id: '58', no: 8, name: '외담대 발행', isUsed: true, parentId: '1', hasChildren: true },
  { id: '59', no: 1, name: '외담대 발행 상신/결재', isUsed: true, parentId: '58', hasChildren: true },
  { id: '60', no: 1, name: '외담대 발행 상신', isUsed: true, parentId: '59', hasChildren: false },
  { id: '61', no: 2, name: '외담대 발행 결재', isUsed: true, parentId: '59', hasChildren: false },
  { id: '62', no: 3, name: '외담대 발행 결과조회', isUsed: true, parentId: '59', hasChildren: false },
  { id: '63', no: 9, name: '지로', isUsed: true, parentId: '1', hasChildren: true },
  { id: '64', no: 1, name: '국고금', isUsed: true, parentId: '63', hasChildren: true },
  { id: '65', no: 1, name: '국고금 상신', isUsed: true, parentId: '64', hasChildren: false },
  { id: '66', no: 2, name: '국고금 결재', isUsed: true, parentId: '64', hasChildren: false },
  { id: '67', no: 3, name: '국고금 결과조회', isUsed: true, parentId: '64', hasChildren: false },
  { id: '68', no: 2, name: '지방세', isUsed: true, parentId: '63', hasChildren: true },
  { id: '69', no: 1, name: '지방세 상신', isUsed: true, parentId: '68', hasChildren: false },
  { id: '70', no: 2, name: '지방세 결재', isUsed: true, parentId: '68', hasChildren: false },
  { id: '71', no: 3, name: '지방세 결과조회', isUsed: true, parentId: '68', hasChildren: false },
  { id: '72', no: 3, name: '사회보험료', isUsed: true, parentId: '63', hasChildren: true },
  { id: '73', no: 1, name: '사회보험료 상신', isUsed: true, parentId: '72', hasChildren: false },
  { id: '74', no: 2, name: '사회보험료 결재', isUsed: true, parentId: '72', hasChildren: false },
  { id: '75', no: 3, name: '사회보험료 결과조회', isUsed: true, parentId: '72', hasChildren: false },
  { id: '76', no: 4, name: '전기/전화', isUsed: true, parentId: '63', hasChildren: true },
  { id: '77', no: 1, name: '전기/전화 상신', isUsed: true, parentId: '76', hasChildren: false },
  { id: '78', no: 2, name: '전기/전화 결재', isUsed: true, parentId: '76', hasChildren: false },
  { id: '79', no: 3, name: '전기/전화 결과조회', isUsed: true, parentId: '76', hasChildren: false },
  { id: '80', no: 5, name: '일반지로요금', isUsed: true, parentId: '63', hasChildren: true },
  { id: '81', no: 1, name: '일반지로요금 상신', isUsed: true, parentId: '80', hasChildren: false },
  { id: '82', no: 2, name: '일반지로요금 결재', isUsed: true, parentId: '80', hasChildren: false },
  { id: '83', no: 3, name: '일반지로요금 결과조회', isUsed: true, parentId: '80', hasChildren: false },
  { id: '84', no: 10, name: '사내이체', isUsed: true, parentId: '1', hasChildren: true },
  { id: '85', no: 1, name: '집금', isUsed: true, parentId: '84', hasChildren: true },
  { id: '86', no: 1, name: '집금 상신', isUsed: true, parentId: '85', hasChildren: false },
  { id: '87', no: 2, name: '집금 결재', isUsed: true, parentId: '85', hasChildren: false },
  { id: '88', no: 3, name: '집금 결과조회', isUsed: true, parentId: '85', hasChildren: false },
  { id: '89', no: 2, name: '계좌간이체(원화)', isUsed: true, parentId: '84', hasChildren: true },
  { id: '90', no: 1, name: '계좌간이체(원화) 상신', isUsed: true, parentId: '89', hasChildren: false },
  { id: '91', no: 2, name: '계좌간이체(원화) 결재', isUsed: true, parentId: '89', hasChildren: false },
  { id: '92', no: 3, name: '계좌간이체(원화) 결과조회', isUsed: true, parentId: '89', hasChildren: false },
  { id: '93', no: 3, name: '계좌간이체(외화)', isUsed: true, parentId: '84', hasChildren: true },
  { id: '94', no: 1, name: '계좌간이체(외화) 상신', isUsed: true, parentId: '93', hasChildren: false },
  { id: '95', no: 2, name: '계좌간이체(외화) 결재', isUsed: true, parentId: '93', hasChildren: false },
  { id: '96', no: 3, name: '계좌간이체(외화) 결과조회', isUsed: true, parentId: '93', hasChildren: false },
  { id: '97', no: 4, name: '환전이체', isUsed: true, parentId: '84', hasChildren: true },
  { id: '98', no: 1, name: '환전이체 상신', isUsed: true, parentId: '97', hasChildren: false },
  { id: '99', no: 2, name: '환전이체 결재', isUsed: true, parentId: '97', hasChildren: false },
  { id: '100', no: 3, name: '환전이체 결과조회', isUsed: true, parentId: '97', hasChildren: false },
  { id: '101', no: 11, name: '외화이체', isUsed: true, parentId: '1', hasChildren: true },
  { id: '102', no: 1, name: '외화이체 상신/결재', isUsed: true, parentId: '101', hasChildren: true },
  { id: '103', no: 1, name: '외화이체 상신', isUsed: true, parentId: '102', hasChildren: false },
  { id: '104', no: 2, name: '외화이체 결재', isUsed: true, parentId: '102', hasChildren: false },
  { id: '105', no: 3, name: '외화이체 결과조회', isUsed: true, parentId: '102', hasChildren: false },
  { id: '106', no: 2, name: '외화수납통지', isUsed: true, parentId: '101', hasChildren: true },
  { id: '107', no: 1, name: '타발송금도착통지', isUsed: true, parentId: '106', hasChildren: false },
  { id: '108', no: 12, name: '법인카드', isUsed: true, parentId: '1', hasChildren: true },
  { id: '109', no: 1, name: '법인카드 조회', isUsed: true, parentId: '108', hasChildren: true },
  { id: '110', no: 1, name: '한도내역 조회', isUsed: true, parentId: '109', hasChildren: false },
  { id: '111', no: 2, name: '승인내역 조회', isUsed: true, parentId: '109', hasChildren: false },
  { id: '112', no: 3, name: '청구내역 조회', isUsed: true, parentId: '109', hasChildren: false },
  { id: '113', no: 4, name: '이용내역 조회', isUsed: true, parentId: '109', hasChildren: false },
  { id: '114', no: 5, name: '신고대상 분류', isUsed: true, parentId: '109', hasChildren: false },
  { id: '115', no: 13, name: '업무 관리', isUsed: true, parentId: '1', hasChildren: true },
  { id: '116', no: 1, name: '업무개시', isUsed: true, parentId: '115', hasChildren: false },
  { id: '117', no: 2, name: '결재 관리', isUsed: true, parentId: '115', hasChildren: true },
  { id: '118', no: 1, name: '대무자 관리', isUsed: true, parentId: '117', hasChildren: false },
  { id: '119', no: 2, name: '결재선 관리', isUsed: true, parentId: '117', hasChildren: false },
  { id: '120', no: 3, name: '계좌 관리', isUsed: true, parentId: '115', hasChildren: true },
  { id: '121', no: 1, name: '은행별 계좌 관리', isUsed: true, parentId: '120', hasChildren: false },
  { id: '122', no: 2, name: '잔액 조회', isUsed: true, parentId: '120', hasChildren: false },
  { id: '123', no: 14, name: '시스템 관리', isUsed: true, parentId: '1', hasChildren: true },
  { id: '124', no: 1, name: '기업 관리', isUsed: true, parentId: '123', hasChildren: false },
  { id: '125', no: 2, name: 'VAN/펌뱅킹 ID 조회', isUsed: true, parentId: '123', hasChildren: false },
  { id: '126', no: 3, name: '메뉴 관리', isUsed: true, parentId: '123', hasChildren: false },
  { id: '127', no: 4, name: 'CI 관리', isUsed: true, parentId: '123', hasChildren: false },
  { id: '128', no: 15, name: '공지사항', isUsed: true, parentId: '1', hasChildren: false },
];

export default function MenuManagement() {
  const location = useLocation();
  const [data, setData] = useState<Menu[]>(initialData);
  // 기본 펼침: ROOT, 결재(9)/결재관리(10), 내역관리/리포트(13)/거래내역관리(14)/리포트(20)
  const [expandedIds, setExpandedIds] = useState<string[]>(['1', '9', '10', '13', '14', '20']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Menu | null>(null);
  const [editName, setEditName] = useState('');
  const [editNo, setEditNo] = useState<string>('');
  const [editIsUsed, setEditIsUsed] = useState(true);

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      const first = initialData.find(m => m.parentId !== null) ?? initialData[0];
      setEditItem(first);
      setEditName(first.name);
      setEditNo(String(first.no));
      setEditIsUsed(first.isUsed);
      setIsEditModalOpen(true);
    }
  }, []);

  // depth(레벨) 계산 — 0depth=ROOT, 1depth, 2depth ...
  const getDepth = (itemId: string, items: Menu[] = data): number => {
    let depth = 0;
    let current: Menu | undefined = items.find(d => d.id === itemId);
    while (current && current.parentId !== null) {
      depth++;
      const parentId = current.parentId;
      current = items.find(d => d.id === parentId);
    }
    return depth;
  };

  // Computed rows — 같은 부모(=같은 레벨) 안에서 순번 오름차순으로 깊이 우선 순회
  const getRenderableRows = () => {
    const result: (Menu & { level: number })[] = [];

    const childrenByParent = new Map<string | null, Menu[]>();
    for (const item of data) {
      const arr = childrenByParent.get(item.parentId) ?? [];
      arr.push(item);
      childrenByParent.set(item.parentId, arr);
    }
    childrenByParent.forEach(arr => arr.sort((a, b) => a.no - b.no));

    const walk = (parentId: string | null, level: number, visible: boolean) => {
      const children = childrenByParent.get(parentId) ?? [];
      for (const child of children) {
        if (visible) {
          result.push({ ...child, level });
        }
        const childVisible = visible && expandedIds.includes(child.id);
        walk(child.id, level + 1, childVisible);
      }
    };

    walk(null, 0, true);
    return result;
  };

  const renderableRows = getRenderableRows();

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(ex => ex !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(renderableRows.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleUse = () => {
    if (selectedIds.length === 0) {
      alert('사용여부를 변경할 메뉴를 선택해주세요.');
      return;
    }
    if (window.confirm(`선택한 ${selectedIds.length}개 메뉴의 사용여부를 변경하시겠습니까?\n(상위 메뉴 미사용 시 하위 메뉴도 함께 미사용 처리됩니다.)`)) {
      setData(prev => {
        let newData = [...prev];

        const getAllDescendantIds = (parentId: string, result: string[] = []) => {
          const children = prev.filter(d => d.parentId === parentId);
          children.forEach(child => {
            result.push(child.id);
            getAllDescendantIds(child.id, result);
          });
          return result;
        };

        selectedIds.forEach(id => {
          const item = prev.find(d => d.id === id);
          if (!item) return;

          const nextIsUsed = !item.isUsed;
          newData = newData.map(d => d.id === id ? { ...d, isUsed: nextIsUsed } : d);

          if (!nextIsUsed) {
            const descendants = getAllDescendantIds(id);
            newData = newData.map(d => descendants.includes(d.id) ? { ...d, isUsed: false } : d);
          }
        });

        return newData;
      });
      setSelectedIds([]);
      alert('변경되었습니다.');
    }
  };

  const handleOpenEdit = () => {
    if (selectedIds.length === 0) {
      alert('수정할 메뉴를 선택해주세요.');
      return;
    }
    if (selectedIds.length > 1) {
      alert('수정은 다건 선택을 지원하지 않습니다. 1개 항목만 선택해주세요.');
      return;
    }
    const item = data.find(d => d.id === selectedIds[0]);
    if (item) {
      setEditItem(item);
      setEditName(item.name);
      setEditNo(String(item.no));
      setEditIsUsed(item.isUsed);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editItem) return;

    if (!editName.trim()) {
      alert('메뉴명을 입력해주세요.');
      return;
    }

    const trimmedNo = editNo.trim();
    if (trimmedNo === '') {
      alert('순번을 입력해주세요.');
      return;
    }
    const parsedNo = Number(trimmedNo);
    if (!Number.isInteger(parsedNo) || parsedNo < 0) {
      alert('순번은 0 이상의 정수만 입력 가능합니다.');
      return;
    }
    const editItemDepth = getDepth(editItem.id);
    const duplicate = data.find(d => {
      if (d.id === editItem.id) return false;
      if (d.no !== parsedNo) return false;
      return getDepth(d.id) === editItemDepth;
    });
    if (duplicate) {
      alert(`동일한 순번(${parsedNo})이 ${editItemDepth}depth 메뉴에 이미 존재합니다.\n(메뉴명: ${duplicate.name})`);
      return;
    }

    setData(prev => {
      let newData = prev.map(item =>
        item.id === editItem.id
          ? { ...item, name: editName.trim(), no: parsedNo, isUsed: editIsUsed }
          : item
      );

      if (!editIsUsed) {
        const getAllDescendantIds = (parentId: string, result: string[] = []) => {
          const children = prev.filter(d => d.parentId === parentId);
          children.forEach(child => {
            result.push(child.id);
            getAllDescendantIds(child.id, result);
          });
          return result;
        };
        const descendants = getAllDescendantIds(editItem.id);
        newData = newData.map(d => descendants.includes(d.id) ? { ...d, isUsed: false } : d);
      }

      return newData;
    });

    setIsEditModalOpen(false);
    setSelectedIds([]);
    alert('저장되었습니다.');
  };

  return (
    <PageLayout bottomPadding={false} className="space-y-0 pb-10">
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenEdit}
          disabled={selectedIds.length !== 1}
        >수정</Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleUse}
          disabled={selectedIds.length === 0}
        >사용여부 변경</Button>
      </div>

      <div className="bg-white rounded-lg border border-border-gray overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-muted border-b border-border-gray text-text-body">
                <th className="h-[52px] px-4 text-body font-semibold text-center w-20 border-r border-border-gray">
                  <div className="leading-tight">
                    순번
                    <div className="text-[11px] font-normal text-text-sub">(레벨별)</div>
                  </div>
                </th>
                <th className="h-[52px] px-4 text-center w-16 border-r border-border-gray">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 accent-[#008d75] cursor-pointer"
                    checked={renderableRows.length > 0 && selectedIds.length === renderableRows.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="h-[52px] px-4 text-body font-semibold border-r border-border-gray">메뉴명</th>
                <th className="h-[52px] px-4 text-body font-semibold text-center w-32">사용여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EB]">
              {renderableRows.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer h-[52px] hover:bg-bg-gray transition-colors ${
                    !item.isUsed ? 'bg-bg-gray' : 'bg-white'
                  } ${selectedIds.includes(item.id) ? 'bg-primary/5' : ''}`}
                  onClick={() => toggleSelect(item.id)}
                  onDoubleClick={() => { setSelectedIds([item.id]); handleOpenEdit(); }}
                  >
                  <td className="px-4 text-center text-body text-text-sub border-r border-border-gray">{item.no}</td>
                  <td className="px-4 text-center border-r border-border-gray">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border-input text-primary focus:ring-0 accent-[#008d75] cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 text-body border-r border-border-gray">
                    <div
                      className="flex items-center cursor-pointer select-none group"
                      style={{ paddingLeft: `${item.level * 24}px` }}
                      onClick={() => {
                        if (item.hasChildren) {
                          setExpandedIds(prev =>
                            prev.includes(item.id) ? prev.filter(ex => ex !== item.id) : [...prev, item.id]
                          );
                        }
                      }}
                    >
                      {item.hasChildren ? (
                        <div className="w-5 h-5 flex items-center justify-center mr-1">
                          {expandedIds.includes(item.id) ? (
                            <ChevronDown className="w-3.5 h-3.5 text-text-sub group-hover:text-text-main transition-colors" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-text-sub group-hover:text-text-main transition-colors" />
                          )}
                        </div>
                      ) : (
                        <div className="w-5 h-5 mr-1 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-border-input" />
                        </div>
                      )}

                      <div className={`mr-2.5 flex items-center justify-center ${!item.isUsed ? 'text-border-input' : 'text-primary/50'}`}>
                        {item.hasChildren ? (
                           expandedIds.includes(item.id) ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
                        ) : (
                           <FileText className="w-4 h-4 text-text-sub" />
                        )}
                      </div>

                      <span className={`font-medium ${!item.isUsed ? 'text-text-sub' : 'text-text-main'}`}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 text-center">
                    <StatusBadge status={item.isUsed ? 'ON' : 'OFF'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
              <h2 className="text-title-sm font-semibold text-text-main">메뉴 수정</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-text-sub hover:text-text-main transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-8 bg-white overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <h3 className="text-body-lg font-semibold text-text-main">메뉴 정보</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-body font-semibold text-text-main">
                    메뉴명 <span className="text-status-error">*</span>
                  </label>
                  <Input
                    size="sm"
                    fullWidth
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="메뉴명 입력"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-body font-semibold text-text-main">
                    순번 <span className="text-status-error">*</span>
                  </label>
                  <Input
                    size="sm"
                    fullWidth
                    type="number"
                    min={0}
                    step={1}
                    value={editNo}
                    onChange={(e) => setEditNo(e.target.value)}
                    placeholder="순번 입력"
                  />
                  <p className="text-text-sub" style={{ fontSize: 12 }}>
                    같은 레벨(depth) 메뉴 안에서 유일한 값이어야 합니다.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <h3 className="text-body-lg font-semibold text-text-main">사용 여부</h3>
                </div>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="useStatus"
                      checked={editIsUsed === true}
                      onChange={() => setEditIsUsed(true)}
                      className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                    />
                    <span className="text-body text-text-body group-hover:text-text-main transition-colors">사용 (ON)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="useStatus"
                      checked={editIsUsed === false}
                      onChange={() => setEditIsUsed(false)}
                      className="w-4 h-4 border-border-input text-primary focus:ring-0 cursor-pointer accent-[#008d75]"
                    />
                    <span className="text-body text-text-body group-hover:text-text-main transition-colors">미사용 (OFF)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="h-[72px] px-6 border-t border-border-gray bg-bg-gray flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="md"
                style={{ width: 120 }}
                onClick={() => setIsEditModalOpen(false)}
              >
                닫기
              </Button>
              <Button
                variant="primary"
                size="md"
                style={{ width: 120 }}
                onClick={handleSaveEdit}
              >
                저장하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
