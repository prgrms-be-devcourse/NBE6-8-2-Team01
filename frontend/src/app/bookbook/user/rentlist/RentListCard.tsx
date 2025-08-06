'use client';

import { Clock, MapPin, User } from 'lucide-react';
import { RentedBook } from './types';

interface RentListCardProps {
  book: RentedBook;
  onReview?: (rentId: number) => void;
  onReturn?: (rentId: number) => void;
  formatDate: (dateString: string) => string;
}

export default function RentListCard({ book, onReview, onReturn, formatDate }: RentListCardProps) {
  // 이미지 URL 처리
  const backendBaseUrl = 'http://localhost:8080';
  const defaultCoverImageUrl = 'https://i.postimg.cc/pLC9D2vW/noimg.gif';
  const displayImageUrl = book.bookImage
    ? (book.bookImage.startsWith('http') ? book.bookImage : `${backendBaseUrl}${book.bookImage}`)
    : defaultCoverImageUrl;

  // 실제 대여 상태 계산 (RentList 상태 기반)
  const calculateRentStatus = () => {
    // rentStatus가 없으면 기본값 처리
    if (!book.rentStatus) {
      return 'UNKNOWN';
    }
    
    // RentList 상태가 FINISHED면 반납 완료
    if (book.rentStatus === 'FINISHED') {
      return 'FINISHED';
    }
    
    // APPROVED 상태인 경우, 날짜 기준으로 추가 판단
    if (book.rentStatus === 'APPROVED') {
      const now = new Date();
      const returnDate = new Date(book.returnDate);
      
      if (now <= returnDate) {
        return 'LOANED'; // 대여중
      } else {
        return 'OVERDUE'; // 연체 (반납일 지남)
      }
    }
    
    // 기타 상태 (PENDING, REJECTED)
    return book.rentStatus;
  };

  const actualStatus = calculateRentStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'LOANED':
        return 'bg-blue-100 text-blue-800';
      case 'FINISHED':
        return 'bg-gray-100 text-gray-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNKNOWN':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'APPROVED':
        return '수락됨';
      case 'LOANED':
        return '대여중';
      case 'FINISHED':
        return '대여완료';
      case 'OVERDUE':
        return '연체중';
      case 'REJECTED':
        return '거절됨';
      case 'UNKNOWN':
        return '상태불명';
      default:
        return status;
    }
  };

  const handleCardClick = () => {
    // 상세페이지로 이동
    window.location.href = `/bookbook/rent/${book.rentId}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <div className="flex gap-4">
        {/* 책 이미지 */}
        <div className="flex-shrink-0">
          <img
            src={displayImageUrl}
            alt={book.bookTitle}
            className="w-20 h-28 object-cover rounded border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultCoverImageUrl;
            }}
          />
        </div>

        {/* 책 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {book.title}
              </h3>
              <div className="space-y-2">
                <p className="text-base font-medium text-gray-800">
                  {book.bookTitle}
                </p>
                <p className="text-sm text-gray-600">저자: {book.author}</p>
                <p className="text-sm text-gray-600">출판사: {book.publisher}</p>
                <p className="text-sm text-gray-600">상태: {book.bookCondition}</p>
              </div>
            </div>

          </div>

          {/* 추가 정보 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{book.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>책방지기: {book.lenderNickname || book.lenderUserId || '알 수 없음'}</span>
            </div>
          </div>
          
          {/* 대여 기간 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>대여일: {formatDate(book.loanDate)}</span>
            </div>
            <div className={`flex items-center gap-1 ${
              actualStatus === 'LOANED' 
                ? 'px-3 py-1 bg-red-50 border border-red-200 rounded-lg' 
                : ''
            }`}>
              <Clock className={`h-4 w-4 ${actualStatus === 'LOANED' ? 'text-red-500' : ''}`} />
              <span className={actualStatus === 'LOANED' ? 'font-semibold text-red-700' : ''}>
                반납일: {formatDate(book.returnDate)}
              </span>
            </div>
          </div>

          {/* 상태 및 리뷰 버튼 */}
          <div className="flex items-center gap-2 mt-4 mb-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(actualStatus)}`}>
              {getStatusText(actualStatus)}
            </span>
            {/* 반납하기 버튼 - 대여중이거나 연체중일 때만 표시 */}
            {(actualStatus === 'LOANED' || actualStatus === 'OVERDUE') && onReturn && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReturn(book.rentId);
                }}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                반납하기
              </button>
            )}
            
            {/* 리뷰 버튼 - 대여완료일 때만 표시 */}
            {actualStatus === 'FINISHED' && (
              book.hasReview ? (
                <span className="px-3 py-1 text-xs bg-gray-400 text-white rounded">
                  리뷰완료
                </span>
              ) : onReview ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onReview(book.rentId);
                  }}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  리뷰쓰기
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}