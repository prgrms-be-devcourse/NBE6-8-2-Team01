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
    userRegion?: string;
  };
  success?: boolean;
  statusCode: number;
}

interface RegionInfo {
  name: string;
  code: string;
}

interface RegionListResponse {
  resultCode: string;
  msg: string;
  data: RegionInfo[];
  statusCode: number;
}

// 메인페이지 API 호출 (인증 불필요)
const fetchHomeData = async (region?: string): Promise<HomeApiResponse> => {
  try {
    const url = new URL('http://localhost:8080/api/v1/bookbook/home');
    if (region && region !== '전체') {
      url.searchParams.append('region', region);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('fetchHomeData 에러:', error);
    throw error;
  }
};

// 지역 목록 API 호출
const fetchRegions = async (): Promise<RegionInfo[]> => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/bookbook/home/regions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: RegionListResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('fetchRegions 에러:', error);
    
    // 서버 연결 실패 시 기본 지역 목록 반환
    return [
      { name: '서울특별시', code: 'seoul' },
      { name: '부산광역시', code: 'busan' },
      { name: '대구광역시', code: 'daegu' },
      { name: '인천광역시', code: 'incheon' },
      { name: '광주광역시', code: 'gwangju' },
      { name: '대전광역시', code: 'daejeon' },
      { name: '울산광역시', code: 'ulsan' },
      { name: '경기도', code: 'gyeonggi' },
      { name: '강원특별자치도', code: 'gangwon' },
      { name: '충청북도', code: 'chungbuk' },
      { name: '충청남도', code: 'chungnam' },
      { name: '전북특별자치도', code: 'jeonbuk' },
      { name: '전라남도', code: 'jeonnam' },
      { name: '경상북도', code: 'gyeongbuk' },
      { name: '경상남도', code: 'gyeongnam' },
      { name: '제주특별자치도', code: 'jeju' }
    ];
  }
};

const BookRegionSection = () => {
  const [homeData, setHomeData] = useState<HomeApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  // 지역 목록 로드
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regionData = await fetchRegions();
        
        // 전체 옵션을 맨 앞에 추가
        const regionsWithAll = [{ name: '전체', code: 'all' }, ...regionData];
        setRegions(regionsWithAll);
      } catch (error) {
        console.error('지역 목록 로드 실패:', error);
        // 최소한 전체 옵션은 유지
        setRegions([{ name: '전체', code: 'all' }]);
      }
    };

    loadRegions();
  }, []);

  // 메인 데이터 로드
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchHomeData(selectedRegion === '전체' ? undefined : selectedRegion);
        
        // 백엔드 응답 구조에 맞게 성공 조건 확인
        if (response && (response.statusCode === 200 || response.resultCode.startsWith("200"))) {
          setHomeData(response.data);
          
          // 사용자 지역 정보가 있고 현재 선택된 지역이 전체인 경우 자동 선택
          if (response.data.userRegion && selectedRegion === '전체') {
            setSelectedRegion(response.data.userRegion);
            return; // 자동 선택 후 다시 로드할 것이므로 여기서 return
          }
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('API 호출 에러:', err);
        
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
  }, [selectedRegion]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setShowRegionSelector(false);
  };

  const handleImageError = (imageUrl: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    console.error('이미지 로드 실패:', imageUrl);
    
    // 기본 책 placeholder 이미지로 대체
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA5MEgxNDBWMTkwSDYwVjkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODAgMTEwSDEyMFYxMzBIODBWMTEwWiIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNODAgMTQwSDEyMFYxNTBIODBWMTQwWiIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNODAgMTYwSDEwMFYxNzBIODBWMTYwWiIgZmlsbD0iI0Y5RkFGQiIvPgo8L3N2Zz4K';
    img.alt = '이미지를 불러올 수 없습니다';
  };

  const handleImageLoad = (imageUrl: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    
    // 이미지 표시 강제 설정 (이전에 작동했던 코드)
    img.style.display = 'block';
    img.style.opacity = '1';
    img.style.zIndex = '25';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '100%';
    img.style.height = '100%';
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
              onClick={() => {
                setError(null);
                setLoading(true);
                setTimeout(() => window.location.reload(), 100);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
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
        
        <div className="flex items-center space-x-4">
          {/* 지역 선택 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setShowRegionSelector(!showRegionSelector)}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              <span>📍 {selectedRegion}</span>
              <span className="text-xs">▼</span>
            </button>
            
            {showRegionSelector && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {regions.map((region) => (
                  <button
                    key={region.code}
                    onClick={() => handleRegionChange(region.name)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      selectedRegion === region.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 총 도서 수 표시 */}
          <div className="text-sm text-gray-600">
            총 {homeData?.totalBooksInRegion || 0}권
          </div>
        </div>
      </div>

      {/* 도서 이미지 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {homeData?.bookImages && homeData.bookImages.length > 0 ? (
          homeData.bookImages.map((imageUrl, index) => (
            <div key={index} className="w-full h-[280px] relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <img
                src={imageUrl}
                alt={`추천 도서 ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                decoding="async"
                onError={(e) => handleImageError(imageUrl, e)}
                onLoad={(e) => handleImageLoad(imageUrl, e)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
                  backgroundColor: 'transparent'
                }}
              />
              
              {/* 호버 시 오버레이 효과 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center" style={{zIndex: 20}}>
                <div className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-2">
                  {selectedRegion !== '전체' ? selectedRegion : '전국'} 도서
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            <div className="text-4xl mb-4">📖</div>
            <div className="text-lg mb-2">등록된 도서가 없습니다.</div>
            <div className="text-sm text-gray-400">
              {selectedRegion !== '전체' 
                ? `${selectedRegion}에 등록된 도서가 없습니다.` 
                : '도서를 등록해주세요.'
              }
            </div>
            {selectedRegion !== '전체' && (
              <button 
                onClick={() => handleRegionChange('전체')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                전체 지역 보기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 지역 정보 표시 */}
      {homeData?.region && homeData.region !== '전체' && (
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="text-sm text-gray-600 text-center">
            💡 현재 <strong className="text-blue-700">{homeData.region}</strong> 지역의 도서를 보고 계십니다.
            <div className="text-xs text-gray-500 mt-1">
              다른 지역의 도서도 위의 지역 선택에서 확인하실 수 있어요!
            </div>
          </div>
        </div>
      )}

      {/* 새로고침 버튼 */}
      <div className="mt-8 text-center">
        <button 
          onClick={() => {
            setLoading(true);
            setTimeout(() => window.location.reload(), 100);
          }}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
        >
          🔄 새로고침
        </button>
      </div>
    </section>
  );
};

export default BookRegionSection;