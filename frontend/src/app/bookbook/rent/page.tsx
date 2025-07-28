'use client';

import React, { useState } from 'react';

type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  status: string;
  imageUrl: string;
};

export default function RentPage() {
  // ✅ 임시 더미 데이터
  const [books] = useState<Book[]>([
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
      author: '비욘 나티코 린데블라드',
      publisher: '다산초당',
      status: '중',
      imageUrl: '/book-sample-2.png',
    },
    {
      id: 3,
      title: '불편한 편의점',
      author: '김호연',
      publisher: '나무옆의자',
      status: '상',
      imageUrl: '/book-sample-3.png',
    },
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* 필터/검색 */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select className="border px-4 py-2 rounded">
          <option>행복시</option>
          <option>서울시</option>
          <option>부산시</option>
        </select>
        <select className="border px-4 py-2 rounded">
          <option>카테고리</option>
          <option>문학</option>
          <option>경제</option>
        </select>
        <input
          type="text"
          placeholder="검색어를 입력해주세요."
          className="border px-4 py-2 rounded w-120"
        />
        <button
          className="bg-[#D5BAA3] text-white px-4 py-2 rounded-md shadow hover:opacity-90 transition"
        >
          검색
        </button>
      </div>

      <hr className="my-6" />

      {/* 도서 목록 */}
      {books.length === 0 ? (
        <p className="text-gray-500 text-lg text-center mt-20">
          대여 가능한 도서가 없습니다.
        </p>
      ) : (
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
      )}

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-3 mt-10">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            className={`w-8 h-8 rounded text-sm font-semibold ${
              num === 1
                ? 'bg-black text-white'
                : 'bg-white border hover:bg-gray-100'
            }`}
          >
            {num}
          </button>
        ))}
        <button className="text-xl px-2">▶</button>
      </div>
    </main>
  );
}
