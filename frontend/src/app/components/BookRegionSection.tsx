'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface BookInfo {
  id: number;
  imageUrl: string;
  title: string;
  bookTitle: string;
}

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

interface BooksApiResponse {
  resultCode: string;
  msg: string;
  data: BookInfo[];
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

// 이미지 URL 정규화 함수
const normalizeImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // 이미 완전한 URL인 경우 그대로 반환
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 상대 경로인 경우 절대 경로로 변환
  if (imageUrl.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imageUrl}`;
  }
  
  // 그 외의 경우 uploads 경로로 처리
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${imageUrl}`;
};

// 메인페이지 API 호출 (인증 불필요)
const fetchHomeData = async (region?: string): Promise<HomeApiResponse> => {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/home`);
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

// 도서 정보 (ID 포함) API 호출
const fetchBooksWithId = async (region?: string): Promise<BookInfo[]> => {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/home/books-with-id`);
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
      console.warn(`fetchBooksWithId API 오류: HTTP ${response.status}: ${response.statusText}`);
      return []; // 오류 시 빈 배열 반환
    }
    
    const data: BooksApiResponse = await response.json();
    
    if (data && (data.statusCode === 200 || data.resultCode.startsWith("200"))) {
      // 이미지 URL 정규화 처리
      const normalizedBooks = (data.data || []).map(book => ({
        ...book,
        imageUrl: normalizeImageUrl(book.imageUrl)
      }));
      return normalizedBooks;
    } else {
      console.warn('fetchBooksWithId API 응답 오류:', data);
      return [];
    }
  } catch (error) {
    console.warn('fetchBooksWithId 네트워크 오류:', error);
    return []; // 네트워크 오류 시 빈 배열 반환 (오류 발생시키지 않음)
  }
};

