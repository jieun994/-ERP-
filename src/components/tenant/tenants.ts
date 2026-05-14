// 테넌트 데이터 — 테넌트 조회와 기업 등록 화면에서 공유
// ※ 실제 구현 시에는 API를 통해 조회한다.

export interface Tenant {
  id: number;
  tenantCode: string;
  tenantName: string;
  isUsed: boolean;
}

export const MOCK_TENANTS: Tenant[] = [
  { id: 1, tenantCode: 'TOSS',       tenantName: '(주)토스페이먼츠', isUsed: true  },
  { id: 2, tenantCode: 'WOOWAHAN',   tenantName: '우아한형제들',     isUsed: true  },
  { id: 4, tenantCode: 'INNOVATION', tenantName: '(주)혁신테크',     isUsed: true  },
  { id: 3, tenantCode: 'DAANGN',     tenantName: '당근마켓',         isUsed: false },
];
