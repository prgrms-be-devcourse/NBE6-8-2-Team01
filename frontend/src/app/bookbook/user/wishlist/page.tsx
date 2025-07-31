'use client';

import { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { WishListItem } from './types';
import { dummyWishList } from './dummyData';
import WishListCard from './WishListCard';
import Pagination from '../../../components/Pagination';

export default function WishListPage() {
    const [wishList, setWishList] = useState<WishListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalElements: 0,
        size: 10
    });
    const itemsPerPage = 10;
    const userId = 1; // TODO: 실제 로그인된 사용자 ID로 변경

    useEffect(() => {
        fetchWishList(currentPage);
    }, [currentPage]);

    const fetchWishList = async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/wishlist?page=${page - 1}&size=${itemsPerPage}&sort=createdDate,desc`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'include',
                }
            );

            console.log('찜 목록 API 호출:', response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    setWishList([]);
                    setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('찜 목록 API 응답:', data);

            if (data.content) {
                setWishList(data.content);
                setPagination({
                    currentPage: data.number + 1,
                    totalPages: data.totalPages,
                    totalElements: data.totalElements,
                    size: data.size
                });
            }
        } catch (err) {
            console.error('찜 목록 조회 에러:', err);
            
            // 백엔드 연동 실패 시 더미 데이터 사용
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = dummyWishList.slice(startIndex, endIndex);
            
            setWishList(pageData);
            setPagination({
                currentPage: page,
                totalPages: Math.ceil(dummyWishList.length / itemsPerPage),
                totalElements: dummyWishList.length,
                size: itemsPerPage
            });
            
            // 에러 메시지 표시 (개발 중임을 알림)
            setError('백엔드 서버에 연결할 수 없어 샘플 데이터를 표시하고 있습니다.');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishList = async (id: number) => {
        if (!confirm('정말로 찜 목록에서 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/wishlist/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('찜 목록에서 삭제에 실패했습니다.');
            }

            // 성공 후 데이터 다시 로드
            fetchWishList(currentPage);
            alert('찜 목록에서 성공적으로 삭제되었습니다.');
        } catch (err) {
            console.error('찜 목록 삭제 에러:', err);
            
            // 더미 데이터 사용 중일 때는 UI에서만 삭제
            if (error && error.includes('샘플 데이터')) {
                setWishList(wishList.filter(item => item.id !== id));
                alert('샘플 데이터에서 삭제되었습니다.');
            } else {
                alert('찜 목록에서 삭제에 실패했습니다.');
            }
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

    // 현재 페이지에 표시할 아이템 계산
    // 백엔드 연동 실패로 더미 데이터 사용 중일 때는 이미 페이징된 데이터를 사용
    const currentItems = error && error.includes('샘플 데이터') ? filteredWishList : filteredWishList;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchWishList(page);
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


    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">찜한 도서</h1>
                <p className="text-gray-600">
                    총 <span className="font-semibold text-blue-600">{pagination.totalElements}권</span>의 도서를 찜했습니다.
                </p>
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

            {error && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">오류!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button 
                        onClick={() => fetchWishList(currentPage)}
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {filteredWishList.length === 0 && !loading ? (
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

                    {/* 페이지네이션 */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                    </>
                )}
        </div>
    );
}