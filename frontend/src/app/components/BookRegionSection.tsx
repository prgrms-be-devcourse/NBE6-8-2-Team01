'use client';

import React, { useState, useEffect } from 'react';

const dummyRegions = ['서울시', '부산시', '대구시', '광주시'];
const dummyBooks = [
  '/book-sample-1.png',
  '/book-sample-2.png',
  '/book-sample-3.png',
  '/book-sample-4.png',
  '/book-sample-5.png',
];

const BookRegionSection = () => {
  const [selectedRegion, setSelectedRegion] = useState('서울시');
  const [books, setBooks] = useState<string[]>([]);

  useEffect(() => {
    // ✅ 실제 API 연동 예시 (나중에 사용 예정)
    // fetch(`/api/books?region=${selectedRegion}`)
    //   .then((res) => res.json())
    //   .then((data) => setBooks(data.books));

    // 🔧 지금은 예시 이미지만 사용
    setBooks(dummyBooks);
  }, [selectedRegion]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-12 mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          추천 도서
        </h2>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          {dummyRegions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {books.map((src, index) => (
          <div key={index} className="w-full h-[200px] relative overflow-hidden rounded-md shadow-md">
            <img
              src={src}
              alt={`추천 도서 ${index + 1}`}
              className="w-full h-full object-contain p-2"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BookRegionSection;
