'use client';

import { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { WishListItem } from './types';
import { dummyWishList } from './dummyData';
import WishListCard from './WishListCard';
import Pagination from '../../../components/Pagination';

export default function WishListPage() {
    const [wishList, setWishList] = useState<WishListItem[]>(dummyWishList);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDevelopment] = useState(true); // 개발 모드 상태
    const itemsPerPage = 10;
    const userId = 1; // TODO: 실제 로그인된 사용자 ID로 변경

    useEffect(() => {
        // 더미 데이터 사용으로 실제 API 호출은 주석 처리
        // fetchWishList();
    }, []);

    const fetchWishList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/bookbook/user/wishList?userId=${userId}`);
            
            if (!response.ok) {
                throw new Error('찜 목록을 불러오는데 실패했습니다.');
            }
            
            const data = await response.json();
            setWishList(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishList = (id: number) => {
        setWishList(wishList.filter(item => item.id !== id));
        
        // 현재 페이지의 아이템이 모두 삭제되면 이전 페이지로 이동
        const newTotalPages = Math.ceil((wishList.length - 1) / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        }
    };

    // 검색 필터링
    const filteredWishList = wishList.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.bookTitle.toLowerCase().includes(searchLower) ||
            item.bookAuthor.toLowerCase().includes(searchLower) ||
            item.bookPublisher.toLowerCase().includes(searchLower)
        );
    });

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredWishList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredWishList.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">오류!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">찜한 도서</h1>
                <p className="text-gray-600">
                    총 <span className="font-semibold text-blue-600">{wishList.length}권</span>의 도서를 찜했습니다.
                </p>
                {isDevelopment && (
                    <p className="text-sm text-amber-600 mt-2">
                        ⚠️ 개발 모드: 백엔드 서버에 연결할 수 없어 샘플 데이터를 표시하고 있습니다.
                    </p>
                )}
            </div>
            

            {/* 검색 입력 필드 */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="도서명, 저자, 출판사로 검색"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {filteredWishList.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                        {searchTerm ? '검색 결과가 없습니다.' : '아직 찜한 도서가 없습니다.'}
                    </p>
                    <p className="text-gray-400 mt-2">
                        {searchTerm ? '다른 검색어를 사용해보세요.' : '마음에 드는 도서를 찜해보세요!'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {currentItems.map((item) => (
                            <WishListCard
                                key={item.id}
                                item={item}
                                onRemove={removeFromWishList}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                    </>
                )}
        </div>
    );
}