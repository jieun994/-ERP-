import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import AdminRegisterModal from './AdminRegisterModal';
import EnterpriseEditModal from './EnterpriseEditModal';

// ─── 공통 스타일 ────────────────────────────────────────────────────────────
export const INP = "w-full h-[36px] px-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all placeholder-[#8B95A1]";
export const SEL = "w-full h-[36px] px-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all";
export const TXA = "w-full px-4 py-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all resize-none placeholder-[#8B95A1]";
export const DIS = "w-full h-[36px] px-3 bg-[#F9FAFB] border border-[#E5E8EB] rounded-md text-[14px] text-[#8B95A1] outline-none cursor-not-allowed";

// ─── 공통 컴포넌트 ───────────────────────────────────────────────────────────
export function ModalWrap({ title, size = 'max-w-2xl', saveLabel = '등록하기', onClose, children }: {
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

export function Sec({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-[#008d75] rounded-full" />
      <h4 className="text-[14px] font-semibold text-[#191F28]">{label}</h4>
    </div>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[14px] font-semibold text-[#191F28]">{label}{required && <span className="text-[#F04452] ml-1">*</span>}</label>
      {children}
    </div>
  );
}

export function Radio({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name={name} defaultChecked={defaultChecked} className="w-4 h-4 accent-[#008d75]" />
      <span className="text-[14px] text-[#4E5968]">{label}</span>
    </label>
  );
}

// ─── 팝업 프리뷰 컴포넌트들 ──────────────────────────────────────────────────

export function ConfirmPopup({ title, message, confirmLabel = '확인', cancelLabel = '취소', onClose }: {
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

export function TenantCheckPopup({ onClose }: { onClose: () => void }) {
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

export function ExceptionRegisterPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="타행계좌 예외 등록" size="max-w-lg" saveLabel="등록하기" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <Sec label="기본 정보" />
          <div className="space-y-4 pl-3">
            <Field label="테넌트" required><select className={SEL}><option value="">테넌트 선택</option><option value="toss">(주)토스페이먼츠</option><option value="woowa">우아한형제들</option></select></Field>
            <Field label="기업명" required><select className={SEL}><option value="">기업 선택</option><option value="toss">(주)토스페이먼츠</option><option value="woowa">우아한형제들</option></select></Field>
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="계좌 정보" />
          <div className="space-y-4 pl-3">
            <div className="grid grid-cols-2 gap-4">
              <Field label="대상 은행" required><select className={SEL}><option>국민은행</option><option>신한은행</option><option>우리은행</option></select></Field>
              <Field label="대상 계좌번호" required><input type="text" className={INP} placeholder="계좌번호 (숫자만)" /></Field>
            </div>
            <Field label="예외 사유"><input type="text" className={INP} placeholder="예외 등록 사유 입력" /></Field>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

export function MenuEditPreview({ onClose }: { onClose: () => void }) {
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

export function NoticeModalPreview({ onClose }: { onClose: () => void }) {
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

export function BannerModalPreview({ onClose }: { onClose: () => void }) {
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
                <div className="border-2 border-dashed border-[#D1D6DB] rounded-lg h-32 flex items-center justify-center text-[13px] text-[#8B95A1] cursor-pointer hover:border-[#008d75] transition-colors">이미지 업로드</div>
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

export function FaqModalPreview({ onClose }: { onClose: () => void }) {
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
            <Field label="노출 여부"><div className="flex gap-6 pt-1"><Radio name="faqVis" label="노출" defaultChecked /><Radio name="faqVis" label="미노출" /></div></Field>
            <Field label="노출 순서"><input type="number" min={1} defaultValue={1} className={INP} /></Field>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

export function EmailTemplateModalPreview({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrap title="이메일 템플릿 등록" size="max-w-3xl" saveLabel="저장하기" onClose={onClose}>
      <div className="space-y-8">
        <div>
          <Sec label="기본 정보" />
          <div className="pl-3 space-y-4">
            <Field label="템플릿명" required><input type="text" className={INP} placeholder="템플릿 목록에서 구분할 이름" /></Field>
            <div className="grid grid-cols-2 gap-6">
              <Field label="템플릿 코드" required><input type="text" className={INP + " font-mono tracking-tight"} placeholder="영문 대문자, 숫자, 언더바(_)" /></Field>
              <Field label="발송 유형" required>
                <select className={SEL}>
                  <option value="">유형 선택</option>
                  <option>회원가입 인증</option>
                  <option>비밀번호 재설정</option>
                  <option>OTP 등록 안내</option>
                  <option>거래 완료 알림</option>
                </select>
              </Field>
            </div>
            <Field label="사용 여부"><div className="flex items-center gap-6 pt-1"><Radio name="emailActive" label="사용" defaultChecked /><Radio name="emailActive" label="미사용" /></div></Field>
          </div>
        </div>
        <div className="border-t border-[#E5E8EB] pt-6">
          <Sec label="이메일 내용" />
          <div className="pl-3 space-y-4">
            <Field label="이메일 제목" required><input type="text" className={INP} placeholder="수신자에게 표시될 메일 제목을 입력하세요" /></Field>
            <Field label="이메일 본문" required><textarea className={TXA + " resize-y"} rows={8} placeholder="메일 본문을 입력하세요. 줄바꿈은 메일에서도 동일하게 적용됩니다." /></Field>
          </div>
        </div>
      </div>
    </ModalWrap>
  );
}

export function PushModalPreview({ onClose }: { onClose: () => void }) {
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

export function CodeModalPreview({ onClose }: { onClose: () => void }) {
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

export function FirmBankingDetailPreview({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="h-[64px] px-6 bg-[#191F28] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-[18px] font-bold text-white">펌뱅킹 실패 상세 내역</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4"><div className="w-1.5 h-4 bg-[#008d75] rounded-full" /><h4 className="text-[16px] font-bold text-[#191F28]">거래 기본 정보</h4></div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
              {[['발생일시','2024-03-15 14:32:01'],['기업명 (코드)','(주)토스페이먼츠 (ENT0001)'],['서비스명','자금이체 서비스'],['실패 단계','수취인 조회'],['거래번호','TRX20240315143201'],['요청번호','REQ20240315143200']].map(([k,v]) => (
                <div key={k}><p className="text-[12px] text-[#8B95A1] mb-1">{k}</p><p className="text-[14px] font-medium text-[#191F28]">{v}</p></div>
              ))}
            </div>
          </section>
          <section className="bg-red-50/50 p-6 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-4"><div className="w-1.5 h-4 bg-red-500 rounded-full" /><h4 className="text-[16px] font-bold text-red-700">오류 상세 정보</h4></div>
            <div className="space-y-4">
              <div><p className="text-[12px] text-gray-500 mb-1">오류코드</p><p className="text-[14px] text-red-600 font-bold font-mono">ERR_RECEIVER_NAME_MISMATCH</p></div>
              <div><p className="text-[12px] text-gray-500 mb-1">오류 메시지</p><p className="text-[14px] text-red-600 font-medium bg-white p-3 border border-red-100 rounded">수취인 성명이 일치하지 않습니다. 계좌 정보를 확인해 주세요.</p></div>
            </div>
          </section>
        </div>
        <div className="h-[72px] px-6 bg-white border-t border-[#E5E8EB] flex items-center justify-end">
          <button onClick={onClose} className="px-6 h-[40px] border border-[#D1D6DB] rounded-lg text-[14px] font-medium text-[#4E5968] bg-white hover:bg-[#F2F4F6] transition-colors">닫기</button>
        </div>
      </div>
    </div>
  );
}

// ─── 팝업 맵 (두 파일 공유) ──────────────────────────────────────────────────
export const POPUP_MAP: Record<string, (onClose: () => void) => React.ReactNode> = {
  ent_edit_modal:           (c) => <EnterpriseEditModal isOpen onClose={c} enterpriseId={1} />,
  admin_register_modal:     (c) => <AdminRegisterModal isOpen onClose={c} onSave={c} adminToEdit={null} />,
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
  email_modal:              (c) => <EmailTemplateModalPreview onClose={c} />,
  email_cancel_warning:     (c) => <ConfirmPopup title="작성을 취소하시겠습니까?" message="입력한 내용이 저장되지 않습니다. 취소하시겠습니까?" confirmLabel="취소하기" cancelLabel="계속 작성" onClose={c} />,
  push_modal:               (c) => <PushModalPreview onClose={c} />,
  push_delete_warning:      (c) => <ConfirmPopup title="PUSH 템플릿을 삭제하시겠습니까?" message="삭제한 템플릿은 복구할 수 없습니다. 삭제하시겠습니까?" confirmLabel="삭제" cancelLabel="취소" onClose={c} />,
  code_modal:               (c) => <CodeModalPreview onClose={c} />,
  code_unsaved_warning:     (c) => <ConfirmPopup title="저장하지 않고 이동하시겠습니까?" message="수정한 내용이 저장되지 않습니다. 이동하시겠습니까?" confirmLabel="이동" cancelLabel="계속 편집" onClose={c} />,
  firmbanking_detail:       (c) => <FirmBankingDetailPreview onClose={c} />,
};
