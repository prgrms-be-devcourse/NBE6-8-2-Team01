'use client';

import { useState, useEffect } from 'react';
import { Search, Book } from 'lucide-react';
import Pagination from '../../../components/Pagination';
import LendListCard from './LendListCard';
import ReviewModal from '../../../components/ReviewModal';
import { MyBook, PaginationInfo } from './types';
import { dummyLendListBooks } from './dummyData';

export default function LendListPage() {
  const [myBooks, setMyBooks] = useState<MyBook[]>([]);
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
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<MyBook | null>(null);

  const userId = 1; // TODO: 실제 로그인된 사용자 ID로 변경

  useEffect(() => {
    fetchMyBooks(currentPage);
  }, [currentPage]);

  const fetchMyBooks = async (page: number = 1) => {
    // 개발 모드에서는 더미 데이터를 사용
    if (isDevelopment) {
      setLoading(true);
      
      // 개발 모드에서 페이징 처리
      const pageSize = 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageData = dummyLendListBooks.slice(startIndex, endIndex);
      
      setMyBooks(pageData);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(dummyLendListBooks.length / pageSize),
        totalElements: dummyLendListBooks.length,
        size: pageSize
      });
      
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8080/api/v1/user/${userId}/lendlist?page=${page - 1}&size=${pagination.size}&sort=createAt,desc`,
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

      console.log('내가 등록한 도서 목록 API 호출:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          setMyBooks([]);
          setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('내가 등록한 도서 목록 API 응답:', data);

      if (data.content) {
        setMyBooks(data.content);
        setPagination({
          currentPage: data.number + 1,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          size: data.size
        });
      }
    } catch (err) {
      console.error('내가 등록한 도서 목록 조회 에러:', err);
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        console.log('백엔드 연결 실패 - 개발 모드로 전환');
        setIsDevelopment(true);
        
        // 개발 모드에서 페이징 처리
        const pageSize = 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = dummyLendListBooks.slice(startIndex, endIndex);
        
        setMyBooks(pageData);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(dummyLendListBooks.length / pageSize),
          totalElements: dummyLendListBooks.length,
          size: pageSize
        });
        setError(null); // 개발 모드에서는 에러 메시지를 숨김
      } else {
        setError('도서 목록을 불러오는데 실패했습니다.');
        setMyBooks([]);
        setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (rentId: number) => {
    if (!confirm('정말로 이 도서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/user/${userId}/lendlist/${rentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
        }
      );

      if (response.ok) {
        alert('도서가 성공적으로 삭제되었습니다.');
        fetchMyBooks(currentPage);
      } else {
        throw new Error('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('도서 삭제 에러:', err);
      alert('도서 삭제에 실패했습니다.');
    }
  };

  const writeReview = (rentId: number) => {
    const book = myBooks.find(b => b.id === rentId);
    if (book) {
      setSelectedBook(book);
      setIsReviewModalOpen(true);
    }
  };

  const submitReview = async (rentId: number, rating: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/user/${userId}/lendlist/${rentId}/review`,
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
      setMyBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === rentId 
            ? { ...book, hasReview: true }
            : book
        )
      );

      // 리뷰 완료 후 재등록 여부 확인
      const shouldReregister = confirm('책을 다시 등록하시겠습니까?');
      if (shouldReregister) {
        // 도서 수정페이지로 이동
        window.location.href = `/bookbook/lendlist/${rentId}/edit`;
      }
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      if (isDevelopment) {
        // 개발 모드에서는 성공한 것으로 처리
        console.log('개발 모드: 리뷰 등록 시뮬레이션');
        setMyBooks(prevBooks => 
          prevBooks.map(book => 
            book.id === rentId 
              ? { ...book, hasReview: true }
              : book
          )
        );

        // 개발 모드에서도 재등록 여부 확인
        const shouldReregister = confirm('책을 다시 등록하시겠습니까?');
        if (shouldReregister) {
          // 도서 수정페이지로 이동
          window.location.href = `/bookbook/lendlist/${rentId}/edit`;
        }
      } else {
        throw error;
      }
    }
  };

  // 검색 필터링
  const filteredBooks = myBooks.filter(book => {
    const searchLower = searchTerm.toLowerCase();
    return (
      book.bookTitle.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.publisher.toLowerCase().includes(searchLower) ||
      book.title.toLowerCase().includes(searchLower)
    );
  });

  // 현재 페이지에 표시할 아이템 계산 (개발 모드에서는 이미 페이징된 데이터를 사용)
  const currentPageBooks = isDevelopment ? filteredBooks : filteredBooks.slice((currentPage - 1) * pagination.size, currentPage * pagination.size);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 데이터를 다시 로드 (개발/프로덕션 모드 모두)
    fetchMyBooks(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">내가 등록한 도서</h1>
          <p className="text-gray-600">
            총 <span className="font-semibold text-blue-600">{pagination.totalElements}권</span>의 도서를 등록했습니다.
          </p>
          {isDevelopment && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ 개발 모드: 백엔드 서버에 연결할 수 없어 샘플 데이터를 표시하고 있습니다.
            </p>
          )}
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
              onClick={() => fetchMyBooks(currentPage)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {filteredBooks.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Book className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? '검색 결과가 없습니다.' : '아직 등록한 도서가 없습니다.'}
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm ? '다른 검색어를 사용해보세요.' : '첫 번째 도서를 등록해보세요!'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentPageBooks.map((book) => (
                <LendListCard
                  key={book.id}
                  book={book}
                  onDelete={deleteBook}
                  onReview={writeReview}
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
            onSubmit={submitReview}
          />
        )}
    </div>
  );
}