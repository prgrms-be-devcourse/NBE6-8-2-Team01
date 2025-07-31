'use client';

import { Trash2, MapPin, User, Clock } from 'lucide-react';
import { MyBook } from './types';

interface LendListCardProps {
  book: MyBook;
  onDelete: (id: number) => void;
  onReview?: (id: number) => void;
  formatDate: (date: string) => string;
}

export default function LendListCard({ book, onDelete, onReview, formatDate }: LendListCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Loaned':
        return 'bg-blue-100 text-blue-800';
      case 'Finished':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Available':
        return '대여가능';
      case 'Loaned':
        return '대여중';
      case 'Finished':
        return '대여완료';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {/* 책 이미지 */}
        <div className="flex-shrink-0">
          <img
            src={book.bookImage || "/book-placeholder.png"}
            alt={book.bookTitle}
            className="w-20 h-28 object-cover rounded border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/book-placeholder.png";
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
              <p className="text-base font-medium text-gray-800 mb-1">
                {book.bookTitle}
              </p>
              <p className="text-sm text-gray-600">저자: {book.author}</p>
              <p className="text-sm text-gray-600">출판사: {book.publisher}</p>
              <p className="text-sm text-gray-600 mb-2">상태: {book.bookCondition}</p>
            </div>

            {/* 삭제 버튼 */}
            <div className="flex items-center gap-2 ml-4">
              {book.rentStatus !== 'Loaned' && (
                <button 
                  onClick={() => onDelete(book.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{book.address}</span>
            </div>
            {(book.rentStatus === 'Loaned' || book.rentStatus === 'Finished') && book.borrowerNickname && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>책방손님: {book.borrowerNickname}</span>
              </div>
            )}
          </div>

          {/* 대여 기간 */}
          {(book.rentStatus === 'Loaned' || book.rentStatus === 'Finished') && book.returnDate && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>대여일: {formatDate(book.createdDate)}</span>
              </div>
              <div className={`flex items-center gap-1 ${
                book.rentStatus === 'Loaned' 
                  ? 'px-3 py-1 bg-red-50 border border-red-200 rounded-lg' 
                  : ''
              }`}>
                <Clock className={`h-4 w-4 ${book.rentStatus === 'Loaned' ? 'text-red-500' : ''}`} />
                <span className={book.rentStatus === 'Loaned' ? 'font-semibold text-red-700' : ''}>
                  {book.rentStatus === 'Loaned' ? '반납예정' : '반납일'}: {formatDate(book.returnDate)}
                </span>
              </div>
            </div>
          )}

          {/* 상태 및 리뷰 버튼 */}
          <div className="flex items-center gap-2 mt-4 mb-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(book.rentStatus || '')}`}>
              {getStatusText(book.rentStatus || '')}
            </span>
            {book.rentStatus === 'Finished' && (
              book.hasReview ? (
                <span className="px-3 py-1 text-xs bg-gray-400 text-white rounded">
                  리뷰완료
                </span>
              ) : onReview ? (
                <button 
                  onClick={() => onReview(book.id)}
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