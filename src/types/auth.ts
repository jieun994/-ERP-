/**
 * BO 관리자 권한 정의 (중앙화)
 *
 * 기본 4개 권한 그룹 (런타임에 추가 가능):
 *  SUPER             : 슈퍼관리자
 *  ENTERPRISE_INFO   : 기업정보 담당자
 *  ENTERPRISE_INFO_2 : 기업정보 담당자2
 *  OTHER             : 기타
 */

export const ROLES = ['SUPER', 'ENTERPRISE_INFO', 'ENTERPRISE_INFO_2', 'OTHER'] as const;
export type Role = typeof ROLES[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER: '슈퍼관리자',
  ENTERPRISE_INFO: '기업정보 담당자',
  ENTERPRISE_INFO_2: '기업정보 담당자2',
  OTHER: '기타',
};

export const ROLE_TEXT_COLORS: Record<Role, string> = {
  SUPER: 'text-red-600',
  ENTERPRISE_INFO: 'text-blue-700',
  ENTERPRISE_INFO_2: 'text-emerald-700',
  OTHER: 'text-[#4E5968]',
};

export const OTP_LABELS: Record<'REGISTERED' | 'UNREGISTERED', string> = {
  REGISTERED: '등록',
  UNREGISTERED: '미등록',
};
