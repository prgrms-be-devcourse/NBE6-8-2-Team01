'use client';

import { useState, useEffect } from 'react';
import { Search, Book } from 'lucide-react';
import Pagination from '../../../components/Pagination';
import RentListCard from './RentListCard';
import ReviewModal from '../../../components/ReviewModal';
import { RentedBook, PaginationInfo } from './types';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

export default function RentListPage() {
  const [rentedBooks, setRentedBooks] = useState<RentedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    size: 10
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<RentedBook | null>(null);

  const { userId, loading: userLoading, error: userError } = useCurrentUser();

  useEffect(() => {
    if (userId) {
      fetchRentedBooks(currentPage);
    }
  }, [currentPage, userId]);

  useEffect(() => {
    if (!userId) return;
    
    console.log('검색어 변경됨:', searchTerm);
    const timer = setTimeout(() => {
      console.log('디바운싱 완료, API 호출 시작');
      if (currentPage === 1) {
        fetchRentedBooks(1, searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 1500); // 1500ms 후에 검색 실행
    return () => clearTimeout(timer);
  }, [searchTerm, userId]);


  const fetchRentedBooks = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/rentlist?page=${page - 1}&size=${pagination.size}&sort=createdDate,desc`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
        }
      );


      if (!response.ok) {
        if (response.status === 404) {
          setRentedBooks([]);
          setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1, totalElements: 0 }));
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const response_data = await response.json();
      
      // RsData 형식에 맞게 data 추출
      const data = response_data.data;

      if (Array.isArray(data)) {
        setRentedBooks(data);
        setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1, totalElements: data.length }));
      } else if (data?.content) {
        setRentedBooks(data.content);
        setPagination({
          currentPage: data.number + 1,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          size: data.size
        });
      }
    } catch (err) {
      console.error('빌린 도서 목록 조회 에러:', err);
      setError(`도서 목록을 불러오는데 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      setRentedBooks([]);
      setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const writeReview = (rentId: number) => {
    const book = rentedBooks.find(b => b.rentId === rentId);
    if (book) {
      setSelectedBook(book);
      setIsReviewModalOpen(true);
    }
  };

  // 리뷰 대상자 정보 생성 (대여받은 사람이 대여자를 평가)
  const getReviewTarget = (book: RentedBook) => {
    return {
      userId: 0, // 실제로는 lenderUserId를 받아와야 함
      nickname: book.lenderNickname || '대여자',
      rating: undefined, // 실제로는 lender의 평점을 받아와야 함
      reviewType: 'BORROWER_TO_LENDER' as const,
      description: '이 사용자를 평가해주세요'
    };
  };

  const submitReview = async (rentId: number, rating: number) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/rentlist/${rentId}/review`;
      console.log('리뷰 API 호출 URL:', apiUrl);
      console.log('Request body:', { rating });
      
      const response = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating }),
          mode: 'cors',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('리뷰 등록 성공:', data);
      
      // 성공 후 해당 도서의 리뷰 상태 업데이트
      setRentedBooks(prevBooks => 
        prevBooks.map(book => 
          book.rentId === rentId 
            ? { ...book, hasReview: true }
            : book
        )
      );
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      throw error;
    }
  };

  const returnBook = async (rentId: number) => {
    if (!confirm('정말로 반납하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/rentlist/${rentId}/return`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '반납에 실패했습니다.');
      }

      const data = await response.json();
      
      // 성공 후 목록 새로고침
      fetchRentedBooks(currentPage);
      alert('도서가 성공적으로 반납되었습니다.');
    } catch (error: unknown) {
      console.error('반납 실패:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('반납에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 서버에서 이미 필터링된 데이터이므로 클라이언트 필터링 제거
  const currentPageBooks = rentedBooks;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRentedBooks(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (userError || !userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Book className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {userError || '로그인이 필요합니다.'}
          </p>
          <button 
            onClick={() => window.location.href = '/bookbook'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">빌린 도서 목록</h1>
          <p className="text-gray-600">
            총 <span className="font-semibold text-blue-600">{pagination.totalElements}권</span>의 도서를 빌렸습니다.
          </p>
        </div>

        {/* 검색 입력 필드 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="도서명, 저자, 출판사, 제목으로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">오류!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={() => fetchRentedBooks(currentPage)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {rentedBooks.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Book className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? '검색 결과가 없습니다.' : '아직 빌린 도서가 없습니다.'}
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm ? '다른 검색어를 사용해보세요.' : '첫 번째 도서를 빌려보세요!'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentPageBooks.map((book) => (
                <RentListCard
                  key={book.id}
                  book={book}
                  onReview={writeReview}
                  onReturn={returnBook}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* 리뷰 작성 모달 */}
        {selectedBook && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
              setIsReviewModalOpen(false);
              setSelectedBook(null);
            }}
            book={selectedBook}
            target={getReviewTarget(selectedBook)}
            onSubmit={submitReview}
          />
        )}
    </div>
  );
}