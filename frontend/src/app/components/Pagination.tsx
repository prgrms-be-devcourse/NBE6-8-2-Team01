'use client';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-3 mt-10">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-xl px-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ◀
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index + 1}
                    onClick={() => onPageChange(index + 1)}
                    className={`w-8 h-8 rounded text-sm font-semibold ${
                        currentPage === index + 1
                            ? 'bg-black text-white'
                            : 'bg-white border'
                    }`}
                >
                    {index + 1}
                </button>
            ))}
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-xl px-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ▶
            </button>
        </div>
    );
}