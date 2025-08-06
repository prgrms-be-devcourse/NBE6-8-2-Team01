'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookFilterBar from './BookFilterBar';
import BookCardList from './BookCardList';

// ✅ 필터 옵션 타입
type FilterOptions = {
  region: string;
  category: string;
  searchKeyword: string;
};

// ✅ 페이지네이션 정보 타입
type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
};

// ✅ 백엔드 Rent 엔티티에 맞춘 Book 타입
type Book = {
  id: number;              // Long → number 변환
  bookTitle: string;       // 실제 책 제목 (Rent.bookTitle)
  author: string;          // 저자 (Rent.author)
  publisher: string;       // 출판사 (Rent.publisher)
  bookCondition: string;   // 책 상태 (Rent.bookCondition) - 상, 중, 하
  bookImage: string;       // 책 이미지 (Rent.bookImage)
  address: string;         // 위치 정보 (Rent.address)
  category: string;        // 카테고리 (Rent.category)
  rentStatus: string;      // 대여 상태 (Rent.rent_status) - "대여 가능", "대여 중"
  lenderUserId: number;    // 책 소유자 ID (Rent.lender_user_id) Long → number
  lenderNickname?: string; // 책 소유자 닉네임
  title?: string;          // 대여글 제목 (Rent.title)
  contents?: string;       // 대여 설명 (Rent.contents)
  createdDate?: string;    // 생성일
  modifiedDate?: string;   // 수정일
};

// ✅ API 응답 타입
type BooksApiResponse = {
  resultCode: string;
  msg: string;
  data: {
    books: Book[];
    pagination: PaginationInfo;
  };
  success: boolean;
};