// 지역 목록 API 호출
const fetchRegions = async (): Promise<RegionInfo[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/home/regions`, {
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
  const router = useRouter();
  const [homeData, setHomeData] = useState<HomeApiResponse['data'] | null>(null);
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  
  // 자동 지역 선택이 이미 한 번 실행되었는지 추적하는 ref
  const hasAutoSelectedRegion = useRef(false);

  useEffect(() => {
    // 약간의 지연을 두어 하이드레이션이 완료된 후 렌더링
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 지역 목록 로드
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

  // 메인 데이터 로드
  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 기본 홈 데이터와 도서 정보를 동시에 로드
        const [homeResponse, booksData] = await Promise.all([
          fetchHomeData(selectedRegion === '전체' ? undefined : selectedRegion),
          fetchBooksWithId(selectedRegion === '전체' ? undefined : selectedRegion)
        ]);
        
        // 홈 데이터 처리
        if (homeResponse && (homeResponse.statusCode === 200 || homeResponse.resultCode.startsWith("200"))) {
          // 홈 데이터의 이미지 URL도 정규화
          const normalizedHomeData = {
            ...homeResponse.data,
            bookImages: (homeResponse.data.bookImages || []).map(normalizeImageUrl)
          };
          setHomeData(normalizedHomeData);
          
          // 사용자 지역 정보가 있고 아직 자동 선택이 실행되지 않았으며 현재 선택된 지역이 전체인 경우에만 자동 선택
          if (homeResponse.data.userRegion && 
              !hasAutoSelectedRegion.current && 
              selectedRegion === '전체') {
            console.log('사용자 지역으로 자동 선택:', homeResponse.data.userRegion);
            hasAutoSelectedRegion.current = true; // 자동 선택 실행 표시
            setSelectedRegion(homeResponse.data.userRegion);
            return; // 자동 선택 후 다시 로드할 것이므로 여기서 return
          }
        } else {
          console.warn('홈 데이터 로드 실패, 기본 데이터 사용');
          // 홈 데이터 로드 실패 시에도 기본 데이터 설정
          setHomeData({
            region: selectedRegion,
            bookImages: [],
            totalBooksInRegion: 0,
            message: '최근 등록된 도서'
          });
        }
        
        // 도서 데이터 설정 (성공/실패 관계없이)
        setBooks(booksData);
        
      } catch (err) {
        console.error('데이터 로드 에러:', err);
        
        // 에러 발생 시에도 기본 데이터 설정하여 화면이 깨지지 않도록 함
        setHomeData({
          region: selectedRegion,
          bookImages: [],
          totalBooksInRegion: 0,
          message: '최근 등록된 도서'
        });
        setBooks([]);
        
        // 네트워크 오류가 아닌 경우에만 에러 메시지 표시
        if (!(err instanceof TypeError && err.message.includes('Failed to fetch'))) {
          if (err instanceof Error && err.message.includes('HTTP 403')) {
            setError('서버 접근 권한 오류가 발생했습니다. 관리자에게 문의해주세요.');
          } else if (err instanceof Error && err.message.includes('HTTP 404')) {
            setError('API 경로를 찾을 수 없습니다. 백엔드 서버 설정을 확인해주세요.');
          } else if (err instanceof Error && err.message.includes('HTTP')) {
            setError(`서버 오류: ${err.message}`);
          } else {
            setError('알 수 없는 오류가 발생했습니다.');
          }
        }
        // Failed to fetch 오류는 로그아웃 상태에서 정상적인 현상이므로 에러 메시지 표시하지 않음
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedRegion, mounted]);

  const handleRegionChange = (region: string) => {
    // 사용자가 수동으로 지역을 변경하는 경우
    console.log('사용자가 지역 변경:', selectedRegion, '→', region);
    setSelectedRegion(region);
    setShowRegionSelector(false);
    
    // 실패한 이미지 목록 초기화
    setFailedImages(new Set());
    
    // 사용자가 수동으로 지역을 변경했으므로 자동 선택 플래그를 true로 설정
    // (다시 자동 선택되지 않도록)
    hasAutoSelectedRegion.current = true;
  };

  // 도서 이미지 클릭 시 rent 페이지로 이동
  const handleBookClick = (bookId: number) => {
    console.log('도서 클릭 - ID:', bookId);
    router.push(`/bookbook/rent/${bookId}`);
  };

  // 🔧 간단한 이미지 에러 처리 - 재시도 없이 바로 기본 이미지로 대체
  const handleImageError = (imageUrl: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    
    // 이미 에러 처리된 이미지는 무시 (무한 재시도 방지)
    if (img.dataset.errorHandled === 'true') {
      return;
    }
    

    // 다른 경로들을 순차적으로 시도
    const tryAlternativeUrls = [
      imageUrl.replace('/images/', '/uploads/'),
      imageUrl.replace('/uploads/', '/images/'),
      imageUrl.replace(`${process.env.NEXT_PUBLIC_API_BASE_URL}`, ''),
      imageUrl.includes('/uploads/') ? imageUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${imageUrl.split('/').pop()}`,
      imageUrl.includes('/images/') ? imageUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${imageUrl.split('/').pop()}`
    ];
    console.warn('이미지 로드 실패 - 기본 이미지로 대체:', imageUrl);
    
    // 에러 처리 플래그 설정
    img.dataset.errorHandled = 'true';
    
    // 실패한 이미지 목록에 추가
    setFailedImages(prev => new Set([...prev, imageUrl]));
    
    // 바로 기본 이미지로 대체 (재시도 없음)
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA5MEgxNDBWMTkwSDYwVjkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODAgMTEwSDEyMFYxMzBIODBWMTEwWiIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNODAgMTQwSDEyMFYxNTBIODBWMTQwWiIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNODAgMTYwSDEwMFYxNzBIODBWMTYwWiIgZmlsbD0iI0Y5RkFGQiIvPgo8L3N2Zz4K';
    img.alt = '이미지를 불러올 수 없습니다';
    
    // 더 이상 onError 이벤트가 발생하지 않도록 설정
    img.onerror = null;
  };

  const handleImageLoad = (imageUrl: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    
    // 성공적으로 로드된 이미지는 실패 목록에서 제거
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
    
    // 이미지 표시 강제 설정
    img.style.display = 'block';
    img.style.opacity = '1';
    img.style.zIndex = '25';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '100%';
    img.style.height = '100%';
  };

  // 서버 사이드 렌더링 중에는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

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

  // 새로운 books 배열을 사용, 없으면 기존 bookImages 사용 (하위 호환성)
  const displayBooks = books && books.length > 0 
    ? books 
    : homeData?.bookImages?.map((imageUrl, index) => ({
        id: 0, // 기존 방식에서는 ID를 알 수 없으므로 0으로 설정 (클릭 불가)
        imageUrl,
        title: `도서 ${index + 1}`,
        bookTitle: `도서 ${index + 1}`
      })) || [];

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
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-60 overflow-y-auto">
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
        {displayBooks && displayBooks.length > 0 ? (
          displayBooks.map((book, index) => (
            <div 
              key={`${book.id}-${index}`} 
              className={`w-full h-[280px] relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group ${
                book.id > 0 ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
              }`}
              onClick={() => book.id > 0 && handleBookClick(book.id)}
              title={book.id > 0 ? `${book.bookTitle || book.title} - 클릭하여 상세보기` : book.title}
            >
              <img
                src={book.imageUrl}
                alt={book.bookTitle || book.title || `추천 도서 ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                decoding="async"
                onError={(e) => handleImageError(book.imageUrl, e)}
                onLoad={(e) => handleImageLoad(book.imageUrl, e)}
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
                  {book.id > 0 ? (
                    <div>
                      <div className="font-semibold mb-1">{book.bookTitle || book.title}</div>
                      <div className="text-xs">클릭하여 상세보기</div>
                    </div>
                  ) : (
                    <div>
                      {selectedRegion !== '전체' ? selectedRegion : '전국'} 도서
                    </div>
                  )}
                </div>
              </div>

              {/* 클릭 가능한 도서에 대한 시각적 표시 */}
              {book.id > 0 && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{zIndex: 25}}>
                  상세보기
                </div>
              )}
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
              도서 이미지를 클릭하면 상세 정보를 확인할 수 있어요!
            </div>
          </div>
        </div>
      )}

      {/* 사용 안내 */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600 text-center">
          💬 <strong>이용 안내:</strong> 도서 이미지를 클릭하면 상세 정보와 대여 신청을 할 수 있습니다.
        </div>
      </div>

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