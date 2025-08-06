'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface Book {
  id?: number;
  rentId?: number;
  bookTitle: string;
  title: string;
  author: string;
  publisher: string;
  bookImage?: string;
}

interface ReviewTarget {
  userId: number;
  nickname: string;
  rating?: number;
  reviewType: 'LENDER_TO_BORROWER' | 'BORROWER_TO_LENDER';
  description: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  target: ReviewTarget;
  onSubmit: (id: number, rating: number) => Promise<void>;
}

export default function ReviewModal({ isOpen, onClose, book, target, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('평점을 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const id = book.rentId || book.id || 0;
      await onSubmit(id, rating);
      alert('리뷰가 성공적으로 등록되었습니다.');
      onClose();
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">사용자 리뷰 작성</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 리뷰 대상자 정보 */}
        <div className="mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {target.nickname}님
              </h3>
              {target.rating && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{target.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              {target.description}
            </p>
          </div>
        </div>

        {/* 도서 정보 */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex gap-3">
              <img
                src={book.bookImage || "/book-placeholder.png"}
                alt={book.bookTitle}
                className="w-10 h-12 object-cover rounded border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/book-placeholder.png";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">관련 도서</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {book.bookTitle}
                </p>
                <p className="text-xs text-gray-600">
                  {book.author} · {book.publisher}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              평점을 선택해주세요 (1-5점)
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStarClick(value)}
                  onMouseEnter={() => handleStarHover(value)}
                  onMouseLeave={handleStarLeave}
                  className="p-1 hover:scale-110 transition-transform"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating}점 선택됨
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '리뷰 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}