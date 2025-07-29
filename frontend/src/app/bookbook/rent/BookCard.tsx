'use client';

import { useState } from 'react';

// ✅ 백엔드 Rent 엔티티에 맞춘 Book 타입
type Book = {
  id: number;
  bookTitle: string;       // 실제 책 제목 (Rent.bookTitle)
  author: string;          // 저자 (Rent.author)
  publisher: string;       // 출판사 (Rent.publisher)
  bookCondition: string;   // 책 상태 (Rent.bookCondition) - 상, 중, 하
  bookImage: string;       // 책 이미지 (Rent.bookImage)
  address: string;         // 위치 정보 (Rent.address)
  category: string;        // 카테고리 (Rent.category)
  rentStatus: string;      // 대여 상태 (Rent.rent_status) - 대여가능, 대여중
  lenderUserId: number;    // 책 소유자 ID (Rent.lender_user_id)
  title?: string;          // 대여글 제목 (Rent.title) - 카드에서는 표시 안함
  contents?: string;       // 대여 설명 (Rent.contents) - 카드에서는 표시 안함
};

interface BookCardProps {
  book: Book;
  onRentRequest?: (bookId: number) => void;
}

export default function BookCard({ book, onRentRequest }: BookCardProps) {
  const handleRentRequest = () => {
    if (!onRentRequest) return;
    onRentRequest(book.id);
  };

  const isAvailable = book.rentStatus === '대여가능' || book.rentStatus === 'Available';

  return (
    <div className="border rounded-lg p-4 shadow bg-white hover:shadow-md transition-shadow">
      {/* 책 이미지 - 큰 사이즈로 중앙 배치 */}
      <div className="flex justify-center mb-4">
        <img 
          src={book.bookImage} 
          alt={book.bookTitle} 
          className="w-32 h-48 object-cover rounded-md shadow-sm"
          onError={(e) => {
            e.currentTarget.src = '/book-placeholder.png';
          }}
        />
      </div>
      
      {/* 책 정보 - 중앙 정렬 */}
      <div className="text-center space-y-2">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-3">
          {book.bookTitle}
        </h3>
        <p className="text-sm text-gray-600">저자: {book.author}</p>
        <p className="text-sm text-gray-600">출판: {book.publisher}</p>
        <p className="text-sm text-gray-600">상태: {book.bookCondition}</p>
        
        {/* 대여 상태와 버튼 */}
        <div className="pt-3 space-y-3">
          <div className="flex justify-center">
            <span 
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {book.rentStatus}
            </span>
          </div>
          
          {isAvailable && onRentRequest && (
            <button
              onClick={handleRentRequest}
              className="w-full px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              빌리기 신청
            </button>
          )}
        </div>
      </div>
    </div>
  );
}