'use client';

import React from 'react';

// ✅ Book 타입 정의
type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  status: string;
  imageUrl: string;
};

// ✅ 임시 더미 데이터
const books: Book[] = [
  {
    id: 1,
    title: '작별하지 않는다',
    author: '한강',
    publisher: '문학동네',
    status: '상',
    imageUrl: '/book-sample-1.png',
  },
  {
    id: 2,
    title: '내가 틀릴 수도 있습니다',
    author: '한강',
    publisher: '문학동네',
    status: '상',
    imageUrl: '/book-sample-2.png',
  },
  {
    id: 3,
    title: '건너가는 자',
    author: '한강',
    publisher: '문학동네',
    status: '상',
    imageUrl: '/book-sample-3.png',
  },
];

export default function BookCardList() {
  if (books.length === 0) {
    return (
      <p className="text-center text-gray-500 text-lg mt-20">
        대여 가능한 도서가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {books.map((book) => (
        <div
          key={book.id}
          className="flex gap-4 border rounded-md p-4 shadow bg-white"
        >
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-28 h-40 object-cover rounded"
          />
          <div>
            <h3 className="text-lg font-bold mb-1">{book.title}</h3>
            <p className="text-sm">저자: {book.author}</p>
            <p className="text-sm">출판: {book.publisher}</p>
            <p className="text-sm">상태: {book.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
