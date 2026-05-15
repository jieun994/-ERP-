import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui';

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

type CompanyUsageInfo = {
  // 사용 메뉴 선택 — leaf 메뉴 id를 key로 보관. 부모(폴더형) 노드는 자식 상태로 자동 집계되므로 별도 저장하지 않는다.
  menus: Record<string, boolean>;
  // 기타 설정
  bulkTransferLimit: number;    // 대량이체 건수 한도 (기본 1000)
  largeTransferEnabled: boolean; // 거액이체 사용여부
  manualTxExcelUploadEnabled: boolean; // 수기거래 엑셀 업로드 사용여부 (수기등록거래 상신이 ON일 때만 허용)
};

// 수기거래 엑셀 업로드의 선결조건이 되는 메뉴: 수기등록거래 상신
const MANUAL_TX_SUBMIT_MENU_ID = '49';

/**
 * 기업별 사용 설정 상태
 *
 * waiting (대기) : 한 번도 진입하지 않았거나, 메뉴를 하나도 체크하지 않은 상태
 * done    (완료) : 메뉴가 1개 이상 선택된 상태
 *
 * ※ 실제 저장(서버 전송)은 최종 단계 완료 시 일괄 처리됨
 */
type EntStatus = 'waiting' | 'done';

// ─── 메뉴 트리 데이터 ───────────────────────────────────────────────────────
// MenuManagement 화면의 mock 데이터를 그대로 복제 (와이어용 — 실제 동기화 X).
// MenuManagement에 아직 자식이 등록되지 않은 1depth는 자식 없는 노드로 추가.
// isUsed = MenuManagement에서 설정한 전역 사용여부. 와이어에서는 미사용도 선택은 가능(시각적으로만 dim 처리).
type MenuNode = {
  id: string;
  name: string;
  isUsed: boolean;
  children: MenuNode[];
};

