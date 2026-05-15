import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input } from './ui';

// ─────────────────────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────────────────────

interface EnterpriseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseId: number | null;
  enterprise?: EnterpriseSeed | null;
}

export interface EnterpriseSeed {
  id: number;
  tenant: string;
  tenantCode: string;
  name: string;
  bizNumber: string;
  corpNumber: string;
  isUsed: boolean;
  erpVendor?: string;
  masterEmail?: string;
}

type ScrapType = 'iron' | 'copper' | 'gold' | 'nonFerrous';
type BankAccount = { bank: string; account: string };

type VanInfo = {
  van: string;
  wonId: string;
  foreignId: string;
  giroId: string;
  salaryIds: string[];
  scrapAccounts: Record<ScrapType, BankAccount>;
};

type InterfaceMethod = 'REST' | 'OData';
type ParamDef = { name: string };
type InterfaceDef = { id: string; name: string; params: ParamDef[] };
type InterfaceConfig = { enabled: boolean; paramEndpoints: Record<string, string> };

type InterfaceCfg = {
  method: InterfaceMethod;
  baseUrl: string;
  interfaces: Record<string, InterfaceConfig>;
};

type MenuNode = {
  id: string;
  name: string;
  isUsed: boolean;
  children: MenuNode[];
};

type UsageInfo = {
  menus: Record<string, boolean>;
  bulkTransferLimit: number;
  largeTransferEnabled: boolean;
  manualTxExcelUploadEnabled: boolean; // 수기거래 엑셀 업로드 — 수기등록거래 상신(id 49)이 ON일 때만 허용
};

// 수기거래 엑셀 업로드의 선결조건이 되는 메뉴: 수기등록거래 상신
const MANUAL_TX_SUBMIT_MENU_ID = '49';

// ─────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────

const ERP_VENDORS = ['더존', 'SAP', 'Oracle', '영림원', 'ECOUNT', '자체개발', '기타'];

const PUMBANKING_SINGLE_FIELDS: { key: 'wonId' | 'foreignId' | 'giroId'; label: string }[] = [
  { key: 'wonId', label: '원화 펌뱅킹 ID' },
  { key: 'foreignId', label: '외화 펌뱅킹 ID' },
  { key: 'giroId', label: '지로 펌뱅킹 ID' },
];

const SCRAP_TYPES: { key: ScrapType; label: string }[] = [
  { key: 'iron', label: '철' },
  { key: 'copper', label: '구리' },
  { key: 'gold', label: '금' },
  { key: 'nonFerrous', label: '비철' },
];

const BANK_LIST = [
  '하나은행', 'KB국민은행', '신한은행', '우리은행', 'IBK기업은행',
  'NH농협은행', 'SC제일은행', '카카오뱅크', '토스뱅크', '케이뱅크',
  '새마을금고', '우체국', '수협은행',
];

const INTERFACE_METHODS: { value: InterfaceMethod; label: string }[] = [
  { value: 'REST', label: 'REST' },
  { value: 'OData', label: 'OData' },
];

const INTERFACE_DEFS: InterfaceDef[] = [
  {
    id: 'employee',
    name: '사원 정보 조회',
    params: [
      { name: 'CompanyCode' },
      { name: 'SystemId' },
      { name: 'FromDate' },
      { name: 'ToDate' },
      { name: 'DepartmentId' },
    ],
  },
  {
    id: 'department',
    name: '조직/부서 조회',
    params: [
      { name: 'CompanyCode' },
      { name: 'ValidDate' },
    ],
  },
  {
    id: 'account',
    name: '계정과목 조회',
    params: [
      { name: 'CompanyCode' },
      { name: 'ChartOfAccounts' },
      { name: 'FromDate' },
      { name: 'ToDate' },
    ],
  },
  {
    id: 'purchase',
    name: '구매오더 조회',
    params: [
      { name: 'CompanyCode' },
      { name: 'Vendor' },
      { name: 'DocumentDate' },
      { name: 'DocumentType' },
    ],
  },
  {
    id: 'sales',
    name: '판매오더 조회',
    params: [
      { name: 'CompanyCode' },
      { name: 'Customer' },
      { name: 'OrderDate' },
    ],
  },
  {
    id: 'inventory',
    name: '재고 조회',
    params: [
      { name: 'CompanyCode' },
      { name: 'Plant' },
      { name: 'Material' },
      { name: 'StorageLocation' },
    ],
  },
];

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

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────

