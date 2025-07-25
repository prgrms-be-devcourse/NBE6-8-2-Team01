'use client';

export default function Pagination() {
  return (
    <div className="flex justify-center items-center gap-3 mt-10">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          className={`w-8 h-8 rounded text-sm font-semibold ${
            num === 1 ? 'bg-black text-white' : 'bg-white border'
          }`}
        >
          {num}
        </button>
      ))}
      <button className="text-xl px-2">▶</button>
    </div>
  );
}
