'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { MyBook } from './types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: MyBook;
  onSubmit: (rentId: number, rating: number) => Promise<void>;
}

export default function ReviewModal({ isOpen, onClose, book, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
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
      await onSubmit(book.id, rating);
      setRating(0);
      setHoverRating(0);
      onClose();
      alert('리뷰가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      alert('리뷰 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoverRating(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">리뷰 작성</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 도서 정보 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-3">
            <img
              src={book.bookImage}
              alt={book.bookTitle}
              className="w-16 h-20 object-cover rounded"
              onError={(e) => {
                e.currentTarget.src = '/book-placeholder.png';
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{book.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{book.bookTitle}</p>
              <p className="text-xs text-gray-500 mt-1">
                {book.author} · {book.publisher}
              </p>
            </div>
          </div>
        </div>

        {/* 평점 선택 */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              대여자에게 평점을 주세요 (1-5점)
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              선택된 평점: {rating}점 
              {rating > 0 && (
                <span className="ml-2">
                  {rating === 1 && '매우 불만족'}
                  {rating === 2 && '불만족'}
                  {rating === 3 && '보통'}
                  {rating === 4 && '만족'}
                  {rating === 5 && '매우 만족'}
                </span>
              )}
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '등록 중...' : '리뷰 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}