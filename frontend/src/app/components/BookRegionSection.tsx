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

// 메인페이지 API 호출 (인증 불필요)
const fetchHomeData = async (): Promise<HomeApiResponse> => {
  try {
    console.log('API 호출 시작: http://localhost:8080/api/v1/bookbook/home');
    
    const response = await fetch('http://localhost:8080/api/v1/bookbook/home', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // CORS 이슈를 위한 설정
      mode: 'cors',
      credentials: 'include'
    });
    
    console.log('응답 상태:', response.status, response.statusText);
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('파싱된 응답 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('fetchHomeData 에러 상세:', error);
    throw error;
  }
};

const BookRegionSection = () => {
  const [homeData, setHomeData] = useState<HomeApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchHomeData();
        
        console.log('API 응답 전체:', response);
        
        // 응답 구조 확인 및 데이터 설정
        if (response && (response.success || response.resultCode === "200-1")) {
          setHomeData(response.data);
          console.log('데이터 설정 완료:', response.data);
        } else {
          console.warn('API 응답이 성공이 아님:', response);
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('API 호출 에러 상세:', err);
        
        // 에러 유형에 따른 다른 메시지 표시
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        } else if (err instanceof Error && err.message.includes('HTTP 403')) {
          setError('서버 접근 권한 오류가 발생했습니다. 관리자에게 문의해주세요.');
        } else if (err instanceof Error && err.message.includes('HTTP 404')) {
          setError('API 경로를 찾을 수 없습니다. 백엔드 서버 설정을 확인해주세요.');
        } else if (err instanceof Error && err.message.includes('HTTP')) {
          setError(`서버 오류: ${err.message}`);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // 단순 재시도
    setTimeout(() => window.location.reload(), 100);
  };

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
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="text-lg text-red-600 text-center">{error}</div>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              새로고침
            </button>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
          {/* 개발용 백엔드 상태 확인 링크 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-sm text-gray-500 text-center">
              <div className="mb-2">백엔드 상태 확인:</div>
              <a 
                href="http://localhost:8080/api/v1/bookbook/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                http://localhost:8080/api/v1/bookbook/home
              </a>
            </div>
          )}
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
        
        <div className="text-sm text-gray-600">
          {homeData?.region && (
            <span className="mr-4 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
              📍 {homeData.region}
            </span>
          )}
          총 {homeData?.totalBooksInRegion || 0}권
        </div>
      </div>

      {/* 도서 이미지 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {homeData?.bookImages && homeData.bookImages.length > 0 ? (
          homeData.bookImages.map((imageUrl, index) => (
            <div key={index} className="w-full h-[250px] relative overflow-hidden rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src={imageUrl}
                alt={`추천 도서 ${index + 1}`}
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
              {homeData?.region 
                ? `${homeData.region}에 등록된 도서가 없습니다.` 
                : '도서를 등록해주세요.'
              }
            </div>
          </div>
        )}
      </div>

      {/* 지역 정보 표시 (나중에 주소 입력 기능으로 확장 예정) */}
      {homeData?.region && (
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600 text-center">
            💡 현재 <strong>{homeData.region}</strong> 지역의 도서를 보고 계십니다.
            <div className="text-xs text-gray-500 mt-1">
              나중에 다른 지역의 도서도 검색할 수 있어요!
            </div>
          </div>
        </div>
      )}

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