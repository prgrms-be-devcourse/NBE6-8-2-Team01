'use client';

import { Trash2 } from 'lucide-react';
import { MyBook } from './types';

interface LendListCardProps {
  book: MyBook;
  onDelete: (id: number) => void;
  onReview?: (id: number) => void;
  formatDate: (date: string) => string;
}

export default function LendListCard({ book, onDelete, onReview, formatDate }: LendListCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {/* 책 이미지 */}
        <div className="flex-shrink-0">
          <img
            src={book.bookImage}
            alt={book.bookTitle}
            className="w-20 h-[120px] rounded-md object-cover"
            onError={(e) => {
              e.currentTarget.src = '/book-placeholder.png';
            }}
          />
        </div>

        {/* 책 정보 */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
              <h4 className="text-md text-gray-800 mb-1">도서명: {book.bookTitle}</h4>
              <p className="text-gray-600 text-sm mb-1">저자: {book.author}</p>
              <p className="text-gray-600 text-sm mb-1">출판사: {book.publisher}</p>
              <p className="text-gray-600 text-sm mb-2">책 상태: {book.bookCondition}</p>
              <p className="text-gray-600 text-sm mb-1">위치: {book.address}</p>
              
              <div className="text-sm flex items-center gap-2">
                <span className={`font-medium ${
                  book.rentStatus === '대여가능' || book.rentStatus === 'Available' ? 'text-green-600' : 
                  book.rentStatus === '대여중' || book.rentStatus === 'loaned' ? 'text-orange-600' : 
                  book.rentStatus === 'finished' || book.rentStatus === '완료' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {book.rentStatus === 'finished' ? '대여완료' : book.rentStatus}
                </span>
                {(book.rentStatus === '대여중' || book.rentStatus === 'loaned') && book.returnDate && (
                  <span className="text-red-600">
                    (반납예정: {formatDate(book.returnDate)})
                  </span>
                )}
                {book.rentStatus === 'finished' && (
                  book.hasReview ? (
                    <span className="px-3 py-1 text-xs bg-gray-400 text-white rounded cursor-not-allowed">
                      리뷰완료
                    </span>
                  ) : onReview ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onReview(book.id);
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      리뷰쓰기
                    </button>
                  ) : null
                )}
              </div>
            </div>
            {book.rentStatus !== '대여중' && book.rentStatus !== 'loaned' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(book.id);
                }}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="삭제"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}