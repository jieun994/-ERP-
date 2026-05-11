import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import AdminRegisterModal from './AdminRegisterModal';
import EnterpriseEditModal from './EnterpriseEditModal';

type ItemType = 'screen' | 'popup';
type Status = '완료' | '진행중' | '대기';
type UnifiedItem = { no: number; type: ItemType; id: string; label: string; status: Status; route?: string; };
type MenuGroup = { category: string; items: UnifiedItem[] };

const menuGroups: MenuGroup[] = [
  { category: '유틸리티 (게이트 화면)', items: [
    { no:1,  type:'screen', id:'login',          label:'로그인',                           status:'완료' },
    { no:2,  type:'screen', id:'otp_verify',     label:'OTP 인증',                         status:'완료' },
    { no:3,  type:'screen', id:'otp_register',   label:'OTP 등록 (Google OTP)',            status:'완료' },
    { no:4,  type:'screen', id:'reset_email',    label:'비밀번호 변경 - 이메일 인증',      status:'완료' },
    { no:5,  type:'screen', id:'reset_password', label:'비밀번호 변경 - 새 비밀번호 설정', status:'완료' },
  ]},
  { category: '메인', items: [
    { no:6,  type:'screen', id:'dashboard', label:'대시보드 (HOME)', status:'완료', route:'/dashboard/main' },
  ]},
  { category: '기업 관리', items: [
    { no:7,  type:'screen', id:'tenant_list',             label:'테넌트 조회',                              status:'완료', route:'/dashboard/enterprise/tenant_list' },
    { no:8,  type:'screen', id:'ent_list',                label:'기업 조회',                                status:'완료', route:'/dashboard/enterprise/ent_list' },
    { no:9,  type:'popup',  id:'ent_edit_modal',          label:'기업 정보 수정 팝업',                      status:'완료' },
    { no:10, type:'screen', id:'ent_register_step1',      label:'기업 등록 - 기본 정보 (Step 1)',           status:'완료', route:'/dashboard/enterprise/ent_register' },
    { no:11, type:'screen', id:'ent_register_step2',      label:'기업 등록 - VAN/펌뱅킹 ID 등록 (Step 2)', status:'완료', route:'/dashboard/enterprise/ent_register' },
    { no:12, type:'screen', id:'ent_register_step3',      label:'기업 등록 - 인터페이스 설정 (Step 3)',     status:'완료', route:'/dashboard/enterprise/ent_register' },
    { no:13, type:'popup',  id:'dirty_check_prev',        label:'이전 단계 이탈 확인 팝업',                 status:'완료' },
    { no:14, type:'popup',  id:'dirty_check_skip',        label:'건너뛰기 이탈 확인 팝업',                  status:'완료' },
    { no:15, type:'popup',  id:'tenant_check_status',     label:'테넌트 중복 확인 메시지/오류',             status:'완료' },
    { no:16, type:'screen', id:'ent_users',               label:'기업별 사용자 목록',                       status:'완료', route:'/dashboard/enterprise/ent_users' },
    { no:17, type:'screen', id:'fund_status',             label:'자금 현황 조회',                           status:'완료', route:'/dashboard/enterprise/fund_status' },
    { no:18, type:'screen', id:'exception_management',    label:'타행계좌 예외 관리',                       status:'완료', route:'/dashboard/enterprise/exception_management' },
    { no:19, type:'popup',  id:'exception_register_modal',label:'타행계좌 예외 등록 / 수정 팝업',           status:'완료' },
  ]},
  { category: '관리자 관리', items: [
    { no:20, type:'screen', id:'admin_list',           label:'관리자 관리',             status:'완료', route:'/dashboard/admin' },
    { no:21, type:'popup',  id:'admin_register_modal', label:'관리자 등록 / 수정 팝업', status:'완료' },
  ]},
  { category: '메뉴 관리', items: [
    { no:22, type:'screen', id:'menu_manage',    label:'메뉴 관리',     status:'완료', route:'/dashboard/menu_manage' },
    { no:23, type:'popup',  id:'menu_edit_modal',label:'메뉴 수정 팝업',status:'완료' },
  ]},
  { category: '콘텐츠 관리', items: [
    { no:24, type:'screen', id:'notice',                label:'공지사항 관리',                    status:'완료', route:'/dashboard/content/notice' },
    { no:25, type:'popup',  id:'notice_modal',          label:'공지사항 등록 / 수정 팝업',        status:'완료' },
    { no:26, type:'popup',  id:'notice_cancel_warning', label:'공지사항 작성 취소 확인 팝업',     status:'완료' },
    { no:27, type:'popup',  id:'notice_delete_warning', label:'공지사항 삭제 확인 팝업',          status:'완료' },
    { no:28, type:'screen', id:'banner',                label:'배너 관리',                        status:'완료', route:'/dashboard/content/banner' },
    { no:29, type:'popup',  id:'banner_modal',          label:'배너 등록 / 수정 팝업',            status:'완료' },
    { no:30, type:'popup',  id:'banner_cancel_warning', label:'배너 작성 취소 확인 팝업',         status:'완료' },
    { no:31, type:'popup',  id:'banner_delete_warning', label:'배너 삭제 확인 팝업',              status:'완료' },
    { no:32, type:'screen', id:'faq',                   label:'FAQ 관리',                         status:'완료', route:'/dashboard/content/faq' },
    { no:33, type:'popup',  id:'faq_modal',             label:'FAQ 등록 / 수정 팝업',             status:'완료' },
    { no:34, type:'popup',  id:'faq_cancel_warning',    label:'FAQ 작성 취소 확인 팝업',          status:'완료' },
    { no:35, type:'popup',  id:'faq_delete_warning',    label:'FAQ 삭제 확인 팝업',               status:'완료' },
    { no:36, type:'screen', id:'email_template',        label:'이메일 템플릿 관리',               status:'완료', route:'/dashboard/content/email_template' },
    { no:37, type:'popup',  id:'email_cancel_warning',  label:'이메일 템플릿 작성 취소 확인 팝업',status:'완료' },
    { no:38, type:'screen', id:'push_mgmt',             label:'PUSH 알림 관리',                   status:'완료', route:'/dashboard/content/push_mgmt' },
    { no:39, type:'popup',  id:'push_modal',            label:'PUSH 템플릿 등록 / 수정 팝업',     status:'완료' },
    { no:40, type:'popup',  id:'push_delete_warning',   label:'PUSH 템플릿 삭제 확인 팝업',       status:'완료' },
  ]},
  { category: '코드 관리', items: [
    { no:41, type:'screen', id:'code_manage',            label:'코드 관리',                    status:'완료', route:'/dashboard/code/code_manage' },
    { no:42, type:'popup',  id:'code_modal',             label:'코드 등록 / 수정 팝업',        status:'완료' },
    { no:43, type:'popup',  id:'code_unsaved_warning',   label:'코드 미저장 이탈 확인 팝업',   status:'완료' },
    { no:44, type:'screen', id:'message_manage',         label:'메시지 관리',                  status:'완료', route:'/dashboard/code/message_manage' },
    { no:45, type:'popup',  id:'message_modal',          label:'메시지 등록 / 수정 패널',      status:'완료' },
    { no:46, type:'popup',  id:'message_unsaved_warning',label:'메시지 미저장 이탈 확인 팝업', status:'완료' },
  ]},
  { category: '로그 관리', items: [
    { no:47, type:'screen', id:'work_history',     label:'작업 이력 (로그)', status:'완료', route:'/dashboard/logs/work_history' },
    { no:48, type:'screen', id:'firmbanking_fail', label:'펌뱅킹 실패 현황', status:'완료', route:'/dashboard/logs/firmbanking_fail' },
  ]},
  { category: '시스템 모니터링', items: [
    { no:49, type:'screen', id:'monitoring', label:'시스템 모니터링', status:'완료', route:'/dashboard/monitoring' },
  ]},
  { category: '통계', items: [
    { no:50, type:'screen', id:'statistics', label:'통계', status:'완료', route:'/dashboard/statistics' },
  ]},
];