// 출처: 하나은행기업자금관리시스템 메뉴구조도(IA) v0.983 (2026-05-13)
// MenuManagement 화면의 mock 데이터와 동일한 ID 체계를 사용한다.
const MENU_TREE: MenuNode[] = [
  {
    id: '9', name: '결재', isUsed: true,
    children: [
      {
        id: '10', name: '결재관리', isUsed: true,
        children: [
          { id: '11', name: '결재진행', isUsed: true, children: [] },
          { id: '12', name: '결재 완료', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '13', name: '내역관리/리포트', isUsed: true,
    children: [
      {
        id: '14', name: '거래내역관리', isUsed: true,
        children: [
          { id: '15', name: '원화입출금내역', isUsed: true, children: [] },
          { id: '16', name: '외화입출금내역', isUsed: true, children: [] },
          { id: '17', name: '가상계좌수신내역', isUsed: true, children: [] },
          { id: '18', name: '외담대수신', isUsed: true, children: [] },
          { id: '19', name: '전자어음수신', isUsed: true, children: [] },
        ],
      },
      {
        id: '20', name: '리포트', isUsed: true,
        children: [
          { id: '21', name: '계좌별 리포트', isUsed: true, children: [] },
          { id: '22', name: '통합 리포트', isUsed: true, children: [] },
        ],
      },
      {
        id: '23', name: '수기계좌 관리', isUsed: true,
        children: [
          { id: '24', name: '정기예금계좌', isUsed: true, children: [] },
          { id: '25', name: '증권계좌', isUsed: true, children: [] },
          { id: '26', name: '차입금계좌', isUsed: true, children: [] },
        ],
      },
      {
        id: '27', name: '수기계좌 내역관리', isUsed: true,
        children: [
          { id: '28', name: '정기예금 내역', isUsed: true, children: [] },
          { id: '29', name: '증권계좌 내역', isUsed: true, children: [] },
          { id: '30', name: '차입금계좌 내역', isUsed: true, children: [] },
        ],
      },
      {
        id: '31', name: '수기계좌 잔액조회', isUsed: true,
        children: [
          { id: '32', name: '정기예금 잔액', isUsed: true, children: [] },
          { id: '33', name: '증권계좌 잔액', isUsed: true, children: [] },
          { id: '34', name: '차입금계좌 잔액', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '35', name: '대금지급', isUsed: true,
    children: [
      {
        id: '36', name: '대금지급 상신/결재', isUsed: true,
        children: [
          { id: '37', name: '대금지급 상신', isUsed: true, children: [] },
          { id: '38', name: '대금지급 결재', isUsed: true, children: [] },
          { id: '39', name: '대금지급 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '40', name: '철스크랩지급 상신/결재', isUsed: true,
        children: [
          { id: '41', name: '철스크랩지급 상신', isUsed: true, children: [] },
          { id: '42', name: '철스크랩지급 결재', isUsed: true, children: [] },
          { id: '43', name: '철스크랩지급 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '44', name: '하도급지급 상신/결재', isUsed: true,
        children: [
          { id: '45', name: '하도급지급 상신', isUsed: true, children: [] },
          { id: '46', name: '하도급지급 결재', isUsed: true, children: [] },
          { id: '47', name: '하도급지급 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '48', name: '수기등록거래 상신/결재', isUsed: true,
        children: [
          { id: '49', name: '수기등록거래 상신', isUsed: true, children: [] },
          { id: '50', name: '수기등록거래 결재', isUsed: true, children: [] },
          { id: '51', name: '수기등록거래 결과조회', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '52', name: '급여이체', isUsed: true,
    children: [
      {
        id: '53', name: '급여이체 상신/결재', isUsed: true,
        children: [
          { id: '54', name: '급여이체 상신', isUsed: true, children: [] },
          { id: '55', name: '급여이체 결재', isUsed: true, children: [] },
          { id: '56', name: '급여이체 결과조회', isUsed: true, children: [] },
          { id: '57', name: '급여내역 업로드', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '58', name: '외담대 발행', isUsed: true,
    children: [
      {
        id: '59', name: '외담대 발행 상신/결재', isUsed: true,
        children: [
          { id: '60', name: '외담대 발행 상신', isUsed: true, children: [] },
          { id: '61', name: '외담대 발행 결재', isUsed: true, children: [] },
          { id: '62', name: '외담대 발행 결과조회', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '63', name: '지로', isUsed: true,
    children: [
      {
        id: '64', name: '국고금', isUsed: true,
        children: [
          { id: '65', name: '국고금 상신', isUsed: true, children: [] },
          { id: '66', name: '국고금 결재', isUsed: true, children: [] },
          { id: '67', name: '국고금 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '68', name: '지방세', isUsed: true,
        children: [
          { id: '69', name: '지방세 상신', isUsed: true, children: [] },
          { id: '70', name: '지방세 결재', isUsed: true, children: [] },
          { id: '71', name: '지방세 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '72', name: '사회보험료', isUsed: true,
        children: [
          { id: '73', name: '사회보험료 상신', isUsed: true, children: [] },
          { id: '74', name: '사회보험료 결재', isUsed: true, children: [] },
          { id: '75', name: '사회보험료 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '76', name: '전기/전화', isUsed: true,
        children: [
          { id: '77', name: '전기/전화 상신', isUsed: true, children: [] },
          { id: '78', name: '전기/전화 결재', isUsed: true, children: [] },
          { id: '79', name: '전기/전화 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '80', name: '일반지로요금', isUsed: true,
        children: [
          { id: '81', name: '일반지로요금 상신', isUsed: true, children: [] },
          { id: '82', name: '일반지로요금 결재', isUsed: true, children: [] },
          { id: '83', name: '일반지로요금 결과조회', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '84', name: '사내이체', isUsed: true,
    children: [
      {
        id: '85', name: '집금', isUsed: true,
        children: [
          { id: '86', name: '집금 상신', isUsed: true, children: [] },
          { id: '87', name: '집금 결재', isUsed: true, children: [] },
          { id: '88', name: '집금 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '89', name: '계좌간이체(원화)', isUsed: true,
        children: [
          { id: '90', name: '계좌간이체(원화) 상신', isUsed: true, children: [] },
          { id: '91', name: '계좌간이체(원화) 결재', isUsed: true, children: [] },
          { id: '92', name: '계좌간이체(원화) 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '93', name: '계좌간이체(외화)', isUsed: true,
        children: [
          { id: '94', name: '계좌간이체(외화) 상신', isUsed: true, children: [] },
          { id: '95', name: '계좌간이체(외화) 결재', isUsed: true, children: [] },
          { id: '96', name: '계좌간이체(외화) 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '97', name: '환전이체', isUsed: true,
        children: [
          { id: '98', name: '환전이체 상신', isUsed: true, children: [] },
          { id: '99', name: '환전이체 결재', isUsed: true, children: [] },
          { id: '100', name: '환전이체 결과조회', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '101', name: '외화이체', isUsed: true,
    children: [
      {
        id: '102', name: '외화이체 상신/결재', isUsed: true,
        children: [
          { id: '103', name: '외화이체 상신', isUsed: true, children: [] },
          { id: '104', name: '외화이체 결재', isUsed: true, children: [] },
          { id: '105', name: '외화이체 결과조회', isUsed: true, children: [] },
        ],
      },
      {
        id: '106', name: '외화수납통지', isUsed: true,
        children: [
          { id: '107', name: '타발송금도착통지', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '108', name: '법인카드', isUsed: true,
    children: [
      {
        id: '109', name: '법인카드 조회', isUsed: true,
        children: [
          { id: '110', name: '한도내역 조회', isUsed: true, children: [] },
          { id: '111', name: '승인내역 조회', isUsed: true, children: [] },
          { id: '112', name: '청구내역 조회', isUsed: true, children: [] },
          { id: '113', name: '이용내역 조회', isUsed: true, children: [] },
          { id: '114', name: '신고대상 분류', isUsed: true, children: [] },
        ],
      },
    ],
  },
  {
    id: '115', name: '업무 관리', isUsed: true,
    children: [
      { id: '116', name: '업무개시', isUsed: true, children: [] },
      {
        id: '117', name: '결재 관리', isUsed: true,
        children: [
          { id: '118', name: '대무자 관리', isUsed: true, children: [] },
          { id: '119', name: '결재선 관리', isUsed: true, children: [] },
        ],
      },
      {
        id: '120', name: '계좌 관리', isUsed: true,
        children: [
          { id: '121', name: '은행별 계좌 관리', isUsed: true, children: [] },
          { id: '122', name: '잔액 조회', isUsed: true, children: [] },
        ],
      },
    ],
  },
];

// 트리에서 leaf(자식이 없는 노드)만 수집
function collectLeafIds(nodes: MenuNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children.length === 0) acc.push(n.id);
    else collectLeafIds(n.children, acc);
  }
  return acc;
}
// 한 노드를 기준으로 자손 leaf id 수집 (자기 자신이 leaf면 본인 포함)
function collectDescendantLeafIds(node: MenuNode, acc: string[] = []): string[] {
  if (node.children.length === 0) acc.push(node.id);
  else for (const c of node.children) collectDescendantLeafIds(c, acc);
  return acc;
}

const ALL_LEAF_IDS = collectLeafIds(MENU_TREE);

// 노드의 체크 상태를 자손 leaf 선택값으로부터 계산
type CheckState = 'checked' | 'indeterminate' | 'unchecked';
function getNodeCheckState(node: MenuNode, menus: Record<string, boolean>): CheckState {
  const leaves = collectDescendantLeafIds(node);
  if (leaves.length === 0) return 'unchecked';
  let checked = 0;
  for (const id of leaves) if (menus[id]) checked++;
  if (checked === 0) return 'unchecked';
  if (checked === leaves.length) return 'checked';
  return 'indeterminate';
}

// 펼침 상태에 따라 실제 렌더할 행 목록을 평탄화
type MenuRow = MenuNode & { depth: number; hasChildren: boolean };
function getRenderableMenuRows(expandedIds: string[]): MenuRow[] {
  const rows: MenuRow[] = [];
  const walk = (nodes: MenuNode[], depth: number) => {
    for (const node of nodes) {
      const hasChildren = node.children.length > 0;
      rows.push({ ...node, depth, hasChildren });
      if (hasChildren && expandedIds.includes(node.id)) {
        walk(node.children, depth + 1);
      }
    }
  };
  walk(MENU_TREE, 0);
  return rows;
}

const DEFAULT_EXPANDED_IDS = MENU_TREE.filter(n => n.children.length > 0).map(n => n.id);

const EMPTY_INFO: CompanyUsageInfo = {
  menus: {},
  bulkTransferLimit: 1000,
  largeTransferEnabled: false,
  manualTxExcelUploadEnabled: false,
};

function isComplete(info: CompanyUsageInfo): boolean {
  // 메뉴는 최소 1개 선택 필수
  return Object.values(info.menus).some(Boolean);
}

// ─── 공용 컴포넌트 ────────────────────────────────────────────────────────────
// indeterminate 상태를 표시할 수 있는 체크박스. React props에는 indeterminate가 없어 ref로 직접 설정.
function TriCheckbox({
  state,
  onChange,
  ariaLabel,
}: {
  state: CheckState;
  onChange: () => void;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'indeterminate';
  }, [state]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={state === 'checked'}
      onChange={onChange}
      aria-label={ariaLabel}
      className="w-4 h-4 accent-[#008d75] cursor-pointer"
    />
  );
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface Enterprise {
  id: string;
  name: string;
}

export default function EnterpriseUsageSettings({ enterprises }: { enterprises: Enterprise[] }) {
  const [usageData, setUsageData] = useState<Record<string, CompanyUsageInfo>>(() => {
    const data: Record<string, CompanyUsageInfo> = {};
    enterprises.forEach(e => {
      data[e.id] = {
        ...EMPTY_INFO,
        menus: { ...EMPTY_INFO.menus },
      };
    });
    return data;
  });

  const [selectedEntId, setSelectedEntId] = useState<string>(enterprises[0]?.id || '');
  const [currentRow, setCurrentRow] = useState<CompanyUsageInfo>(() => ({
    ...EMPTY_INFO,
    menus: { ...EMPTY_INFO.menus },
  }));
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedFeedback, setSavedFeedback] = useState(false);
  // 메뉴 트리의 펼침 상태 — 기본은 1depth 모두 펼쳐서 보여줌
  const [expandedMenuIds, setExpandedMenuIds] = useState<string[]>(DEFAULT_EXPANDED_IDS);

  if (enterprises.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-body">표시할 기업 정보가 없습니다.</p>
        <p className="text-body-sm mt-1">1단계에서 기업을 먼저 추가해주세요.</p>
      </div>
    );
  }

  // 기업 탭 전환 시 현재 값을 state에 보관 후 새 기업 데이터 로드
  const switchEnterprise = (newId: string) => {
    if (newId === selectedEntId) return;
    setUsageData(prev => ({ ...prev, [selectedEntId]: { ...currentRow } }));
    setSelectedEntId(newId);
    const next = usageData[newId] || EMPTY_INFO;
    setCurrentRow({
      ...next,
      menus: { ...next.menus },
    });
  };

  const handleChange = <K extends keyof CompanyUsageInfo>(field: K, value: CompanyUsageInfo[K]) => {
    setCurrentRow(prev => ({ ...prev, [field]: value }));
  };

  // 노드 토글 — leaf면 본인만, 부모면 자손 leaf 일괄 토글 (미사용도 동일 규칙 적용).
  const handleMenuNodeToggle = (node: MenuNode) => {
    const state = getNodeCheckState(node, currentRow.menus);
    const leaves = collectDescendantLeafIds(node);
    const nextChecked = state !== 'checked'; // unchecked / indeterminate → 모두 체크, checked → 모두 해제
    setCurrentRow(prev => {
      const nextMenus = { ...prev.menus };
      for (const id of leaves) nextMenus[id] = nextChecked;
      // 수기등록거래 상신이 OFF가 되면 의존 기능(엑셀 업로드)도 자동 OFF
      const submitOff = leaves.includes(MANUAL_TX_SUBMIT_MENU_ID) && !nextChecked;
      return {
        ...prev,
        menus: nextMenus,
        manualTxExcelUploadEnabled: submitOff ? false : prev.manualTxExcelUploadEnabled,
      };
    });
  };

  const handleAllMenusToggle = () => {
    const allChecked = ALL_LEAF_IDS.every(id => currentRow.menus[id]);
    setCurrentRow(prev => {
      const nextMenus: Record<string, boolean> = {};
      for (const id of ALL_LEAF_IDS) nextMenus[id] = !allChecked;
      return { ...prev, menus: nextMenus };
    });
  };

  const toggleMenuExpand = (id: string) => {
    setExpandedMenuIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleReset = () => {
    setCurrentRow({
      ...EMPTY_INFO,
      menus: { ...EMPTY_INFO.menus },
    });
  };

  const handleSave = () => {
    setUsageData(prev => ({ ...prev, [selectedEntId]: { ...currentRow } }));
    setSavedIds(prev => new Set([...prev, selectedEntId]));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const getStatus = (id: string): EntStatus => {
    if (savedIds.has(id)) return 'done';
    const info = id === selectedEntId ? currentRow : (usageData[id] || EMPTY_INFO);
    return isComplete(info) ? 'done' : 'waiting';
  };

  // 메뉴 선택 카운터 / 전체 선택 상태
  const selectedLeafCount = ALL_LEAF_IDS.filter(id => currentRow.menus[id]).length;
  const totalLeafCount    = ALL_LEAF_IDS.length;
  const allMenusState: CheckState =
    selectedLeafCount === 0 ? 'unchecked'
    : selectedLeafCount === totalLeafCount ? 'checked'
    : 'indeterminate';
  const renderableMenuRows = getRenderableMenuRows(expandedMenuIds);

  return (
    <div className="relative">

      {/* 본문: 사이드바 + 콘텐츠 */}
      <div className="flex gap-6" style={{ minHeight: 460 }}>

        {/* 사이드바 */}
        <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden self-start">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-body-lg font-semibold text-gray-700">등록 기업 목록</span>
          </div>
          <div className="overflow-y-auto">
            {enterprises.map(ent => {
              const status   = getStatus(ent.id);
              const isActive = ent.id === selectedEntId;
              return (
                <button
                  key={ent.id}
                  onClick={() => switchEnterprise(ent.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 border-l-2 transition-colors border-b border-gray-50 ${
                    isActive
                      ? 'bg-primary/5 border-l-[#008d75]'
                      : 'border-l-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`text-body font-semibold truncate ${isActive ? 'text-primary' : 'text-gray-800'}`}>
                      {ent.name}
                    </div>
                    <div className="text-body-sm text-gray-400 mt-0.5">
                      {status === 'done' ? '입력 완료' : '미입력'}
                    </div>
                  </div>
                  <span className={`text-caption px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${
                    status === 'done'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {status === 'done' ? '완료' : '대기'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

          {/* 콘텐츠 헤더 */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div className="text-body-lg font-bold text-gray-900">
              {enterprises.find(e => e.id === selectedEntId)?.name}
            </div>
            <button
              onClick={handleReset}
              className="flex-shrink-0 flex items-center gap-1.5 text-body-sm text-gray-500 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* 사용할 메뉴 설정 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-body-lg font-semibold text-gray-700">사용할 메뉴 설정</h3>
              <span className="text-caption text-gray-500">
                {selectedLeafCount} / {totalLeafCount} 선택
              </span>
            </div>
            <p className="text-body-sm text-gray-500 mb-1">
              이 기업이 사용할 메뉴를 선택하세요 (3depth까지). 최소 1개 이상 선택해야 합니다.
            </p>
            <p className="text-caption text-gray-400 mb-4">
              현재 미사용(메뉴 관리) 상태의 메뉴도 미리 선택해둘 수 있습니다. 추후 사용으로 전환되면 자동 활성됩니다.
            </p>

            {/* 전체 선택 */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-md mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <TriCheckbox state={allMenusState} onChange={handleAllMenusToggle} ariaLabel="전체 선택" />
                <span className="text-body font-semibold text-gray-700">전체 선택</span>
              </label>
              {selectedLeafCount > 0 && allMenusState !== 'checked' && (
                <span className="text-caption text-gray-500">{selectedLeafCount}개 선택됨</span>
              )}
            </div>

            {/* 메뉴 트리 — 3depth까지, 미사용도 선택 가능 (시각적으로만 dim) */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {renderableMenuRows.map(row => {
                const state = getNodeCheckState(row, currentRow.menus);
                const isExpanded = expandedMenuIds.includes(row.id);
                const dim = !row.isUsed;
                return (
                  <div
                    key={row.id}
                    className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors ${
                      state !== 'unchecked' ? 'bg-primary/5' : 'bg-white hover:bg-gray-50'
                    }`}
                    style={{ paddingLeft: `${16 + row.depth * 24}px` }}
                  >
                    {/* 펼침 토글 / leaf 점 */}
                    {row.hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggleMenuExpand(row.id)}
                        className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label={isExpanded ? '접기' : '펼치기'}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                      </span>
                    )}

                    {/* 체크박스 */}
                    <TriCheckbox
                      state={state}
                      onChange={() => handleMenuNodeToggle(row)}
                      ariaLabel={row.name}
                    />

                    {/* 메뉴명 */}
                    <span
                      className={`flex-1 text-body truncate ${
                        dim
                          ? 'text-gray-400'
                          : state !== 'unchecked'
                            ? 'text-primary font-semibold'
                            : 'text-gray-800'
                      }`}
                    >
                      {row.name}
                    </span>

                    {/* 사용/미사용 배지 */}
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded-full text-caption font-medium border ${
                        row.isUsed
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}
                    >
                      {row.isUsed ? '사용' : '미사용'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* 기타 설정 */}
          <div>
            <h3 className="text-body-lg font-semibold text-gray-700 mb-1">기타 설정</h3>
            <p className="text-body-sm text-gray-500 mb-5">
              이체 관련 부가 설정을 구성합니다.
            </p>

            <div className="flex flex-col gap-4">

              {/* 대량이체 건수 설정 */}
              <div className="px-4 py-4 bg-gray-50 border border-gray-100 rounded-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-body font-semibold text-gray-700">대량이체 건수 한도</div>
                    <div className="text-caption text-gray-500 mt-0.5">
                      1회 대량이체 시 처리 가능한 최대 건수를 설정합니다.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={99999}
                      value={currentRow.bulkTransferLimit}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        handleChange('bulkTransferLimit', isNaN(val) || val < 1 ? 1 : val > 99999 ? 99999 : val);
                      }}
                      className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-body text-right outline-none focus:border-primary focus:ring-1 focus:ring-[#008d75]"
                    />
                    <span className="text-body-sm text-gray-500 whitespace-nowrap">건</span>
                  </div>
                </div>
                {currentRow.bulkTransferLimit !== 1000 && (
                  <div className="mt-2 flex items-center gap-1 text-caption text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>기본값(1,000건)에서 변경되었습니다.</span>
                  </div>
                )}
              </div>

              {/* 거액이체 사용 여부 */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 border border-gray-100 rounded-md">
                <div>
                  <div className="text-body font-semibold text-gray-700">거액이체 사용 여부</div>
                  <div className="text-caption text-gray-500 mt-0.5">
                    활성화 시 일정 금액 이상의 이체에 거액이체 절차가 적용됩니다.
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={currentRow.largeTransferEnabled}
                  onClick={() => handleChange('largeTransferEnabled', !currentRow.largeTransferEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#008d75] focus:ring-offset-2 ${
                    currentRow.largeTransferEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      currentRow.largeTransferEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* 수기거래 엑셀 업로드 사용 여부 — '수기등록거래 상신'이 ON일 때만 활성화 */}
              {(() => {
                const submitEnabled = !!currentRow.menus[MANUAL_TX_SUBMIT_MENU_ID];
                const checked = submitEnabled && currentRow.manualTxExcelUploadEnabled;
                return (
                  <div className={`flex items-center justify-between gap-4 px-4 py-3 border rounded-md ${
                    submitEnabled ? 'bg-gray-50 border-gray-100' : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}>
                    <div>
                      <div className="text-body font-semibold text-gray-700">수기거래 엑셀 업로드 사용 여부</div>
                      <div className="text-caption text-gray-500 mt-0.5">
                        {submitEnabled
                          ? '활성화 시 수기등록거래 상신 화면에서 엑셀 일괄 업로드를 사용할 수 있습니다.'
                          : '먼저 [대금지급 > 수기등록거래 상신] 메뉴를 사용하도록 설정해야 합니다.'}
                      </div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={checked}
                      disabled={!submitEnabled}
                      onClick={() => handleChange('manualTxExcelUploadEnabled', !currentRow.manualTxExcelUploadEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#008d75] focus:ring-offset-2 ${
                        checked ? 'bg-primary' : 'bg-gray-300'
                      } ${!submitEnabled ? 'cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          checked ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })()}

            </div>
          </div>

          {/* 하단: 저장 버튼 */}
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <Button variant="primary" size="md" onClick={handleSave}>
              {savedFeedback ? '✓ 저장됨' : '저장'}
            </Button>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
