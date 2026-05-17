/**
 * BO 관리자 권한 정의 (중앙화)
 *
 * 4단계 권한 그룹:
 *  ① SUPER             : 슈퍼관리자
 *  ② ENTERPRISE_INFO   : 기업정보 담당자
 *  ③ ENTERPRISE_INFO_2 : 기업정보 담당자2 (기업 정보 화면의 인터페이스/SSO/파라미터만 수정)
 *  ④ OTHER             : 기타 (확장용)
 */

export const ROLES = ['SUPER', 'ENTERPRISE_INFO', 'ENTERPRISE_INFO_2', 'OTHER'] as const;
export type Role = typeof ROLES[number];

/** 권한 코드 → 한글 라벨 */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER: '슈퍼관리자',
  ENTERPRISE_INFO: '기업정보 담당자',
  ENTERPRISE_INFO_2: '기업정보 담당자2',
  OTHER: '기타',
};

/** 권한 코드 → 번호 표시 (①②③④) */
export const ROLE_NUMBERS: Record<Role, string> = {
  SUPER: '①',
  ENTERPRISE_INFO: '②',
  ENTERPRISE_INFO_2: '③',
  OTHER: '④',
};

/** 권한 코드 → 텍스트 컬러 (테이블 셀 등) */
export const ROLE_TEXT_COLORS: Record<Role, string> = {
  SUPER: 'text-red-600',
  ENTERPRISE_INFO: 'text-blue-700',
  ENTERPRISE_INFO_2: 'text-emerald-700',
  OTHER: 'text-gray-600',
};

/** 권한 코드 → 배지 배경/테두리 */
export const ROLE_BADGE_COLORS: Record<Role, string> = {
  SUPER: 'bg-red-50 text-red-700 border border-red-200',
  ENTERPRISE_INFO: 'bg-blue-50 text-blue-700 border border-blue-200',
  ENTERPRISE_INFO_2: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  OTHER: 'bg-gray-100 text-gray-700 border border-gray-200',
};

/** 권한 코드 → 설명 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER: '모든 메뉴 접근, 수정, 조회 가능',
  ENTERPRISE_INFO: '기업 관리 메뉴 전체 (자금 현황 제외)',
  ENTERPRISE_INFO_2: '기업 관리 > 기업 정보 화면만 접근. 인터페이스 / 파라미터 / SSO 정보만 수정 가능',
  OTHER: '확장용 (추후 정의)',
};

/** OTP 상태 라벨 */
export const OTP_LABELS: Record<'REGISTERED' | 'UNREGISTERED', string> = {
  REGISTERED: '등록',
  UNREGISTERED: '미등록',
};

/** 권한 옵션 배열 (드롭다운/라디오 용) */
export const ROLE_OPTIONS = ROLES.map((id) => ({
  id,
  label: ROLE_LABELS[id],
  number: ROLE_NUMBERS[id],
  description: ROLE_DESCRIPTIONS[id],
  badgeClass: ROLE_BADGE_COLORS[id],
}));