const STATUS_STYLE: Record<string, string> = {
  '완료':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '진행중': 'bg-blue-50 text-blue-700 border border-blue-200',
  '대기':   'bg-gray-100 text-gray-500 border border-gray-200',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[status] ?? STATUS_STYLE['대기']}`}>{status}</span>;
}

function ModalWrap({ title, size = 'max-w-2xl', saveLabel = '등록하기', onClose, children }: {
  title: string; size?: string; saveLabel?: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${size} flex flex-col max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between px-6 h-[56px] border-b border-[#E5E8EB] shrink-0">
          <p className="text-[16px] font-semibold text-[#191F28]">{title}</p>
          <button onClick={onClose} className="p-2 text-[#8B95A1] hover:text-[#191F28] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">{children}</div>
        <div className="flex items-center justify-center h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] gap-3 shrink-0">
          <button onClick={onClose} className="w-[120px] h-[40px] border border-[#D1D6DB] rounded-lg text-[14px] font-medium text-[#4E5968] bg-white hover:bg-[#F2F4F6] transition-colors">취소</button>
          <button onClick={onClose} className="w-[120px] h-[40px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-semibold transition-colors shadow-sm">{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Sec({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-[#008d75] rounded-full" />
      <h4 className="text-[14px] font-semibold text-[#191F28]">{label}</h4>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[14px] font-semibold text-[#191F28]">{label}{required && <span className="text-[#F04452] ml-1">*</span>}</label>
      {children}
    </div>
  );
}

const INP = "w-full h-[36px] px-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]";
const SEL = "w-full h-[36px] px-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all";
const TXA = "w-full px-4 py-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all resize-none placeholder-[#8B95A1]";
const DIS = "w-full h-[36px] px-3 bg-[#F9FAFB] border border-[#E5E8EB] rounded-md text-[14px] text-[#8B95A1] outline-none cursor-not-allowed";

function Radio({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name={name} defaultChecked={defaultChecked} className="w-4 h-4 accent-[#008d75]" />
      <span className="text-[14px] text-[#4E5968]">{label}</span>
    </label>
  );
}

function ConfirmPopup({ title, message, confirmLabel = '확인', cancelLabel = '취소', onClose }: {
  title: string; message: string; confirmLabel?: string; cancelLabel?: string; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <p className="text-[15px] font-bold text-[#191F28]">{title}</p>
        <p className="text-[13px] text-[#4E5968] leading-relaxed -mt-2">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-[44px] border border-[#D1D6DB] rounded-lg text-[14px] font-medium text-[#4E5968] hover:bg-[#F2F4F6] transition-colors">{cancelLabel}</button>
          <button onClick={onClose} className="flex-1 h-[44px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-semibold transition-colors">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function TenantCheckPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-[#191F28]">테넌트 중복 확인</p>
          <button onClick={onClose} className="text-[#8B95A1] hover:text-[#191F28]"><X className="w-5 h-5" /></button>
        </div>
        <div className="rounded-lg border border-[#008d75] bg-[#008d7510] px-4 py-3 flex items-center gap-3">
          <span className="text-[#008d75] font-bold text-lg">&#10003;</span>
          <div>
            <p className="text-[13px] font-bold text-[#008d75]">사용 가능한 테넌트 ID입니다.</p>
            <p className="text-[12px] text-[#008d75]/70 mt-0.5">입력하신 테넌트 ID를 사용할 수 있습니다.</p>
          </div>
        </div>
        <div className="rounded-lg border border-[#F04452] bg-[#F0445210] px-4 py-3 flex items-center gap-3">
          <span className="text-[#F04452] font-bold text-lg">&#10007;</span>
          <div>
            <p className="text-[13px] font-bold text-[#F04452]">이미 사용 중인 테넌트 ID입니다.</p>
            <p className="text-[12px] text-[#F04452]/70 mt-0.5">다른 테넌트 ID를 입력해 주세요.</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full h-[44px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-lg text-[14px] font-semibold transition-colors">확인</button>
      </div>
    </div>
  );
}

function ExceptionRegisterPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="타행계좌 예외 등록" size="max-w-lg" saveLabel="등록하기" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <Sec label="기본 정보" />
          <div className="space-y-4 pl-3">
            <Field label="테넌트" required><select className={SEL}><option>(주)토스페이먼츠</option><option>우아한형제들</option></select></Field>
            <Field label="기업명" required><select className={SEL}><option value="">기업 선택</option><option>(주)토스페이먼츠</option><option>우아한형제들</option><option>당근마켓</option></select></Field>
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="계좌 정보" />
          <div className="space-y-4 pl-3">
            <div className="grid grid-cols-2 gap-4">
              <Field label="대상 은행" required><select className={SEL}><option>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option></select></Field>
              <Field label="대상 계좌번호" required><input type="text" className={INP} placeholder="계좌번호 (숫자만)" /></Field>
            </div>
            <Field label="예외 사유"><input type="text" className={INP} placeholder="예외 등록 사유 입력" /></Field>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

function MenuEditPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="메뉴 수정" size="max-w-lg" saveLabel="저장하기" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <Sec label="메뉴 정보" />
          <div className="pl-3"><Field label="메뉴명" required><input type="text" className={INP} defaultValue="기업 관리" /></Field></div>
        </div>
        <div>
          <Sec label="사용 여부" />
          <div className="flex gap-8 pl-3">
            <Radio name="menuUse" label="사용 (ON)" defaultChecked />
            <Radio name="menuUse" label="미사용 (OFF)" />
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

function NoticeModalPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="공지사항 등록" size="max-w-4xl" saveLabel="등록하기" onClose={onClose}>
      <div className="space-y-8">
        <div>
          <Sec label="기본 정보" />
          <div className="space-y-4">
            <Field label="제목" required><input type="text" className={INP} placeholder="공지사항 제목을 입력하세요." /></Field>
            <Field label="내용" required><textarea className={TXA} rows={6} placeholder="공지사항 내용을 입력하세요." /></Field>
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="게시 설정" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="공지 유형" required><select className={SEL}><option>일반</option><option>긴급</option></select></Field>
              <Field label="노출 대상" required><select className={SEL}><option>전체</option><option>관리자</option><option>기업 사용자</option></select></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="노출 시작일" required><input type="date" className={INP} /></Field>
              <Field label="노출 종료일" required><input type="date" className={INP} /></Field>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input type="checkbox" className="w-4 h-4 accent-[#008d75]" />
              <span className="text-[14px] text-[#4E5968]">상단 고정</span>
            </label>
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="첨부파일" />
          <div className="border-2 border-dashed border-[#D1D6DB] rounded-lg p-8 text-center text-[13px] text-[#8B95A1]">파일을 드래그하거나 클릭하여 업로드하세요. (최대 10MB)</div>
        </div>
      </div>
    </ModalWrap>
  );
}

function BannerModalPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="배너 등록" size="max-w-4xl" saveLabel="등록하기" onClose={onClose}>
      <div className="space-y-8">
        <div>
          <Sec label="기본 정보" />
          <Field label="배너명" required><input type="text" className={INP} placeholder="배너명을 입력하세요 (내부 관리용)" /></Field>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="이미지" />
          <div className="grid grid-cols-2 gap-6">
            {['PC 배너 이미지', '모바일 배너 이미지'].map(lbl => (
              <div key={lbl}>
                <p className="text-[14px] font-semibold text-[#191F28] mb-2">{lbl} <span className="text-[#F04452]">*</span></p>
                <div className="border-2 border-dashed border-[#D1D6DB] rounded-lg h-32 flex flex-col items-center justify-center gap-1 text-[13px] text-[#8B95A1] cursor-pointer hover:border-[#008d75] transition-colors">이미지 업로드</div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="게시 설정" />
          <div className="space-y-4">
            <div className="p-4 border border-[#E5E8EB] rounded-lg bg-[#F9FAFB]">
              <p className="text-[14px] font-semibold text-[#191F28] mb-3">게시 대상 <span className="text-[#F04452]">*</span></p>
              <div className="flex gap-6">{['전체','더존','가비아'].map(v => (<label key={v} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-[#008d75]" /><span className="text-[14px] text-[#4E5968]">{v}</span></label>))}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[#E5E8EB] rounded-lg bg-[#F9FAFB]">
                <p className="text-[14px] font-semibold text-[#191F28] mb-2">노출 여부 <span className="text-[#F04452]">*</span></p>
                <div className="flex gap-6"><Radio name="bannerVis" label="노출" defaultChecked /><Radio name="bannerVis" label="미노출" /></div>
              </div>
              <Field label="노출 순서" required><input type="number" min={1} defaultValue={1} className={INP} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="노출 시작일" required><input type="date" className={INP} /></Field>
              <Field label="노출 종료일" required><input type="date" className={INP} /></Field>
            </div>
            <Field label="링크 URL"><input type="text" className={INP} placeholder="https://" /></Field>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

function FaqModalPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="FAQ 등록" size="max-w-3xl" saveLabel="등록하기" onClose={onClose}>
      <div className="space-y-8">
        <div>
          <Sec label="기본 정보" />
          <div className="space-y-4">
            <Field label="카테고리" required><select className={SEL}><option>이용 안내</option><option>계정/보안</option><option>결제/정산</option><option>오류/장애</option></select></Field>
            <Field label="질문" required><input type="text" className={INP} placeholder="자주 묻는 질문을 입력하세요." /></Field>
            <Field label="답변" required><textarea className={TXA} rows={8} placeholder="상세 답변 내용을 입력하세요." /></Field>
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="게시 설정" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="노출 여부">
              <div className="flex gap-6 pt-1"><Radio name="faqVis" label="노출" defaultChecked /><Radio name="faqVis" label="미노출" /></div>
            </Field>
            <Field label="노출 순서"><input type="number" min={1} defaultValue={1} className={INP} /></Field>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

function PushModalPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="PUSH 템플릿 등록" size="max-w-2xl" saveLabel="등록하기" onClose={onClose}>
      <Sec label="템플릿 정보" />
      <div className="space-y-4 pl-3">
        <div className="grid grid-cols-2 gap-4">
          <Field label="템플릿 코드"><input type="text" className={INP} placeholder="템플릿 코드" /></Field>
          <Field label="발송 유형" required><select className={SEL}><option>승인</option><option>반려</option><option>결재대기</option></select></Field>
        </div>
        <Field label="템플릿명" required><input type="text" className={INP} placeholder="예: 승인 완료 알림" /></Field>
        <Field label="사용 여부"><div className="flex gap-6 pt-1"><Radio name="pushUse" label="사용" defaultChecked /><Radio name="pushUse" label="미사용" /></div></Field>
        <Field label="메시지 내용" required>
          <textarea className={TXA} rows={4} maxLength={100} placeholder="수신자에게 노출될 알림 내용을 입력하세요." />
          <p className="text-[12px] text-[#8B95A1] text-right mt-1">0 / 100자</p>
        </Field>
      </div>
    </ModalWrap>
  );
}

function CodeModalPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="신규 상세 코드 등록" size="max-w-md" saveLabel="등록하기" onClose={onClose}>
      <Sec label="상세 코드 정보" />
      <div className="space-y-4 pl-3">
        <Field label="코드 그룹" required><input type="text" disabled className={DIS + " font-mono"} defaultValue="USE_STATUS" /></Field>
        <Field label="코드값" required><input type="text" className={INP + " font-mono"} placeholder="예: ACTIVE" /></Field>
        <Field label="코드명" required><input type="text" className={INP} placeholder="예: 정상" /></Field>
        <Field label="설명"><textarea className={TXA} rows={3} placeholder="코드에 대한 설명을 입력하세요." /></Field>
        <div className="flex items-center gap-2 pt-2 border-t border-[#E5E8EB]">
          <input type="checkbox" id="codeUsed" defaultChecked className="w-4 h-4 accent-[#008d75] cursor-pointer" />
          <label htmlFor="codeUsed" className="text-[14px] text-[#4E5968] font-medium cursor-pointer">이 코드 사용</label>
        </div>
      </div>
    </ModalWrap>
  );
}

function MessageModalPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="메시지 등록" size="max-w-[600px]" saveLabel="등록하기" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <Sec label="기본 설정" />
          <div className="space-y-4 pl-3">
            <div className="grid grid-cols-2 gap-4">
              <Field label="메시지 그룹" required><input type="text" disabled className={DIS + " font-mono"} defaultValue="AUTH" /></Field>
              <Field label="메시지 코드" required><input type="text" className={INP + " font-mono"} placeholder="예: ERR_LOGIN_001" /></Field>
            </div>
            <Field label="사용 여부"><div className="flex gap-6 pt-1"><Radio name="msgUse" label="사용" defaultChecked /><Radio name="msgUse" label="미사용" /></div></Field>
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="언어별 메시지 텍스트" />
          <div className="space-y-4 pl-3">
            <Field label="한국어 (KO)" required><textarea className={TXA} rows={2} placeholder="한국어 메시지를 입력하세요." /></Field>
            <Field label="English (EN)" required><textarea className={TXA} rows={2} placeholder="Enter English message." /></Field>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

const INLINE_POPUP_MAP: Record<string, (onClose: () => void) => React.ReactNode> = {
  dirty_check_prev:         (c) => <ConfirmPopup title="이전 단계로 이동하시겠습니까?" message="입력한 내용이 저장되지 않습니다. 이전 단계로 이동하시겠습니까?" confirmLabel="이전 단계로" cancelLabel="취소" onClose={c} />,
  dirty_check_skip:         (c) => <ConfirmPopup title="이 단계를 건너뛰시겠습니까?" message="입력한 내용이 저장되지 않습니다. 건너뛰고 다음 단계로 이동하시겠습니까?" confirmLabel="건너뛰기" cancelLabel="취소" onClose={c} />,
  tenant_check_status:      (c) => <TenantCheckPopup onClose={c} />,
  exception_register_modal: (c) => <ExceptionRegisterPreview onClose={c} />,
  menu_edit_modal:          (c) => <MenuEditPreview onClose={c} />,
  notice_modal:             (c) => <NoticeModalPreview onClose={c} />,
  notice_cancel_warning:    (c) => <ConfirmPopup title="작성을 취소하시겠습니까?" message="입력한 내용이 저장되지 않습니다. 취소하시겠습니까?" confirmLabel="취소하기" cancelLabel="계속 작성" onClose={c} />,
  notice_delete_warning:    (c) => <ConfirmPopup title="공지사항을 삭제하시겠습니까?" message="삭제한 공지사항은 복구할 수 없습니다. 삭제하시겠습니까?" confirmLabel="삭제" cancelLabel="취소" onClose={c} />,
  banner_modal:             (c) => <BannerModalPreview onClose={c} />,
  banner_cancel_warning:    (c) => <ConfirmPopup title="작성을 취소하시겠습니까?" message="입력한 내용이 저장되지 않습니다. 취소하시겠습니까?" confirmLabel="취소하기" cancelLabel="계속 작성" onClose={c} />,
  banner_delete_warning:    (c) => <ConfirmPopup title="배너를 삭제하시겠습니까?" message="삭제한 배너는 복구할 수 없습니다. 삭제하시겠습니까?" confirmLabel="삭제" cancelLabel="취소" onClose={c} />,
  faq_modal:                (c) => <FaqModalPreview onClose={c} />,
  faq_cancel_warning:       (c) => <ConfirmPopup title="작성을 취소하시겠습니까?" message="입력한 내용이 저장되지 않습니다. 취소하시겠습니까?" confirmLabel="취소하기" cancelLabel="계속 작성" onClose={c} />,
  faq_delete_warning:       (c) => <ConfirmPopup title="FAQ를 삭제하시겠습니까?" message="삭제한 FAQ는 복구할 수 없습니다. 삭제하시겠습니까?" confirmLabel="삭제" cancelLabel="취소" onClose={c} />,
  email_cancel_warning:     (c) => <ConfirmPopup title="작성을 취소하시겠습니까?" message="입력한 내용이 저장되지 않습니다. 취소하시겠습니까?" confirmLabel="취소하기" cancelLabel="계속 작성" onClose={c} />,
  push_modal:               (c) => <PushModalPreview onClose={c} />,
  push_delete_warning:      (c) => <ConfirmPopup title="PUSH 템플릿을 삭제하시겠습니까?" message="삭제한 템플릿은 복구할 수 없습니다. 삭제하시겠습니까?" confirmLabel="삭제" cancelLabel="취소" onClose={c} />,
  code_modal:               (c) => <CodeModalPreview onClose={c} />,
  code_unsaved_warning:     (c) => <ConfirmPopup title="저장하지 않고 이동하시겠습니까?" message="수정한 내용이 저장되지 않습니다. 이동하시겠습니까?" confirmLabel="이동" cancelLabel="계속 편집" onClose={c} />,
  message_modal:            (c) => <MessageModalPreview onClose={c} />,
  message_unsaved_warning:  (c) => <ConfirmPopup title="저장하지 않고 닫으시겠습니까?" message="수정한 내용이 저장되지 않습니다. 닫으시겠습니까?" confirmLabel="닫기" cancelLabel="계속 편집" onClose={c} />,
};

export default function PublishingStatus() {
  const navigate = useNavigate();
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const closePopup = () => setOpenPopupId(null);

  const allItems = menuGroups.flatMap(g => g.items);
  const totalScreens = allItems.filter(i => i.type === 'screen').length;
  const doneScreens  = allItems.filter(i => i.type === 'screen' && i.status === '완료').length;
  const totalPopups  = allItems.filter(i => i.type === 'popup').length;
  const donePopups   = allItems.filter(i => i.type === 'popup' && i.status === '완료').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
      {openPopupId && INLINE_POPUP_MAP[openPopupId]?.(closePopup)}
      {openPopupId === 'ent_edit_modal' && (
        <EnterpriseEditModal isOpen onClose={closePopup} enterpriseId={1} />
      )}
      {openPopupId === 'admin_register_modal' && (
        <AdminRegisterModal isOpen onClose={closePopup} onSave={closePopup} adminToEdit={null} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[20px] font-bold text-[#191F28]">퍼블리싱 현황 목록</h2>
          <p className="text-[13px] text-[#8B95A1] mt-1">화면명 클릭 시 이동 · 팝업명 옆 열기 버튼 클릭 시 즉시 미리보기</p>
        </div>
        <div className="flex gap-6 text-[13px]">
          <div className="text-center">
            <p className="text-[#8B95A1] mb-0.5">화면</p>
            <p className="font-bold text-[16px] text-[#191F28]"><span className="text-emerald-600">{doneScreens}</span><span className="text-[#D1D6DB] mx-1">/</span>{totalScreens}</p>
          </div>
          <div className="w-px bg-[#E5E8EB]" />
          <div className="text-center">
            <p className="text-[#8B95A1] mb-0.5">팝업</p>
            <p className="font-bold text-[16px] text-[#191F28]"><span className="text-emerald-600">{donePopups}</span><span className="text-[#D1D6DB] mx-1">/</span>{totalPopups}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E5E8EB]">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E8EB]">
              <th className="px-4 py-3 text-left font-semibold text-[#4E5968] w-[48px]">No.</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4E5968] w-[60px]">구분</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4E5968]">화면 / 팝업명</th>
              <th className="px-4 py-3 text-center font-semibold text-[#4E5968] w-[72px]">상태</th>
              <th className="px-4 py-3 text-center font-semibold text-[#4E5968] w-[72px]">열기</th>
            </tr>
          </thead>
          <tbody>
            {menuGroups.map(group => (
              <React.Fragment key={group.category}>
                <tr className="bg-[#F2F4F6]">
                  <td colSpan={5} className="px-4 py-2 text-[12px] font-bold text-[#4E5968] tracking-wide uppercase">{group.category}</td>
                </tr>
                {group.items.map(item => {
                  const isScreen = item.type === 'screen';
                  const hasRoute = isScreen && !!item.route;
                  return (
                    <tr key={item.id} className="border-t border-[#F2F4F6] hover:bg-[#FAFBFC] transition-colors">
                      <td className="px-4 py-3 text-[#8B95A1] text-center">{item.no}</td>
                      <td className="px-4 py-3">
                        {isScreen
                          ? <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#008d7515] text-[#008d75] border border-[#008d7530]">화면</span>
                          : <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">팝업</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {hasRoute
                          ? <button onClick={() => navigate(item.route!)} className="text-[#0070F3] font-medium hover:underline text-left">{item.label}</button>
                          : <span className="font-medium text-[#191F28]">
                              {item.label}
                              {isScreen && !item.route && <span className="ml-2 text-[11px] text-[#8B95A1] font-normal">(게이트 화면)</span>}
                            </span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-center">
                        {!isScreen
                          ? <button onClick={() => setOpenPopupId(item.id)} className="inline-flex items-center px-3 py-1 text-[11px] font-semibold rounded text-[#008d75] bg-[#008d7510] hover:bg-[#008d7520] transition-colors">열기</button>
                          : <span className="text-[11px] text-[#C5CBD2]">&#8212;</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
