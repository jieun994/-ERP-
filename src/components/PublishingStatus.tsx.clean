import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const publishingPages = [
  { id: 'tenant_list', label: '테넌트 조회', status: '완료', route: '/dashboard/enterprise/tenant_list' },
  { id: 'ent_list', label: '기업 조회', status: '완료', route: '/dashboard/enterprise/ent_list' },
  { id: 'ent_register_step1', label: '기업 등록 - 기본 정보', status: '완료', route: '/dashboard/enterprise/ent_register' },
  { id: 'ent_register_step2', label: '기업 등록 - VAN/펌뱅킹 ID 등록', status: '진행중', route: '/dashboard/enterprise/ent_register' },
  { id: 'ent_register_step3', label: '기업 등록 - 인터페이스 설정', status: '대기', route: '/dashboard/enterprise/ent_register' },
  { id: 'ent_users', label: '기업별 사용자 목록', status: '완료', route: '/dashboard/enterprise/ent_users' },
];

const popups = [
  { id: 'dirty_check_prev', label: '이전 단계 이탈 확인 팝업', status: '완료' },
  { id: 'dirty_check_skip', label: '건너뛰기 이탈 확인 팝업', status: '완료' },
  { id: 'tenant_check_status', label: '테넌트 중복 확인 메시지/오류', status: '완료' },
];

export default function PublishingStatus() {
  const navigate = useNavigate();

  const handleRowClick = (route: string) => {
    navigate(route);
  };

  const handleCopyLink = (pageId: string, route: string) => {
    const fullUrl = `${window.location.origin}${route}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`링크가 복사되었습니다:\n${fullUrl}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
      <h2 className="text-[20px] font-bold text-gray-900 mb-6">퍼블리싱 현황 목록</h2>

      <div className="mb-8">
        <h3 className="text-[16px] font-bold text-gray-800 mb-4">화면 목록</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-[14px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">메뉴 ID</th>
                <th className="border border-gray-200 px-4 py-2 text-left">화면명</th>
                <th className="border border-gray-200 px-4 py-2 text-left">상태</th>
                <th className="border border-gray-200 px-4 py-2 text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {publishingPages.map(page => (
                <tr
                  key={page.id}
                  className="hover:bg-blue-50 transition-colors cursor-pointer group"
                >
                  <td className="border border-gray-200 px-4 py-3 text-gray-700">{page.id}</td>
                  <td
                    className="border border-gray-200 px-4 py-3 text-blue-600 font-medium hover:underline"
                    onClick={() => handleRowClick(page.route)}
                  >
                    {page.label}
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-semibold ${
                      page.status === '완료' ? 'bg-emerald-100 text-emerald-700' :
                      page.status === '진행중' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <button
                      onClick={() => handleCopyLink(page.id, page.route)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      title="링크 복사"
                    >
                      <ExternalLink className="w-3 h-3" />
                      링크 복사
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-[13px] text-blue-800">
          💡 <strong>팁:</strong> 화면명을 클릭하거나 '링크 복사' 버튼으로 직접 공유 가능한 URL을 얻을 수 있습니다.
        </p>
      </div>

      <div>
        <h3 className="text-[16px] font-bold text-gray-800 mb-4">팝업 및 모달</h3>
        <div className="overflow-x-auto">
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
                <tr key={popup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 px-4 py-2">{popup.id}</td>
                  <td className="border border-gray-200 px-4 py-2">{popup.label}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="inline-block px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-100 text-emerald-700">
                      {popup.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}