function makeEmptyVan(): VanInfo {
  return {
    van: '',
    wonId: '',
    foreignId: '',
    giroId: '',
    salaryIds: [''],
    scrapAccounts: {
      iron: { bank: '', account: '' },
      copper: { bank: '', account: '' },
      gold: { bank: '', account: '' },
      nonFerrous: { bank: '', account: '' },
    },
  };
}

function makeDefaultInterfaceCfg(): InterfaceCfg {
  const ifaces: Record<string, InterfaceConfig> = {};
  for (const def of INTERFACE_DEFS) {
    const paramEndpoints: Record<string, string> = {};
    for (const p of def.params) paramEndpoints[p.name] = '';
    ifaces[def.id] = { enabled: false, paramEndpoints };
  }
  return { method: 'REST', baseUrl: '', interfaces: ifaces };
}

function collectLeafIds(nodes: MenuNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children.length === 0) acc.push(n.id);
    else collectLeafIds(n.children, acc);
  }
  return acc;
}
function collectDescendantLeafIds(node: MenuNode, acc: string[] = []): string[] {
  if (node.children.length === 0) acc.push(node.id);
  else for (const c of node.children) collectDescendantLeafIds(c, acc);
  return acc;
}
const ALL_LEAF_IDS = collectLeafIds(MENU_TREE);

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

function TriCheckbox({
  state,
  onChange,
  ariaLabel,
}: { state: CheckState; onChange: () => void; ariaLabel?: string }) {
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

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basic',     label: '기업 기본정보' },
  { key: 'van',       label: 'VAN/펌뱅킹 ID' },
  { key: 'interface', label: '인터페이스/파라미터' },
  { key: 'usage',     label: '기타 설정' },
];
type TabKey = 'basic' | 'van' | 'interface' | 'usage';

