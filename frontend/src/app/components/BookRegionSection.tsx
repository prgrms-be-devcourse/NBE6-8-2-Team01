'use client';

import React, { useState, useEffect } from 'react';

interface HomeApiResponse {
  resultCode: string;
  msg: string;
  data: {
    region: string;
    bookImages: string[];
    totalBooksInRegion: number;
    message: string;
  };
  success: boolean;
}

// 기본 메인페이지 API 호출 (비로그인)
const fetchHomeData = async (): Promise<HomeApiResponse> => {
  const response = await fetch('http://localhost:8080/api/v1/home');
  
  if (!response.ok) {
    throw new Error('API 호출 실패');
  }
  
  return response.json();
};

// 테스트용 API 호출
const fetchTestData = async (userId?: number): Promise<HomeApiResponse> => {
  const url = userId 
    ? `http://localhost:8080/api/v1/home/test?userId=${userId}`
    : 'http://localhost:8080/api/v1/home/test';
    
  const response = await fetch(url);
  return response.json();
};

const BookRegionSection = () => {
  const [homeData, setHomeData] = useState<HomeApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testUserId, setTestUserId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 테스트 모드 또는 일반 모드
        const response = testMode 
          ? await fetchTestData(testUserId)
          : await fetchHomeData();
        
        console.log('API 응답:', response); // 디버깅용
        
        if (response.success || response.resultCode === "200-1") {
          setHomeData(response.data);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('API 호출 에러:', err);
        setError('서버와 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [testMode, testUserId]);

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 mt-12 mb-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">📚 도서 정보를 불러오는 중...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 mt-12 mb-16">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-12 mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {homeData?.message || '최근 등록된 도서'}
        </h2>
        
        {/* 개발/테스트용 컨트롤 */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
            />
            테스트 모드
          </label>
          
          {testMode && (
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={testUserId || 'none'}
              onChange={(e) => {
                const value = e.target.value;
                setTestUserId(value === 'none' ? undefined : Number(value));
              }}
            >
              <option value="none">전체 (비로그인)</option>
              <option value={1}>성북구 사용자</option>
              <option value={2}>강남구 사용자</option>
              <option value={3}>마포구 사용자</option>
            </select>
          )}
          
          <div className="text-sm text-gray-600">
            총 {homeData?.totalBooksInRegion || 0}권
          </div>
        </div>
      </div>

      {/* 도서 이미지 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {homeData?.bookImages && homeData.bookImages.length > 0 ? (
          homeData.bookImages.map((imageUrl, index) => (
            <div key={index} className="w-full h-[250px] relative overflow-hidden rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src={imageUrl}
                alt={`${homeData.region} 추천 도서 ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.log('이미지 로드 실패:', imageUrl);
                  e.currentTarget.src = '/book-placeholder.png';
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            <div className="text-lg mb-2">📖</div>
            <div>등록된 도서가 없습니다.</div>
            <div className="text-sm text-gray-400 mt-2">
              백엔드 서버의 더미 데이터를 확인해주세요.
            </div>
          </div>
        )}
      </div>

      {/* 개발용 디버깅 정보 */}
      {process.env.NODE_ENV === 'development' && homeData && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <details className="cursor-pointer">
            <summary className="font-bold mb-2">디버깅 정보 (개발용)</summary>
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify(homeData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
};

export default BookRegionSection;
