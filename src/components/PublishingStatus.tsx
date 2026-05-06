import React from 'react';

const publishingPages = [
  { id: 'tenant_list', label: '테넌트 조회', status: '완료' },
  { id: 'ent_list', label: '기업 조회', status: '완료' },
  { id: 'ent_register_step1', label: '기업 등록 - 기본 정보', status: '완료' },
  { id: 'ent_register_step2', label: '기업 등록 - VAN/펌뱅킹 ID 등록', status: '진행중' },
  { id: 'ent_register_step3', label: '기업 등록 - 인터페이스 설정', status: '대기' },
  { id: 'ent_users', label: '기업별 사용자 목록', status: '완료' },
];

const popups = [
  { id: 'dirty_check_prev', label: '이전 단계 이탈 확인 팝업', status: '완료' },
  { id: 'dirty_check_skip', label: '건너뛰기 이탈 확인 팝업', status: '완료' },
  { id: 'tenant_check_status', label: '테넌트 중복 확인 메시지/오류', status: '완료' },
];

export default function PublishingStatus() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
      <h2 className="text-[20px] font-bold text-gray-900 mb-6">퍼블리싱 현황 목록</h2>
      
      <div className="mb-8">
        <h3 className="text-[16px] font-bold text-gray-800 mb-4">화면 목록</h3>
        <table className="w-full border-collapse border border-gray-200 text-[14px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left">메뉴 ID</th>
              <th className="border border-gray-200 px-4 py-2 text-left">화면명</th>
              <th className="border border-gray-200 px-4 py-2 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {publishingPages.map(page => (
              <tr key={page.id}>
                <td className="border border-gray-200 px-4 py-2">{page.id}</td>
                <td className="border border-gray-200 px-4 py-2">{page.label}</td>
                <td className="border border-gray-200 px-4 py-2 text-[#008d75] font-semibold">{page.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-[16px] font-bold text-gray-800 mb-4">팝업 및 모달</h3>
        <table className="w-full border-collapse border border-gray-200 text-[14px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-200 px-4 py-2 text-left">팝업명</th>
              <th className="border border-gray-200 px-4 py-2 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {popups.map(popup => (
              <tr key={popup.id}>
                <td className="border border-gray-200 px-4 py-2">{popup.id}</td>
                <td className="border border-gray-200 px-4 py-2">{popup.label}</td>
                <td className="border border-gray-200 px-4 py-2 text-[#008d75] font-semibold">{popup.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
