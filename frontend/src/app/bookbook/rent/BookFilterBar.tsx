'use client';

import { useState, useEffect } from 'react';

// ✅ 필터 타입 정의
type FilterOptions = {
  region: string;
  category: string;
  searchKeyword: string;
};

type Region = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

interface BookFilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  loading?: boolean;
}

export default function BookFilterBar({ onFilterChange, loading = false }: BookFilterBarProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    region: 'all',
    category: 'all',
    searchKeyword: ''
  });

  // 🌍 지역 목록 조회 API
  const fetchRegions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/rent/regions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success || data.resultCode?.startsWith('200')) {
          setRegions(data.data || []);
        }
      } else {
        console.log('지역 목록 API 없음, 기본값 사용');
      }
    } catch (error) {
      console.log('지역 목록 조회 실패, 기본값 사용:', error);
    }
  };

  // 📚 카테고리 목록 조회 API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/rent/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success || data.resultCode?.startsWith('200')) {
          setCategories(data.data || []);
        }
      } else {
        console.log('카테고리 목록 API 없음, 기본값 사용');
      }
    } catch (error) {
      console.log('카테고리 목록 조회 실패, 기본값 사용:', error);
    }
  };

  // 컴포넌트 마운트 시 옵션 데이터 조회
  useEffect(() => {
    fetchRegions();
    fetchCategories();
  }, []);

  // 필터 값 변경 핸들러
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    console.log('검색 필터:', filters);
    onFilterChange(filters);
  };

  // 엔터키 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 필터 초기화
  const handleReset = () => {
    const resetFilters = {
      region: 'all',
      category: 'all',
      searchKeyword: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg">
      {/* 지역 선택 */}
      <select 
        value={filters.region}
        onChange={(e) => handleFilterChange('region', e.target.value)}
        className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        disabled={loading}
      >
        <option value="all">전체 지역</option>
        {regions.length > 0 ? (
          regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))
        ) : (
          // 기본 옵션 (API 없을 때) - 실제 Rent 데이터에서 자주 나올만한 지역들
          <>
            <option value="서울">서울</option>
            <option value="부산">부산</option>
            <option value="인천">인천</option>
            <option value="대구">대구</option>
            <option value="대전">대전</option>
            <option value="광주">광주</option>
            <option value="수원">수원</option>
            <option value="울산">울산</option>
          </>
        )}
      </select>

      {/* 카테고리 선택 */}
      <select 
        value={filters.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
        className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        disabled={loading}
      >
        <option value="all">전체 카테고리</option>
        {categories.length > 0 ? (
          categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))
        ) : (
          // 기본 옵션 (API 없을 때) - 실제 Rent 데이터에서 자주 나올만한 카테고리들
          <>
            <option value="문학">문학</option>
            <option value="과학">과학</option>
            <option value="역사">역사</option>
            <option value="철학">철학</option>
            <option value="컴퓨터">컴퓨터</option>
            <option value="경영">경영</option>
            <option value="교육">교육</option>
            <option value="예술">예술</option>
            <option value="종교">종교</option>
            <option value="건강">건강</option>
          </>
        )}
      </select>

      {/* 검색어 입력 */}
      <div className="flex gap-2 flex-1 min-w-[250px]">
        <input
          type="text"
          value={filters.searchKeyword}
          onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="책 제목, 저자, 출판사를 검색해주세요..."
          className="border border-gray-300 px-4 py-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        
        {/* 검색 버튼 */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#D5BAA3] hover:opacity-90 shadow'
          }`}
        >
          {loading ? '검색 중...' : '검색'}
        </button>

        {/* 초기화 버튼 */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          초기화
        </button>
      </div>

      {/* 현재 필터 표시 */}
      {(filters.region !== 'all' || filters.category !== 'all' || filters.searchKeyword) && (
        <div className="w-full flex flex-wrap gap-2 mt-2">
          <span className="text-sm text-gray-600">적용된 필터:</span>
          {filters.region !== 'all' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              지역: {regions.find(r => r.id === filters.region)?.name || filters.region}
            </span>
          )}
          {filters.category !== 'all' && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              카테고리: {categories.find(c => c.id === filters.category)?.name || filters.category}
            </span>
          )}
          {filters.searchKeyword && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
              검색: &quot;{filters.searchKeyword}&quot;
            </span>
          )}
        </div>
      )}
    </div>
  );
}