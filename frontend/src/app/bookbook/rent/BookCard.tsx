'use client';

type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  status: string;
  imageUrl: string;
};

export default function BookCard({ book }: { book: Book }) {
  return (
    <div className="flex gap-4 border rounded-md p-4 shadow bg-white">
      <img src={book.imageUrl} alt={book.title} className="w-28 h-40 object-cover rounded" />
      <div>
        <h3 className="text-lg font-bold">{book.title}</h3>
        <p className="text-sm">저자: {book.author}</p>
        <p className="text-sm">출판: {book.publisher}</p>
        <p className="text-sm">상태: {book.status}</p>
      </div>
    </div>
  );
}
