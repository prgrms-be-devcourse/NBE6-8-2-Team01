'use client';

// src/components/UserProfileModal.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// UserProfileModal 컴포넌트의 props 타입을 명확하게 정의합니다.
interface UserProfileModalProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

// 사용자 프로필 데이터를 위한 인터페이스
interface UserProfile {
    userId: number;
    nickname: string;
    mannerScore: number;
    mannerScoreCount: number;
}

// 책 데이터를 위한 인터페이스
interface Book {
    id: number;
    title: string;
    imageUrl: string;
    status: 'available' | 'borrowed';
}

// 모달 컴포넌트
const UserProfileModal = ({ userId, isOpen, onClose }: UserProfileModalProps) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || userId === null) {
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [profileResponse, booksResponse] = await Promise.all([
                    fetch(`/api/v1/bookbook/users/${userId}`),
                    fetch(`/api/v1/user/${userId}/lendlist`)
                ]);

                if (!profileResponse.ok) {
                    throw new Error('프로필 정보를 불러오는 데 실패했습니다.');
                }
                if (!booksResponse.ok) {
                    throw new Error('등록된 책 목록을 불러오는 데 실패했습니다.');
                }

                const profileData = await profileResponse.json();
                const booksData = await booksResponse.json();

                setUser({
                    userId: profileData.data.userId,
                    nickname: profileData.data.nickname,
                    mannerScore: profileData.data.mannerScore,
                    mannerScoreCount: profileData.data.mannerScoreCount
                });

                const fetchedBooks: Book[] = booksData.content.map((item: { id: number, bookTitle: string, bookImage: string, rentStatus: string }) => ({
                    id: item.id,
                    title: item.bookTitle,
                    imageUrl: item.bookImage || `https://placehold.co/100x150/e2e8f0/64748b?text=Book`,
                    status: item.rentStatus === 'LOANED' ? 'borrowed' : 'available',
                }));
                setBooks(fetchedBooks);

                // ⭐ 수정: 'any' 타입을 'Error'로 변경하여 ESLint 오류를 해결합니다.
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("알 수 없는 오류가 발생했습니다.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen, userId]);

    const renderStars = (ratingValue: number) => {
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>);
        }
        if (hasHalfStar) {
            stars.push(<span key="half" className="text-yellow-400 text-lg">½</span>);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
        }
        return stars;
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>

                <div className="text-center pb-4 mb-4 border-b border-gray-200 relative">
                    <h2 className="text-2xl font-bold text-gray-800">{user.nickname}</h2>
                    <div className="text-sm text-gray-600 mt-1">
            <span className="flex justify-center items-center gap-1">
              {renderStars(user.mannerScore)}
                <span className="text-gray-400 ml-2">{user.mannerScore.toFixed(1)} / 5.0</span>
            </span>
                        <span className="text-gray-400 text-xs">(총 {user.mannerScoreCount}명 참여)</span>
                    </div>
                    <button className="absolute bottom-4 right-0 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm hover:bg-red-600 transition-colors">
                        신고하기
                    </button>
                </div>

                <div className="pt-2">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">{user.nickname}님이 대여해주는 책들</h3>
                    {isLoading && <p className="text-center text-gray-500">로딩 중...</p>}
                    {error && <p className="text-center text-red-500">오류 발생: {error}</p>}
                    {!isLoading && !error && (
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                            {books.map((book) => (
                                <li key={book.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                    <Image src={book.imageUrl} alt="책 표지 이미지" width={70} height={100} className="object-cover rounded-md mr-4" />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{book.title}</p>
                                        {book.status === 'available' ? (
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block bg-blue-100 text-blue-800">대여 가능</span>
                                        ) : (
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block bg-pink-100 text-pink-800">대여 중</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!isLoading && !error && books.length === 0 && (
                        <p className="text-center text-gray-500">등록된 책이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