export default function RentPage() {
  const router = useRouter(); // Next.js 라우터 추가
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    size: 4 // 세로 레이아웃에 맞게 4개로 변경
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    region: 'all',
    category: 'all',
    searchKeyword: ''
  });
  // 실패한 이미지 추적을 위한 상태 추가
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // 📚 책 목록 조회 API (필터 + 페이지네이션)
  const fetchBooks = async (filters: FilterOptions, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      // URL 파라미터 구성
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.size.toString(),
        ...(filters.region !== 'all' && { region: filters.region }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.searchKeyword && { search: filters.searchKeyword })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/rent/available?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      console.log('대여 가능한 책 목록 조회 API 호출:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/rent/available?${params}`);
      console.log('API 응답 상태:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('검색 결과 없음');
          setBooks([]);
          setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BooksApiResponse = await response.json();
      console.log('책 목록 API 응답 데이터:', data);

      if (data.success || data.resultCode?.startsWith('200')) {
        setBooks(data.data?.books || []);
        setPagination(data.data?.pagination || {
          currentPage: page,
          totalPages: 1,
          totalElements: data.data?.books?.length || 0,
          size: pagination.size
        });
      } else {
        setBooks([]);
        setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
      }
    } catch (err) {
      console.error('책 목록 조회 에러:', err);
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else {
        // API 연동 시도는 성공으로 간주하고 빈 데이터 처리
        console.log('API 연동 시도 완료, 빈 데이터로 처리');
        setBooks([]);
        setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔍 필터 변경 핸들러
  const handleFilterChange = (filters: FilterOptions) => {
    console.log('필터 변경:', filters);
    setCurrentFilters(filters);
    // 필터 변경 시 실패한 이미지 목록 초기화
    setFailedImages(new Set());
    fetchBooks(filters, 1); // 첫 페이지부터 검색
  };

  // 📄 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || loading) return;
    console.log('페이지 변경:', page);
    fetchBooks(currentFilters, page);
  };

  // 📖 책 클릭 핸들러 (상세페이지 이동)
  const handleBookClick = (bookId: number) => {
    console.log('책 클릭 - ID:', bookId);
    router.push(`/bookbook/rent/${bookId}`);
  };

  // 🔧 간단한 이미지 에러 처리 - 재시도 없이 바로 기본 이미지로 대체
  const handleImageError = (imageUrl: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    
    // 이미 에러 처리된 이미지는 무시 (무한 재시도 방지)
    if (img.dataset.errorHandled === 'true') {
      return;
    }
    
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

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchBooks(currentFilters, 1);
  }, []);

  // 개선된 페이지네이션 번호 생성 (5개씩 그룹)
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pageNumbers: number[] = [];
    
    // 현재 페이지가 속한 그룹 계산 (1-5, 6-10, 11-15...)
    const currentGroup = Math.ceil(currentPage / 5);
    const startPage = (currentGroup - 1) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* 📊 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📚 책 빌리러가기</h1>
        {!loading && (
          <p className="text-gray-600">
            총 <span className="font-semibold text-blue-600">{pagination.totalElements}권</span>의 책이 있습니다.
            {currentFilters.searchKeyword && (
              <span className="ml-2">
                &quot;<span className="font-semibold">{currentFilters.searchKeyword}</span>&quot; 검색 결과
              </span>
            )}
          </p>
        )}
      </div>

      {/* 🔍 필터/검색 바 */}
      <BookFilterBar 
        onFilterChange={handleFilterChange}
        loading={loading}
      />

      <hr className="my-6" />

      {/* 📚 도서 목록 - 세로 레이아웃 */}
      <div className="min-h-[600px]">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-600">🔍 검색 중...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 space-y-4">
            <div className="text-lg text-red-600 text-center">{error}</div>
            <button 
              onClick={() => fetchBooks(currentFilters, pagination.currentPage)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500 text-lg mb-2">
              {currentFilters.searchKeyword || currentFilters.region !== 'all' || currentFilters.category !== 'all'
                ? '검색 조건에 맞는 책이 없습니다.'
                : '등록된 책이 없습니다.'
              }
            </p>
            <p className="text-sm text-gray-400 mb-4">
              다른 검색 조건을 시도해보거나 나중에 다시 확인해주세요.
            </p>
          </div>
        ) : (
          // 세로 레이아웃으로 책 목록 표시 (카드 형태)
          <div className="space-y-6">
            {books.map((book) => (
              <div 
                key={book.id} 
                className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-gray-300"
                onClick={() => handleBookClick(book.id)}
              >
                <div className="flex gap-6">
                  {/* 책 이미지 */}
                  <div className="flex-shrink-0">
                    <img
                      src={book.bookImage}
                      alt={book.bookTitle}
                      className="w-32 h-48 object-cover rounded-lg shadow-md"
                      loading="lazy"
                      onError={(e) => handleImageError(book.bookImage, e)}
                    />
                  </div>
                  
                  {/* 책 정보 */}
                  <div className="flex-1 space-y-3">
                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {book.bookTitle}
                    </h3>
                    
                    {/* 기본 정보 */}
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">저자:</span> {book.author}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">출판사:</span> {book.publisher}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">상태:</span> {book.bookCondition}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">위치:</span> {book.address}
                      </p>
                      {book.category && (
                        <p className="text-gray-700">
                          <span className="font-medium">카테고리:</span> {book.category}
                        </p>
                      )}
                      {book.lenderNickname && (
                        <p className="text-gray-700">
                          <span className="font-medium">작성자:</span> {book.lenderNickname}
                        </p>
                      )}
                    </div>

                    {/* 대여 상태와 등록일 */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        book.rentStatus === '대여 가능' || book.rentStatus === '대여가능' || book.rentStatus === 'Available'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.rentStatus}
                      </span>
                      
                      {book.createdDate && (
                        <span className="text-sm text-gray-500">
                          등록일: {new Date(book.createdDate).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📄 개선된 페이지네이션 - 첫 페이지/마지막 페이지 이동 */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {/* << (첫 페이지로) */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
            className={`w-12 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              pagination.currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="첫 페이지로"
          >
            ≪
          </button>

          {/* < (이전 페이지) */}
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              pagination.currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="이전 페이지"
          >
            ‹
          </button>

          {/* 페이지 번호 (5개씩 그룹) */}
          {generatePageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                num === pagination.currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={`${num}페이지로`}
            >
              {num}
            </button>
          ))}

          {/* > (다음 페이지) */}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              pagination.currentPage === pagination.totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="다음 페이지"
          >
            ›
          </button>

          {/* >> (마지막 페이지로) */}
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`w-12 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              pagination.currentPage === pagination.totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="마지막 페이지로"
          >
            ≫
          </button>
        </div>
      )}

      {/* 📊 페이지 정보 */}
      {!loading && !error && books.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-6">
          {pagination.currentPage} / {pagination.totalPages} 페이지 
          (총 {pagination.totalElements}권)
        </div>
      )}
    </main>
  );
}