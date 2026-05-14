import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { POPUP_MAP } from './PopupPreviews';
import { ExternalLink, CheckCircle2, Layers } from 'lucide-react';

// ─── 데이터 ───────────────────────────────────────────────────────────────────
type Item = { no: number; id: string; label: string; route?: string; popupId?: string; };
type MenuGroup = { category: string; items: Item[] };

const menuGroups: MenuGroup[] = [
  { category: '유틸리티', items: [
    { no:1, id:'login',           label:'로그인' },
    { no:2, id:'otp',             label:'OTP 인증' },
    { no:3, id:'otp_register',    label:'OTP 등록 (Google OTP)' },
    { no:4, id:'reset_otp',       label:'비밀번호 변경 - OTP 인증' },
    { no:5, id:'reset_password',  label:'비밀번호 변경 - 새 비밀번호 설정' },
  ]},
  { category: '메인', items: [
    { no:6, id:'dashboard', label:'대시보드 (HOME)', route:'/dashboard/main' },
  ]},
  { category: '기업 관리', items: [
    { no:7,  id:'tenant_list',           label:'테넌트 관리',                               route:'/dashboard/enterprise/tenant_list' },
    { no:8,  id:'ent_list',              label:'기업 관리',                                 route:'/dashboard/enterprise/ent_list' },
    { no:9,  id:'ent_edit_modal',        label:'기업 정보 수정 팝업',                       popupId:'ent_edit_modal' },
    { no:10, id:'ent_register_step1',    label:'기업 등록 - 기본 정보 (Step 1)',            route:'/dashboard/enterprise/ent_register' },
    { no:11, id:'ent_register_step2',    label:'기업 등록 - VAN/펌뱅킹 ID 등록 (Step 2)',  route:'/dashboard/enterprise/ent_register' },
    { no:12, id:'ent_register_step3',    label:'기업 등록 - 인터페이스 설정 (Step 3)',      route:'/dashboard/enterprise/ent_register' },
    { no:13, id:'dirty_check_prev',      label:'이전 단계 이탈 확인 팝업',                  popupId:'dirty_check_prev' },
    { no:14, id:'dirty_check_skip',      label:'건너뛰기 이탈 확인 팝업',                   popupId:'dirty_check_skip' },
    { no:15, id:'tenant_check_status',   label:'테넌트 중복 확인 팝업',                     popupId:'tenant_check_status' },
    { no:16, id:'ent_users',             label:'기업별 사용자 목록',                        route:'/dashboard/enterprise/ent_users' },
    { no:17, id:'fund_status',           label:'자금 현황 조회',                            route:'/dashboard/enterprise/fund_status' },
    { no:18, id:'exception_management',  label:'타행계좌 예외 관리',                        route:'/dashboard/enterprise/exception_management' },
    { no:19, id:'exception_register_modal', label:'타행계좌 예외 등록 / 수정 팝업',         popupId:'exception_register_modal' },
  ]},
  { category: '관리자 관리', items: [
    { no:20, id:'admin_list',            label:'관리자 관리',             route:'/dashboard/admin' },
    { no:21, id:'admin_register_modal',  label:'관리자 등록 / 수정 팝업', popupId:'admin_register_modal' },
  ]},
  { category: '메뉴 관리', items: [
    { no:22, id:'menu_manage',     label:'메뉴 관리',      route:'/dashboard/menu_manage' },
    { no:23, id:'menu_edit_modal', label:'메뉴 수정 팝업', popupId:'menu_edit_modal' },
  ]},
  { category: '콘텐츠 관리', items: [
    { no:24, id:'notice',                 label:'공지사항 관리',                     route:'/dashboard/content/notice' },
    { no:25, id:'notice_modal',           label:'공지사항 등록 / 수정 팝업',         popupId:'notice_modal' },
    { no:26, id:'notice_cancel_warning',  label:'공지사항 작성 취소 확인 팝업',      popupId:'notice_cancel_warning' },
    { no:27, id:'notice_delete_warning',  label:'공지사항 삭제 확인 팝업',           popupId:'notice_delete_warning' },
    { no:28, id:'banner',                 label:'배너 관리',                         route:'/dashboard/content/banner' },
    { no:29, id:'banner_modal',           label:'배너 등록 / 수정 팝업',             popupId:'banner_modal' },
    { no:30, id:'banner_cancel_warning',  label:'배너 작성 취소 확인 팝업',          popupId:'banner_cancel_warning' },
    { no:31, id:'banner_delete_warning',  label:'배너 삭제 확인 팝업',               popupId:'banner_delete_warning' },
    { no:32, id:'faq',                    label:'FAQ 관리',                          route:'/dashboard/content/faq' },
    { no:33, id:'faq_modal',              label:'FAQ 등록 / 수정 팝업',              popupId:'faq_modal' },
    { no:34, id:'faq_cancel_warning',     label:'FAQ 작성 취소 확인 팝업',           popupId:'faq_cancel_warning' },
    { no:35, id:'faq_delete_warning',     label:'FAQ 삭제 확인 팝업',                popupId:'faq_delete_warning' },
    { no:36, id:'email_template',         label:'이메일 템플릿 관리',                route:'/dashboard/content/email_template' },
    { no:37, id:'email_modal',            label:'이메일 템플릿 등록 / 수정 팝업',    popupId:'email_modal' },
    { no:38, id:'email_cancel_warning',   label:'이메일 템플릿 작성 취소 확인 팝업', popupId:'email_cancel_warning' },
    { no:39, id:'push_mgmt',              label:'PUSH 알림 관리',                    route:'/dashboard/content/push_mgmt' },
    { no:40, id:'push_modal',             label:'PUSH 템플릿 등록 / 수정 팝업',      popupId:'push_modal' },
    { no:41, id:'push_delete_warning',    label:'PUSH 템플릿 삭제 확인 팝업',        popupId:'push_delete_warning' },
  ]},
  { category: '코드 관리', items: [
    { no:42, id:'code_manage',           label:'코드 관리',                  route:'/dashboard/code/code_manage' },
    { no:43, id:'code_modal',            label:'코드 등록 / 수정 팝업',      popupId:'code_modal' },
    { no:44, id:'code_unsaved_warning',  label:'코드 미저장 이탈 확인 팝업', popupId:'code_unsaved_warning' },
  ]},
  { category: '로그 관리', items: [
    { no:45, id:'work_history',       label:'작업 이력 (로그)',      route:'/dashboard/logs/work_history' },
    { no:46, id:'firmbanking_fail',   label:'펌뱅킹 실패 현황',      route:'/dashboard/logs/firmbanking_fail' },
    { no:47, id:'firmbanking_detail', label:'펌뱅킹 실패 상세 팝업', popupId:'firmbanking_detail' },
  ]},
  { category: '시스템 모니터링', items: [
    { no:48, id:'monitoring', label:'시스템 모니터링', route:'/dashboard/monitoring' },
  ]},
  { category: '통계', items: [
    { no:49, id:'statistics', label:'통계', route:'/dashboard/statistics' },
  ]},
];

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
export default function PublishingStatus() {
  const navigate = useNavigate();
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const close = () => setOpenPopupId(null);

  const allItems = menuGroups.flatMap(g => g.items);
  const screens  = allItems.filter(i => !i.popupId).length;
  const popups   = allItems.filter(i => !!i.popupId).length;

  return (
    <div className="bg-white rounded-xl border border-border-gray">

      {/* 팝업 */}
      {openPopupId && POPUP_MAP[openPopupId]?.(close)}

      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-gray">
        <div>
          <h2 className="text-title-sm font-bold text-text-main">퍼블리싱 현황</h2>
          <p className="text-body-sm text-text-sub mt-0.5">화면명 클릭 시 이동 · 팝업은 열기 버튼으로 미리보기</p>
        </div>
        <div className="flex items-center gap-5 text-body-sm text-text-body">
          <span>화면 <strong className="text-text-main ml-1">{screens}</strong></span>
          <span className="w-px h-3 bg-border-gray" />
          <span>팝업 <strong className="text-text-main ml-1">{popups}</strong></span>
          <span className="w-px h-3 bg-border-gray" />
          <span>전체 <strong className="text-text-main ml-1">{allItems.length}</strong></span>
        </div>
      </div>

      {/* 테이블 */}
      <table className="w-full text-body-sm border-collapse">
        <thead>
          <tr className="bg-bg-gray border-b border-border-gray">
            <th className="px-5 py-3 text-left text-caption font-semibold text-text-sub w-[52px]">No.</th>
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-sub w-[140px]">카테고리</th>
            <th className="px-4 py-3 text-left text-caption font-semibold text-text-sub">화면 / 팝업명</th>
            <th className="px-5 py-3 text-center text-caption font-semibold text-text-sub w-[80px]">상태</th>
          </tr>
        </thead>
        <tbody>
          {menuGroups.map(group =>
            group.items.map((item, idx) => {
              const isPopup = !!item.popupId;
              return (
                <tr
                  key={item.id}
                  className="border-b border-bg-muted hover:bg-bg-subtle transition-colors group"
                >
                  {/* No. */}
                  <td className="px-5 py-3.5 text-caption text-text-disabled font-mono">{item.no}</td>

                  {/* 카테고리 — 그룹 첫 행만 표시 */}
                  <td className="px-4 py-3.5">
                    {idx === 0 ? (
                      <span className="text-caption font-medium text-text-body">{group.category}</span>
                    ) : null}
                  </td>

                  {/* 화면·팝업명 */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {isPopup && (
                        <span className="inline-flex items-center gap-0.5 text-caption font-semibold text-text-sub bg-bg-muted rounded px-1.5 py-0.5 shrink-0">
                          <Layers className="w-2.5 h-2.5" />팝업
                        </span>
                      )}
                      {item.route ? (
                        <button
                          onClick={() => navigate(item.route!)}
                          className="flex items-center gap-1 text-body-sm text-text-info hover:underline underline-offset-2 text-left font-medium"
                        >
                          {item.label}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                        </button>
                      ) : (
                        <span className="text-body-sm text-text-main">{item.label}</span>
                      )}
                    </div>
                  </td>

                  {/* 상태 */}
                  <td className="px-5 py-3.5 text-center">
                    {isPopup ? (
                      <button
                        onClick={() => setOpenPopupId(item.popupId!)}
                        className="inline-flex items-center px-3 py-1.5 text-caption font-semibold rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        열기
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-caption font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />완료
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
