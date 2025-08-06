'use client';

import { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { WishListItem } from './types';
import WishListCard from './WishListCard';
import Pagination from '../../../components/Pagination';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

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
    const { userId, loading: userLoading, error: userError } = useCurrentUser();

    useEffect(() => {
        if (userId) {
            fetchWishList(currentPage);
        }
    }, [currentPage, userId]);

    useEffect(() => {
        if (!userId) return;
        
        console.log('검색어 변경됨:', searchTerm);
        const timer = setTimeout(() => {
            console.log('디바운싱 완료, API 호출 시작');
            if (currentPage === 1) {
                fetchWishList(1, searchTerm);
            } else {
                setCurrentPage(1);
            }
        }, 1500); // 1500ms 후에 검색 실행
        return () => clearTimeout(timer);
    }, [searchTerm, userId]);


    const fetchWishList = async (page: number = 1, search?: string) => {
        try {
            setLoading(true);
            setError(null);

            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/wishlist?page=${page - 1}&size=${itemsPerPage}&sort=createdDate,desc`;
            if (search && search.trim()) {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }

            const response = await fetch(
                url,
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
                    setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1, totalElements: 0 }));
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const response_data = await response.json();
            console.log('찜 목록 API 응답:', response_data);

            // RsData 형식에 맞게 data 추출
            const data = response_data.data;

            if (Array.isArray(data)) {
                setWishList(data);
                setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1, totalElements: data.length }));
            } else if (data?.content) {
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
            setError(`찜 목록을 불러오는데 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
            setWishList([]);
            setPagination(prev => ({ ...prev, currentPage: page, totalPages: 1, totalElements: 0 }));
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
            alert('찜 목록에서 삭제에 실패했습니다.');
        }
    };

    // 서버에서 이미 필터링된 데이터이므로 클라이언트 필터링 제거
    const currentItems = wishList;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchWishList(page);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    if (userLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (userError || !userId) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                        {userError || '로그인이 필요합니다.'}
                    </p>
                    <button 
                        onClick={() => window.location.href = '/bookbook'}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        홈으로 이동
                    </button>
                </div>
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

            {wishList.length === 0 && !loading ? (
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