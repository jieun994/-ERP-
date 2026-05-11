import React, { useState } from 'react';
import { Search, AlertCircle, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessageData {
  id: string;
  no: number;
  messageCode: string;
  texts: Record<string, string>;
  isUsed: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const mockLangCodes = [
  { code: 'KO', name: '한국어' },
  { code: 'EN', name: '영어' },
  { code: 'JA', name: '일본어' },
];

const mockMessages: MessageData[] = [
  {
    id: '1',
    no: 1,
    messageCode: 'ERR_LOGIN_001',
    texts: { KO: '아이디 또는 비밀번호가 올바르지 않습니다.', EN: 'Invalid ID or Password.', JA: 'IDまたはパスワードが正しくありません。' },
    isUsed: true,
    author: 'admin1',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-10',
  },
  {
    id: '2',
    no: 2,
    messageCode: 'MSG_SAVE_SUCCESS',
    texts: { KO: '성공적으로 저장되었습니다.', EN: 'Saved successfully.', JA: '正常に保存されました。' },
    isUsed: true,
    author: 'admin1',
    createdAt: '2024-05-02',
    updatedAt: '2024-05-02',
  },
  {
    id: '3',
    no: 3,
    messageCode: 'CONFIRM_DELETE',
    texts: { KO: '정말 삭제하시겠습니까?', EN: 'Are you sure you want to delete?', JA: '本当に削除しますか？' },
    isUsed: false,
    author: 'admin2',
    createdAt: '2024-05-05',
    updatedAt: '2024-05-05',
  },
];

export default function MessageManagement() {
  const [data, setData] = useState<MessageData[]>(mockMessages);
  const [activeId, setActiveId] = useState<string | null>(data[0]?.id || null);
  
  // Search
  const [keyword, setKeyword] = useState('');

  // Editing state (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<MessageData>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const activeItem = data.find(d => d.id === activeId) || null;

  const filteredData = data.filter(item => {
    if (!keyword) return true;
    const lowerKeyword = keyword.toLowerCase();
    return (
      item.messageCode.toLowerCase().includes(lowerKeyword) ||
      Object.values(item.texts).some(txt => String(txt).toLowerCase().includes(lowerKeyword))
    );
  });

  const handleSelectMessage = (id: string) => {
    setActiveId(id);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    const initTexts: Record<string, string> = {};
    mockLangCodes.forEach(l => initTexts[l.code] = '');
    setFormData({
      messageCode: '',
      texts: initTexts,
      isUsed: true
    });
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (!activeItem) return;
    setIsAddingNew(false);
    setFormData({ ...activeItem });
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.messageCode?.trim()) {
      alert('메시지 코드를 입력해주세요.');
      return;
    }

    if (isAddingNew) {
      const newObj: MessageData = {
        id: Math.random().toString(36).substring(2, 9),
        no: data.length + 1,
        messageCode: formData.messageCode!,
        texts: formData.texts as Record<string, string>,
        isUsed: formData.isUsed !== undefined ? formData.isUsed : true,
        author: 'admin1',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setData([newObj, ...data]);
      setActiveId(newObj.id);
    } else {
      setData(prev => prev.map(d => d.id === activeId ? { ...d, ...formData, updatedAt: new Date().toISOString().split('T')[0] } as MessageData : d));
    }
    
    setIsModalOpen(false);
    setIsDirty(false);
    setFormData({});
    alert('저장되었습니다.');
  };

  const handleToggleUsed = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, isUsed: !d.isUsed } : d));
  };

  const handleCloseModal = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 flex flex-col">
      {/* Search Area */}
      <div className="flex items-stretch gap-3 mb-8">
        <div className="flex-1 bg-[#F9FAFB] border border-[#E5E8EB] px-8 py-5 rounded-md flex flex-wrap items-center justify-start gap-x-12 gap-y-4 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[14px] font-bold text-gray-800 shrink-0">검색어</span>
            <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="메시지 코드 또는 내용 입력"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-[40px] bg-white border border-[#D1D6DB] rounded-lg px-4 pr-10 text-[14px] text-[#191F28] outline-none focus:border-[#008d75] placeholder-[#8B95A1] transition-all"
                onKeyDown={(e) => e.key === 'Enter' && alert('조회하기')}
              />
              <Search className="w-4 h-4 text-[#8B95A1] absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="w-[100px] h-[48px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[15px] font-bold transition-colors shadow-sm">
            조회
          </button>
          <button className="w-[100px] h-[48px] bg-white border border-[#D1D6DB] hover:bg-[#F2F4F6] text-[#333333] rounded-md text-[15px] font-bold transition-colors shadow-sm"
            onClick={() => setKeyword('')}
          >
            초기화
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 min-h-[600px] max-h-[800px]">
        {/* Left: Message Code List */}
        <div className="w-80 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-[1px] border-[#191F28] h-10">
            <h3 className="text-[15px] font-bold text-[#191F28]">메시지 목록</h3>
          </div>

          <div className="flex-1 bg-white border border-[#E5E8EB] rounded-lg overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-y-auto flex-1">
              <div className="divide-y divide-[#E5E8EB]">
                {filteredData.map(item => (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col cursor-pointer transition-colors ${
                      activeId === item.id 
                        ? 'bg-[#008d7508]' 
                        : 'hover:bg-[#F2F4F640]'
                    }`}
                    onClick={() => handleSelectMessage(item.id)}
                  >
                    {activeId === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#008d75]"></div>
                    )}
                    <div className="px-5 py-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[14px] font-bold truncate ${activeId === item.id ? 'text-[#008d75]' : 'text-[#191F28]'}`}>
                          {item.messageCode}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleUsed(item.id);
                            }}
                            className={`px-2 py-0.5 text-[11px] rounded-md transition-colors font-medium border ${
                              item.isUsed 
                                ? 'text-[#8B95A1] border-[#E5E8EB] hover:bg-white' 
                                : 'text-[#008d75] border-[#008d7520] bg-[#008d7508] font-bold'
                            }`}
                          >
                            {item.isUsed ? '미사용' : '사용'}
                          </button>
                        </div>
                      </div>
                      <span className="text-[12px] text-[#8B95A1] truncate">
                        {item.texts['KO']}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredData.length === 0 && (
                  <div className="py-20 text-center text-[#8B95A1] text-[13px]">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Detail */}
        <div className="flex-1 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-[1px] border-[#191F28] h-10">
            <div className="text-[15px] font-bold flex items-center gap-2 text-nowrap">
              <span className="text-[#191F28]">{activeItem ? activeItem.messageCode : '메시지 상세'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEdit}
                disabled={!activeItem}
                className="h-[32px] px-4 bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[12px] font-semibold hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              >
                수정
              </button>
              <button 
                onClick={handleAddNew}
                className="h-[32px] px-4 bg-[#008d75] text-white rounded-md text-[13px] font-semibold hover:bg-[#007a65] transition-colors shadow-sm"
              >
                메시지 등록
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white border border-[#E5E8EB] rounded-lg shadow-sm overflow-hidden flex flex-col">
            {activeItem ? (
              <div className="p-10 space-y-10 overflow-y-auto">
                {/* Basic Info Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#F2F4F6] pb-3">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full" />
                    <h4 className="text-[14px] font-bold text-[#191F28]">기본 정보</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-10 pl-3">
                    <div className="space-y-2">
                      <label className="block text-[13px] font-semibold text-[#8B95A1]">메시지 코드</label>
                      <div className="text-[14px] font-bold text-[#191F28] px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E8EB] rounded-md font-mono tracking-tight">
                        {activeItem.messageCode}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[13px] font-semibold text-[#8B95A1]">사용 여부</label>
                      <div className="h-[42px] flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${
                          activeItem.isUsed ? 'bg-[#008d7510] text-[#008d75] border border-[#008d7520]' : 'bg-[#F2F4F6] text-[#8B95A1] border border-[#E5E8EB]'
                        }`}>
                          {activeItem.isUsed ? '사용 중' : '사용 안 함'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Language Texts Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#F2F4F6] pb-3">
                    <div className="w-1 h-4 bg-[#008d75] rounded-full" />
                    <h4 className="text-[14px] font-bold text-[#191F28]">다국어 정보</h4>
                  </div>
                  
                  <div className="space-y-6 pl-3">
                    {mockLangCodes.map(lang => (
                      <div key={lang.code} className="grid grid-cols-[140px_1fr] items-start gap-4 p-5 bg-[#F9FAFB] rounded-lg border border-[#E5E8EB]">
                        <label className="text-[13px] font-bold text-[#4E5968] mt-0.5">
                          {lang.name} ({lang.code})
                        </label>
                        <div className="text-[14px] text-[#191F28] leading-relaxed min-h-[3rem] whitespace-pre-wrap font-medium">
                          {activeItem.texts[lang.code] || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-[#F2F4F6] flex items-center gap-10 pl-3">
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="text-[#8B95A1] font-medium">최초 등록일</span>
                    <span className="text-[#4E5968] font-mono tracking-tight">{activeItem.createdAt}</span>
                  </div>
                  <div className="w-[1px] h-3 bg-[#E5E8EB]"></div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="text-[#8B95A1] font-medium">최종 수정일</span>
                    <span className="text-[#4E5968] font-mono tracking-tight">{activeItem.updatedAt}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8B95A1] pb-20">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[14px] font-medium">메시지를 선택하거나 신규 등록 버튼을 눌러주세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal (Redesign for consistency with CodeManagement) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[600px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 h-[56px] border-b border-[#E5E8EB] flex items-center justify-between bg-white shrink-0">
                <h3 className="font-semibold text-[16px] text-[#191F28]">{isAddingNew ? '메시지 등록' : '메시지 수정'}</h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 text-[#8B95A1] hover:text-[#191F28] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto w-full space-y-8">
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                       <h4 className="text-[14px] font-semibold text-[#191F28]">기본 설정</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pl-3">
                      <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-[#191F28]">메시지 코드 <span className="text-[#F04452]">*</span></label>
                        <input 
                          type="text" 
                          disabled={!isAddingNew}
                          value={formData?.messageCode || ''}
                          onChange={(e) => {
                            setFormData({ ...formData, messageCode: e.target.value });
                            setIsDirty(true);
                          }}
                          className={`w-full h-[36px] px-3 border rounded-md text-[14px] outline-none transition-all font-mono tracking-tight ${
                            !isAddingNew 
                            ? 'bg-[#F9FAFB] border-[#E5E8EB] text-[#8B95A1] cursor-not-allowed' 
                            : 'bg-white border-[#D1D6DB] text-[#191F28] focus:border-[#008d75]'
                          }`}
                          placeholder="예: ERR_AUTH_001"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-[#191F28]">사용 여부</label>
                        <div className="h-[36px] flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="modalIsUsed"
                              checked={formData?.isUsed === true}
                              onChange={() => {
                                setFormData({ ...formData, isUsed: true });
                                setIsDirty(true);
                              }}
                              className="w-4 h-4 accent-[#008d75]"
                            />
                            <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">사용</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="modalIsUsed"
                              checked={formData?.isUsed === false}
                              onChange={() => {
                                setFormData({ ...formData, isUsed: false });
                                setIsDirty(true);
                              }}
                              className="w-4 h-4 accent-[#008d75]"
                            />
                            <span className="text-[14px] text-[#4E5968] group-hover:text-[#191F28]">미사용</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t border-[#E5E8EB]">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-4 bg-[#008d75] rounded-full"></div>
                       <h4 className="text-[14px] font-semibold text-[#191F28]">다국어 정보 입력</h4>
                    </div>
                    
                    <div className="space-y-5 pl-3">
                      {mockLangCodes.map(lang => (
                        <div key={lang.code} className="space-y-1.5">
                          <label className="text-[14px] font-semibold text-[#191F28] block">
                            {lang.name} ({lang.code})
                            {lang.code === 'KO' && <span className="text-[#F04452] ml-1">*</span>}
                          </label>
                          <textarea 
                            rows={2}
                            value={formData?.texts?.[lang.code] || ''}
                            onChange={(e) => {
                              const newTexts = { ...formData?.texts, [lang.code]: e.target.value };
                              setFormData({ ...formData, texts: newTexts as Record<string, string> });
                              setIsDirty(true);
                            }}
                            className="w-full px-4 py-3 bg-white border border-[#D1D6DB] rounded-md text-[14px] text-[#191F28] outline-none focus:border-[#008d75] transition-all resize-none placeholder-[#8B95A1]"
                            placeholder={`${lang.name} 내용을 입력하세요.`}
                            required={lang.code === 'KO'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="h-[72px] px-6 border-t border-[#E5E8EB] bg-[#F9FAFB] flex items-center justify-center gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="w-[120px] h-[40px] border border-[#D1D6DB] rounded-md bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F2F4F6] transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleSave}
                  className="w-[120px] h-[40px] bg-[#008d75] hover:bg-[#007a65] text-white rounded-md text-[14px] font-semibold transition-colors shadow-sm"
                >
                  저장하기
                </button>
              </div>


            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Warning Modal */}
      <AnimatePresence>
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-8 text-center"
              >
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#191F28] mb-3">저장되지 않은 변경사항</h3>
                  <p className="text-[14px] text-[#4E5968] mb-10 leading-relaxed">현재 입력한 내용이 유실될 수 있습니다.<br/>그래도 닫으시겠습니까?</p>
                  <div className="flex gap-2 justify-center">
                      <button 
                          onClick={() => setShowUnsavedWarning(false)}
                          className="flex-1 h-[44px] bg-white border border-[#D1D6DB] text-[#333333] rounded-md text-[14px] font-semibold hover:bg-[#F9FAFB] transition-colors"
                      >
                          계속 작성
                      </button>
                      <button 
                          onClick={() => {
                              setShowUnsavedWarning(false);
                              setIsModalOpen(false);
                              setIsDirty(false);
                          }}
                          className="flex-1 h-[44px] bg-[#008d75] text-white rounded-md text-[14px] font-semibold hover:bg-[#007a65] transition-colors shadow-sm"
                      >
                          닫기
                      </button>
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
