'use client';

export default function BookFilterBar() {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <select className="border px-4 py-2 rounded">
        <option>행복시</option>
        <option>서울시</option>
        <option>부산시</option>
      </select>
      <select className="border px-4 py-2 rounded">
        <option>카테고리</option>
        <option>문학</option>
        <option>과학</option>
      </select>
      <input
        type="text"
        placeholder="검색어를 입력해주세요."
        className="border px-4 py-2 rounded w-60"
      />
      <button
        className="bg-[#D5BAA3] text-white px-4 py-2 rounded-md shadow hover:opacity-90 transition"
      >
        검색
      </button>
    </div>
  );
}