export default function EnterpriseEditModal({
  isOpen,
  onClose,
  enterpriseId,
  enterprise,
}: EnterpriseEditModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  // ── 기본정보 ─────────────────────────────────────────────
  const seedTenant      = enterprise?.tenant ?? '(주)토스페이먼츠';
  const seedTenantCode  = enterprise?.tenantCode ?? 'TOSS';
  const seedName        = enterprise?.name ?? '(주)토스페이먼츠';
  const seedBizNumber   = enterprise?.bizNumber ?? '120-81-12345';
  const seedCorpNumber  = enterprise?.corpNumber ?? '110111-1234567';

  const [erpVendor, setErpVendor]       = useState(enterprise?.erpVendor ?? '');
  const [masterEmail, setMasterEmail]   = useState(enterprise?.masterEmail ?? '');
  const [isUsed, setIsUsed]             = useState<boolean>(enterprise?.isUsed ?? true);
  const [basicErrors, setBasicErrors]   = useState<{ erpVendor?: string; masterEmail?: string }>({});

  // ── VAN/펌뱅킹 ──────────────────────────────────────────
  const [van, setVan] = useState<VanInfo>(makeEmptyVan);

  // ── 인터페이스 ──────────────────────────────────────────
  const [ifaceCfg, setIfaceCfg] = useState<InterfaceCfg>(makeDefaultInterfaceCfg);

  // ── 사용 메뉴/기타 ──────────────────────────────────────
  const [usage, setUsage] = useState<UsageInfo>({
    menus: {},
    bulkTransferLimit: 1000,
    largeTransferEnabled: false,
    manualTxExcelUploadEnabled: false,
  });
  const [expandedMenuIds, setExpandedMenuIds] = useState<string[]>(DEFAULT_EXPANDED_IDS);

  // ※ 훅은 early return(!isOpen) 이전에 모두 호출되어야 함 — hooks order 위반 방지
  const renderableMenuRows = useMemo(
    () => getRenderableMenuRows(expandedMenuIds),
    [expandedMenuIds]
  );

  // 모달이 새로 열릴 때 / enterprise prop이 바뀔 때 폼 상태 재설정
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('basic');
    setErpVendor(enterprise?.erpVendor ?? '');
    setMasterEmail(enterprise?.masterEmail ?? '');
    setIsUsed(enterprise?.isUsed ?? true);
    setBasicErrors({});
    setVan(makeEmptyVan());
    setIfaceCfg(makeDefaultInterfaceCfg());
    setUsage({ menus: {}, bulkTransferLimit: 1000, largeTransferEnabled: false, manualTxExcelUploadEnabled: false });
    setExpandedMenuIds(DEFAULT_EXPANDED_IDS);
  }, [isOpen, enterpriseId, enterprise]);

  if (!isOpen) return null;

  // ── 저장 ─────────────────────────────────────────────────
  const handleSave = () => {
    // 기본정보 검증
    const errs: typeof basicErrors = {};
    if (!erpVendor.trim()) errs.erpVendor = '사용 ERP사를 선택해주세요.';
    if (!masterEmail.trim()) errs.masterEmail = '마스터 이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(masterEmail)) errs.masterEmail = '올바른 이메일 형식이 아닙니다.';

    if (Object.keys(errs).length > 0) {
      setBasicErrors(errs);
      setActiveTab('basic');
      return;
    }
    onClose();
  };

  // ── VAN 핸들러 ───────────────────────────────────────────
  const updateSalaryId = (i: number, v: string) => {
    setVan(p => {
      const arr = [...p.salaryIds];
      arr[i] = v;
      return { ...p, salaryIds: arr };
    });
  };
  const addSalaryId = () => setVan(p => ({ ...p, salaryIds: [...p.salaryIds, ''] }));
  const removeSalaryId = (i: number) => {
    setVan(p => {
      const arr = p.salaryIds.filter((_, idx) => idx !== i);
      return { ...p, salaryIds: arr.length ? arr : [''] };
    });
  };
  const updateScrap = (t: ScrapType, field: 'bank' | 'account', v: string) => {
    setVan(p => ({
      ...p,
      scrapAccounts: { ...p.scrapAccounts, [t]: { ...p.scrapAccounts[t], [field]: v } },
    }));
  };

  // ── 인터페이스 핸들러 ───────────────────────────────────
  const toggleInterface = (id: string) => {
    setIfaceCfg(prev => ({
      ...prev,
      interfaces: {
        ...prev.interfaces,
        [id]: { ...prev.interfaces[id], enabled: !prev.interfaces[id].enabled },
      },
    }));
  };
  const handleParamEndpoint = (ifaceId: string, paramName: string, v: string) => {
    setIfaceCfg(prev => ({
      ...prev,
      interfaces: {
        ...prev.interfaces,
        [ifaceId]: {
          ...prev.interfaces[ifaceId],
          paramEndpoints: { ...prev.interfaces[ifaceId].paramEndpoints, [paramName]: v },
        },
      },
    }));
  };

  // ── 사용 메뉴 핸들러 ────────────────────────────────────
  const handleMenuNodeToggle = (node: MenuNode) => {
    const state = getNodeCheckState(node, usage.menus);
    const leaves = collectDescendantLeafIds(node);
    const nextChecked = state !== 'checked';
    setUsage(prev => {
      const next = { ...prev.menus };
      for (const id of leaves) next[id] = nextChecked;
      // 수기등록거래 상신이 OFF가 되면 의존 기능(엑셀 업로드)도 자동 OFF
      const submitOff = leaves.includes(MANUAL_TX_SUBMIT_MENU_ID) && !nextChecked;
      return {
        ...prev,
        menus: next,
        manualTxExcelUploadEnabled: submitOff ? false : prev.manualTxExcelUploadEnabled,
      };
    });
  };
  const handleAllMenusToggle = () => {
    const allChecked = ALL_LEAF_IDS.every(id => usage.menus[id]);
    setUsage(prev => {
      const next: Record<string, boolean> = {};
      for (const id of ALL_LEAF_IDS) next[id] = !allChecked;
      return { ...prev, menus: next };
    });
  };
  const toggleMenuExpand = (id: string) => {
    setExpandedMenuIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedLeafCount = ALL_LEAF_IDS.filter(id => usage.menus[id]).length;
  const totalLeafCount    = ALL_LEAF_IDS.length;
  const allMenusState: CheckState =
    selectedLeafCount === 0 ? 'unchecked'
    : selectedLeafCount === totalLeafCount ? 'checked'
    : 'indeterminate';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 h-[56px] border-b border-border-gray shrink-0 bg-white">
            <h2 className="text-title-sm font-semibold text-text-main">
              기업 정보 수정 {seedName ? <span className="text-text-sub font-normal">— {seedName}</span> : null}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-border-gray bg-white px-6 shrink-0">
            {TABS.map(t => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={
                    'px-4 py-3 text-body font-semibold transition-colors border-b-2 -mb-px ' +
                    (active
                      ? 'text-primary border-primary'
                      : 'text-text-sub border-transparent hover:text-text-main')
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* 본문 */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-bg-gray">
            {activeTab === 'basic' && (
              <div className="bg-white border border-border-gray rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-body font-semibold text-text-main mb-1.5">테넌트</label>
                    <input
                      readOnly
                      value={`${seedTenant}(${seedTenantCode})`}
                      className="w-full h-[40px] px-4 bg-bg-gray border border-border-gray rounded-md text-body text-text-sub outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-body font-semibold text-text-main mb-1.5">기업명</label>
                    <input
                      readOnly
                      value={seedName}
                      className="w-full h-[40px] px-4 bg-bg-gray border border-border-gray rounded-md text-body text-text-sub outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-body font-semibold text-text-main mb-1.5">사업자등록번호</label>
                    <input
                      readOnly
                      value={seedBizNumber}
                      className="w-full h-[40px] px-4 bg-bg-gray border border-border-gray rounded-md text-body text-text-sub outline-none cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-body font-semibold text-text-main mb-1.5">법인등록번호</label>
                    <input
                      readOnly
                      value={seedCorpNumber || '-'}
                      className="w-full h-[40px] px-4 bg-bg-gray border border-border-gray rounded-md text-body text-text-sub outline-none cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-body font-semibold text-text-main mb-1.5">
                      사용 ERP사 <span className="text-status-error">*</span>
                    </label>
                    <select
                      value={erpVendor}
                      onChange={e => {
                        setErpVendor(e.target.value);
                        setBasicErrors(p => ({ ...p, erpVendor: '' }));
                      }}
                      className={`w-full h-[42px] px-3 border rounded-md text-body bg-white outline-none focus:border-primary focus:ring-1 focus:ring-[#008d75] ${
                        basicErrors.erpVendor ? 'border-status-error' : 'border-border-gray'
                      } ${erpVendor ? 'text-text-main' : 'text-text-sub'}`}
                    >
                      <option value="">선택</option>
                      {ERP_VENDORS.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    {basicErrors.erpVendor && (
                      <p className="text-caption text-status-error flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {basicErrors.erpVendor}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-body font-semibold text-text-main mb-1.5">
                      마스터 이메일 <span className="text-status-error">*</span>
                    </label>
                    <Input
                      fullWidth
                      type="email"
                      error={!!basicErrors.masterEmail}
                      placeholder="example@company.com"
                      value={masterEmail}
                      onChange={e => {
                        setMasterEmail(e.target.value);
                        setBasicErrors(p => ({ ...p, masterEmail: '' }));
                      }}
                    />
                    {basicErrors.masterEmail && (
                      <p className="text-caption text-status-error flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {basicErrors.masterEmail}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-body font-semibold text-text-main mb-1.5">사용여부</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isUsed"
                          checked={isUsed}
                          onChange={() => setIsUsed(true)}
                          className="w-4 h-4 accent-[#008d75]"
                        />
                        <span className="text-body text-text-main">사용</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isUsed"
                          checked={!isUsed}
                          onChange={() => setIsUsed(false)}
                          className="w-4 h-4 accent-[#008d75]"
                        />
                        <span className="text-body text-text-main">미사용</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'van' && (
              <div className="bg-white border border-border-gray rounded-xl shadow-sm p-6 space-y-6">
                {/* VAN 정보 */}
                <div>
                  <h3 className="text-body-lg font-semibold text-gray-700 mb-1">VAN 정보</h3>
                  <p className="text-body-sm text-gray-500 mb-4">결제 대행에 사용되는 VAN ID를 입력합니다.</p>
                  <div className="max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-body font-semibold text-text-main mb-1.5">VAN ID</label>
                        <Input
                          type="text"
                          fullWidth
                          placeholder="VAN ID 입력"
                          value={van.van}
                          onChange={e => setVan(p => ({ ...p, van: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* 펌뱅킹 ID */}
                <div>
                  <h3 className="text-body-lg font-semibold text-gray-700 mb-1">펌뱅킹 ID</h3>
                  <p className="text-body-sm text-gray-500 mb-5">업무 유형별 펌뱅킹 ID를 입력합니다. 사용하는 항목만 입력하면 됩니다.</p>

                  <div className="max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {PUMBANKING_SINGLE_FIELDS.map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-body font-semibold text-text-main mb-1.5">{label}</label>
                          <Input
                            type="text"
                            fullWidth
                            placeholder="펌뱅킹 ID 입력"
                            value={van[key]}
                            onChange={e => setVan(p => ({ ...p, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>

                    {/* 급여 */}
                    <div className="pt-5 border-t border-bg-muted">
                      <div className="flex items-baseline gap-2 mb-2">
                        <label className="text-body font-semibold text-text-main">급여 펌뱅킹 ID</label>
                        <span className="text-body-sm text-text-sub">여러 개 등록 가능</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="flex flex-col gap-2">
                          {van.salaryIds.map((id, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  fullWidth
                                  placeholder={`펌뱅킹 ID ${i + 1}`}
                                  value={id}
                                  onChange={e => updateSalaryId(i, e.target.value)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSalaryId(i)}
                                disabled={van.salaryIds.length === 1 && !id.trim()}
                                className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-text-sub hover:text-status-error hover:bg-bg-gray disabled:text-border-gray disabled:cursor-not-allowed rounded-md transition-colors"
                                title="삭제"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addSalaryId}
                            className="self-start flex items-center gap-1 text-body-sm text-primary hover:text-primary-dark font-semibold mt-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            펌뱅킹 ID 추가
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* 기타계좌 */}
                <div>
                  <h3 className="text-body-lg font-semibold text-gray-700 mb-1">기타계좌</h3>
                  <p className="text-body-sm text-gray-500 mb-5">스크랩 계좌 정보를 입력합니다. 사용하는 항목만 입력하면 됩니다.</p>

                  <div className="max-w-3xl">
                    {/* 스크랩 */}
                    <div>
                      <p className="text-body font-semibold text-text-main mb-2">스크랩 계좌</p>
                      <div className="border border-border-gray rounded-md overflow-hidden">
                        <div className="grid grid-cols-[80px_1fr_1fr] gap-3 px-4 py-2 bg-bg-gray border-b border-border-gray">
                          <span className="text-body-sm font-semibold text-text-sub">구분</span>
                          <span className="text-body-sm font-semibold text-text-sub">은행</span>
                          <span className="text-body-sm font-semibold text-text-sub">계좌번호</span>
                        </div>
                        <div className="divide-y divide-[#E5E8EB]">
                          {SCRAP_TYPES.map(({ key, label }) => {
                            const acc = van.scrapAccounts[key];
                            return (
                              <div key={key} className="grid grid-cols-[80px_1fr_1fr] gap-3 px-4 py-3 items-center bg-white">
                                <span className="text-body font-semibold text-text-main">{label}</span>
                                <select
                                  value={acc.bank}
                                  onChange={e => updateScrap(key, 'bank', e.target.value)}
                                  className="w-full h-[42px] px-3 border border-border-gray rounded-md text-body bg-white text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-[#008d75]"
                                >
                                  <option value="">은행 선택</option>
                                  {BANK_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <Input
                                  type="text"
                                  fullWidth
                                  placeholder="계좌번호 입력"
                                  value={acc.account}
                                  onChange={e => updateScrap(key, 'account', e.target.value)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interface' && (
              <div className="bg-white border border-border-gray rounded-xl shadow-sm p-6 space-y-6">
                {/* Base URL */}
                <div>
                  <label className="block text-body font-semibold text-gray-700 mb-1.5">
                    Base URL <span className="text-status-error">*</span>
                  </label>
                  <Input
                    fullWidth
                    placeholder="https://your-erp-system.com"
                    value={ifaceCfg.baseUrl}
                    onChange={e => setIfaceCfg(p => ({ ...p, baseUrl: e.target.value }))}
                  />
                </div>

                {/* 인터페이스 방식 */}
                <div>
                  <label className="block text-body font-semibold text-gray-700 mb-3">
                    인터페이스 방식 <span className="text-status-error">*</span>
                  </label>
                  <div className="flex items-center gap-6">
                    {INTERFACE_METHODS.map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="method-edit"
                          value={value}
                          checked={ifaceCfg.method === value}
                          onChange={() => setIfaceCfg(p => ({ ...p, method: value }))}
                          className="w-4 h-4 accent-[#008d75] cursor-pointer"
                        />
                        <span className="text-body text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* 인터페이스 목록 */}
                <div>
                  <h3 className="text-body-lg font-semibold text-gray-700 mb-3">인터페이스 목록</h3>
                  <div className="flex flex-col gap-2">
                    {INTERFACE_DEFS.map(def => {
                      const cfg = ifaceCfg.interfaces[def.id];
                      const enabled = cfg?.enabled ?? false;
                      const borderCls = enabled ? 'border-primary/30' : 'border-gray-200';
                      const headerBgCls = enabled ? 'bg-primary/5' : 'bg-gray-50';
                      const trackCls = enabled ? 'bg-primary' : 'bg-gray-300';
                      const thumbCls = enabled ? 'translate-x-4' : 'translate-x-0.5';
                      const nameCls2 = enabled ? 'text-gray-800' : 'text-gray-400';
                      return (
                        <div key={def.id} className={'border rounded-lg overflow-hidden ' + borderCls}>
                          <div className={'flex items-center gap-3 px-4 py-3 ' + headerBgCls}>
                            <button
                              type="button"
                              onClick={() => toggleInterface(def.id)}
                              className={'relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ' + trackCls}
                            >
                              <span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ' + thumbCls} />
                            </button>
                            <span className={'text-body font-semibold flex-1 ' + nameCls2}>{def.name}</span>
                            <span className={'text-caption px-2 py-0.5 rounded-full border flex-shrink-0 ' + (enabled ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-gray-400 border-gray-200')}>
                              {enabled ? '사용' : '미사용'}
                            </span>
                          </div>
                          {enabled && (
                            <div className="border-t border-primary/10 px-4 py-3 flex flex-col gap-2">
                              {def.params.map(param => (
                                <div key={param.name} className="flex items-center gap-3">
                                  <span className="w-[148px] flex-shrink-0 text-caption font-mono text-gray-400 select-none truncate">
                                    {param.name}
                                  </span>
                                  <Input
                                    size="sm"
                                    fullWidth
                                    placeholder="/api/v1/..."
                                    value={cfg?.paramEndpoints[param.name] ?? ''}
                                    onChange={e => handleParamEndpoint(def.id, param.name, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="bg-white border border-border-gray rounded-xl shadow-sm p-6 space-y-6">
                {/* 사용 메뉴 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-body-lg font-semibold text-gray-700">사용할 메뉴 설정</h4>
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

                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-md mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <TriCheckbox state={allMenusState} onChange={handleAllMenusToggle} ariaLabel="전체 선택" />
                      <span className="text-body font-semibold text-gray-700">전체 선택</span>
                    </label>
                    {selectedLeafCount > 0 && allMenusState !== 'checked' && (
                      <span className="text-caption text-gray-500">{selectedLeafCount}개 선택됨</span>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    {renderableMenuRows.map(row => {
                      const state = getNodeCheckState(row, usage.menus);
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
                          <TriCheckbox
                            state={state}
                            onChange={() => handleMenuNodeToggle(row)}
                            ariaLabel={row.name}
                          />
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
                  <h4 className="text-body-lg font-semibold text-gray-700 mb-1">기타 설정</h4>
                  <p className="text-body-sm text-gray-500 mb-5">이체 관련 부가 설정을 구성합니다.</p>
                  <div className="flex flex-col gap-4">
                    {/* 대량이체 */}
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
                            value={usage.bulkTransferLimit}
                            onChange={e => {
                              const val = parseInt(e.target.value, 10);
                              setUsage(p => ({
                                ...p,
                                bulkTransferLimit: isNaN(val) || val < 1 ? 1 : val > 99999 ? 99999 : val,
                              }));
                            }}
                            className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-body text-right outline-none focus:border-primary focus:ring-1 focus:ring-[#008d75]"
                          />
                          <span className="text-body-sm text-gray-500 whitespace-nowrap">건</span>
                        </div>
                      </div>
                      {usage.bulkTransferLimit !== 1000 && (
                        <div className="mt-2 flex items-center gap-1 text-caption text-amber-600">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>기본값(1,000건)에서 변경되었습니다.</span>
                        </div>
                      )}
                    </div>

                    {/* 거액이체 */}
                    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 border border-gray-100 rounded-md">
                      <div>
                        <div className="text-body font-semibold text-gray-700">거액이체 사용 여부</div>
                        <div className="text-caption text-gray-500 mt-0.5">
                          활성화 시 일정 금액 이상의 이체에 거액이체 절차가 적용됩니다.
                        </div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={usage.largeTransferEnabled}
                        onClick={() => setUsage(p => ({ ...p, largeTransferEnabled: !p.largeTransferEnabled }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#008d75] focus:ring-offset-2 ${
                          usage.largeTransferEnabled ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            usage.largeTransferEnabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* 수기거래 엑셀 업로드 — 수기등록거래 상신이 ON일 때만 활성화 */}
                    {(() => {
                      const submitEnabled = !!usage.menus[MANUAL_TX_SUBMIT_MENU_ID];
                      const checked = submitEnabled && usage.manualTxExcelUploadEnabled;
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
                            onClick={() => setUsage(p => ({ ...p, manualTxExcelUploadEnabled: !p.manualTxExcelUploadEnabled }))}
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
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 gap-3 shrink-0">
            <Button variant="secondary" size="md" onClick={onClose}>
              취소
            </Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              저장
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
