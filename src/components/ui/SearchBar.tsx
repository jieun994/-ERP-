import React from 'react';
import Button from './Button';

interface SearchBarProps {
  onSearch: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

/**
 * 공통 SearchBar 컴포넌트
 * 회색 박스 + 검색조건 레이아웃 + 조회/초기화 버튼을 묶은 래퍼
 *
 * @example
 * <SearchBar onSearch={handleSearch} onReset={handleReset}>
 *   <SearchBar.Field label="테넌트명">
 *     <Select ...>...</Select>
 *   </SearchBar.Field>
 *   <SearchBar.Field label="기업명">
 *     <Input placeholder="기업명 입력" />
 *   </SearchBar.Field>
 * </SearchBar>
 */
function SearchBar({ onSearch, onReset, children }: SearchBarProps) {
  return (
    <div className="flex items-stretch gap-3 mb-8">
      {/* 조건 영역 */}
      <div className="flex-1 bg-bg-gray border border-border-gray px-8 py-5 rounded-md flex flex-wrap items-center gap-x-12 gap-y-4 shadow-sm">
        {children}
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-2 shrink-0">
        <Button variant="primary" size="lg" style={{ width: 100 }} onClick={onSearch}>
          조회
        </Button>
        <Button variant="secondary" size="lg" style={{ width: 100 }} onClick={onReset}>
          초기화
        </Button>
      </div>
    </div>
  );
}

/**
 * 검색 필드 한 줄 (라벨 + 입력 요소)
 *
 * @example
 * <SearchBar.Field label="사용여부">
 *   <Select>...</Select>
 * </SearchBar.Field>
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-body font-bold text-text-main shrink-0">{label}</span>
      {children}
    </div>
  );
}

SearchBar.Field = Field;

export default SearchBar;
