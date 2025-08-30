// src/app/bookbook/rent/[id]/page.tsx
// 글 상세를 보여주는 페이지
//08.06 현준 수정

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter는 클라이언트 컴포넌트에서 사용
import { useAuthCheck } from '../../../hooks/useAuthCheck'; // 로그인 체크만 하는 훅 사용
import RentModal from '@/app/components/RentModal'; // 대여하기 팝업 모달 컴포넌트
import UserProfileModal from "@/app/components/UserProfileModal";

// 백엔드에서 받아올 책 상세 정보의 타입을 정의합니다.
interface BookDetail {
    id: number; // 글 ID
    bookCondition: string; // 책 상태
    address: string; // 거래 희망 지역
    contents: string; // 글 내용 (사용자가 직접 작성한 내용)
    bookImage: string; // 책 이미지 URL (DB에 저장된 경로)
    rentStatus: 'AVAILABLE' | 'RENTED' | 'EXPIRED'; // 대여 상태
    createdAt: string; // 등록일 (예: 2025/07/22)
    lenderUserId: number; // 글 작성자 ID (백엔드 RentResponseDto에서 받아옴)

    title: string; // 글 제목
    bookTitle: string; // 책 제목
    author: string; // 저자
    publisher: string; // 출판사
    category: string; // 카테고리
    description: string; // 책 설명 (알라딘 API에서 가져온 상세 설명)

    // 대여자 정보 추가
    nickname: string; // 대여자 닉네임
    rating: number; // 대여자 매너 점수
    lenderPostCount: number; // 대여자가 작성한 글 갯수

    // 찜 상태 정보 추가
    isWishlisted: boolean; // 현재 사용자의 찜 상태
}

// 채팅방 응답 타입
interface ChatRoomResponse {
    roomId: string;
    bookTitle: string;
    otherUserNickname: string;
}

// API 응답 타입
interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

// Props 타입 정의
interface BookDetailPageProps {
    params: Promise<{ id: string }>;
}

// 새로운 타입 정의 : 현재 유저 정보
interface CurrentUserDto {
    userId: number;
    userStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export default function BookDetailPage({ params }: BookDetailPageProps): React.JSX.Element | null {
    // Next.js 동적 라우팅으로 URL에서 'id' 값을 가져옴
    const { id } = React.use(params);

    const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isRentModalOpen, setIsRentModalOpen] = useState<boolean>(false);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
    const [selectedLenderId, setSelectedLenderId] = useState<number | null>(null);

    // 찜하기 상태 관리
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
    const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter(); // 페이지 이동을 위한 useRouter 훅

    // 현재 로그인한 사용자 정보를 가져옵니다 (자동 로그인 없음)
    const { user, loading: userLoading, userId, isAuthenticated } = useAuthCheck();

    useEffect(() => {
        // 약간의 지연을 두어 하이드레이션이 완료된 후 렌더링
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // 컴포넌트가 마운트되거나 ID가 변경될 때 책 상세 정보를 불러옵니다.
    useEffect(() => {
        if (!mounted) return;
        
        // userStatus를 확인하는 별도의 비동기 함수
        const checkUserStatus = async () => {
            try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/status`, {
                method: "GET",
                credentials: "include",
            });
    
            if (res.ok) {
                const responseData = await res.json();
                const currentUser: CurrentUserDto = responseData.data;
    
                if (currentUser.userStatus === 'SUSPENDED') {
                alert('정지된 회원입니다.');
                router.push(`/bookbook`);
                }
            } else if (res.status === 401) {
                alert('로그인이 필요합니다.');
                router.push('/login');
            }
            } catch (error) {
            console.error("유저 상태 확인 중 오류 발생:", error);
            alert('유저 정보를 가져오는 중 오류가 발생했습니다.');
            router.push('/');
            }
        };
  
        checkUserStatus();

        const fetchBookDetail = async (): Promise<void> => {
            if (!id) return; // ID가 없으면 API 호출하지 않음

            setLoading(true);
            setError(null);

            try {
                // 백엔드 API (예: GET /bookbook/rent/{id})를 호출하여 책 상세 정보를 가져옵니다.
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookbook/rent/${id}`);

                if (!response.ok) {
                    // HTTP 에러가 발생한 경우
                    const errorData = await response.text();
                    throw new Error(`Failed to fetch book details: ${response.status} ${response.statusText} - ${errorData}`);
                }

                const data: BookDetail = await response.json();
                setBookDetail(data);

                // 찜 상태 초기화
                setIsWishlisted(data.isWishlisted || false);
            } catch (err: unknown) {
                console.error("책 상세 정보 불러오기 실패:", err);
                const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
                setError(`책 정보를 불러오는 데 실패했습니다: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetail();
    }, [id, router, mounted]); // mounted 의존성 추가

    // 서버 사이드 렌더링 중에는 아무것도 렌더링하지 않음
    if (!mounted) {
        return null;
    }

    const handleOpenProfileModal = (): void => {
        if (bookDetail?.lenderUserId) {
            setSelectedLenderId(bookDetail.lenderUserId);
            setIsProfileModalOpen(true);
        }
    };

    const handleCloseProfileModal = (): void => {
        setIsProfileModalOpen(false);
        setSelectedLenderId(null);
    };

    // 북북톡 버튼 클릭 핸들러 - 채팅방 생성 후 채팅 페이지로 이동 (디버깅 로그 추가)
    const handleChatClick = async (): Promise<void> => {
        if (!bookDetail) {
            console.error('❌ bookDetail이 없습니다');
            alert('책 정보를 불러오지 못했습니다.');
            return;
        }

        console.log('🚀 채팅방 생성 시작');
        console.log('📊 현재 상태 정보:', {
            rentId: bookDetail.id,
            lenderId: bookDetail.lenderUserId,
            currentUserId: userId,
            isAuthenticated: isAuthenticated,
            user: user ? user.nickname || user.email : null,
            bookTitle: bookDetail.bookTitle,
            apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
        });

        try {
            const requestBody = {
                rentId: bookDetail.id,
                lenderId: bookDetail.lenderUserId || 1
            };

            console.log('📤 API 요청 데이터:', requestBody);
            console.log('📤 요청 URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/rooms`);

            // 채팅방 생성 API 호출
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/rooms`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 응답 상태:', response.status, response.statusText);
            console.log('📥 응답 헤더:', Object.fromEntries(response.headers.entries()));

            // 응답 본문을 텍스트로 먼저 받기
            const responseText = await response.text();
            console.log('📥 응답 본문 (원본):', responseText);

            if (!response.ok) {
                console.error('❌ HTTP 에러 발생');
                
                let errorMessage = '채팅방 생성에 실패했습니다.';
                
                // 응답이 있으면 파싱 시도
                if (responseText && responseText.trim()) {
                    try {
                        const errorData = JSON.parse(responseText);
                        console.error('❌ 파싱된 에러 데이터:', errorData);
                        
                        // 백엔드 에러 메시지 추출
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData.msg) {
                            errorMessage = errorData.msg;
                        } else if (errorData.error) {
                            errorMessage = errorData.error;
                        } else if (typeof errorData === 'string') {
                            errorMessage = errorData;
                        }
                    } catch (parseError) {
                        console.error('❌ JSON 파싱 실패:', parseError);
                        errorMessage = responseText;
                    }
                }

                if (response.status === 401) {
                    console.error('❌ 인증 에러 - 로그인 필요');
                    alert('로그인이 필요합니다.');
                    return;
                } else if (response.status === 403) {
                    console.error('❌ 권한 에러');
                    alert('권한이 없습니다.');
                    return;
                } else if (response.status === 400) {
                    console.error('❌ 잘못된 요청:', errorMessage);
                    alert(`채팅방 생성 실패: ${errorMessage}`);
                    return;
                } else {
                    console.error('❌ 기타 HTTP 에러:', response.status);
                    alert(`서버 오류가 발생했습니다 (${response.status}): ${errorMessage}`);
                    return;
                }
            }

            // 성공 응답 처리
            if (!responseText || !responseText.trim()) {
                console.error('❌ 빈 응답 받음');
                alert('서버에서 빈 응답을 받았습니다.');
                return;
            }

            let result;
            try {
                result = JSON.parse(responseText);
                console.log('✅ 성공 응답 파싱 결과:', result);
            } catch (parseError) {
                console.error('❌ 성공 응답 JSON 파싱 실패:', parseError);
                console.error('❌ 파싱 실패한 응답:', responseText);
                alert('응답 처리 중 오류가 발생했습니다.');
                return;
            }

            // 채팅방 데이터 검증
            const chatRoom = result.data;
            if (!chatRoom) {
                console.error('❌ result.data가 null/undefined:', result);
                alert('채팅방 데이터를 받지 못했습니다.');
                return;
            }

            if (!chatRoom.roomId) {
                console.error('❌ roomId가 없음:', chatRoom);
                alert('채팅방 ID를 받지 못했습니다.');
                return;
            }

            console.log('✅ 채팅방 생성 성공:', chatRoom);

            // 채팅 페이지로 이동 URL 생성
            const chatUrl = `/bookbook/MessagePopup/${chatRoom.roomId}?bookTitle=${encodeURIComponent(bookDetail.bookTitle)}&otherUserNickname=${encodeURIComponent('대여자')}`;
            console.log('🚀 페이지 이동 URL:', chatUrl);

            // 채팅 페이지로 이동 (ChatWindow 컴포넌트가 있는 경로)
            router.push(chatUrl);

        } catch (error: unknown) {
            console.error('💥 네트워크 오류 또는 예외 발생:', error);
            
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('💥 fetch 에러 - 네트워크 연결 문제');
                alert('네트워크 연결을 확인해주세요.');
            } else if (error instanceof Error) {
                console.error('💥 에러 상세 정보:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                alert(`오류가 발생했습니다: ${error.message}`);
            } else {
                console.error('💥 알 수 없는 에러 타입:', typeof error, error);
                alert('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    // 찜하기 토글 함수
    const handleWishlistToggle = async (): Promise<void> => {
        if (!user || !userId || !bookDetail) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }

        if (wishlistLoading) return; // 이미 처리 중이면 중복 실행 방지

        setWishlistLoading(true);

        try {
            if (isWishlisted) {
                // 찜 삭제
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/wishlist/${bookDetail.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert('로그인이 필요합니다.');
                        return;
                    }
                    throw new Error(`찜 삭제 실패: ${response.status}`);
                }

                setIsWishlisted(false);
                alert('찜 목록에서 제거되었습니다.');
            } else {
                // 찜 추가
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/${userId}/wishlist`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        rentId: bookDetail.id
                    })
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert('로그인이 필요합니다.');
                        return;
                    }
                    const errorData: ApiResponse<unknown> = await response.json();
                    if (errorData.message && errorData.message.includes('이미 찜한 게시글')) {
                        alert('이미 찜한 게시글입니다.');
                        setIsWishlisted(true); // 상태 동기화
                        return;
                    }
                    throw new Error(`찜 추가 실패: ${response.status}`);
                }

                setIsWishlisted(true);
                alert('찜 목록에 추가되었습니다.');
            }
        } catch (error: unknown) {
            console.error('찜하기 처리 실패:', error);
            alert('찜하기 처리에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setWishlistLoading(false);
        }
    };

    // 이미지 에러 핸들러
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
        const target = e.currentTarget;
        target.src = 'https://i.postimg.cc/pLC9D2vW/noimg.gif';
        target.alt = "이미지 로드 실패";
    };

    // 로딩 중일 때 표시 (책 정보 로딩만 확인, 사용자 정보는 비동기로 처리)
    if (loading || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-gray-700 text-lg">책 정보를 불러오는 중...</p>
            </div>
        );
    }

    // 에러 발생 시 표시
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    // 책 정보가 없을 때 (예: ID가 유효하지 않거나 삭제된 경우)
    if (!bookDetail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-gray-700 text-lg">책 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    // 모든 정보가 준비되면 상세 페이지 렌더링
    // `bookDetail` 객체의 데이터를 사용하여 UI를 구성합니다.
    const defaultCoverImageUrl = 'https://i.postimg.cc/pLC9D2vW/noimg.gif';
    const backendBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`; // 백엔드 서버 주소
    const displayImageUrl = `${backendBaseUrl}${bookDetail.bookImage}` || defaultCoverImageUrl; // 이미지가 없으면 기본 이미지 표시

    // 현재 사용자가 글 작성자인지 확인
    const isAuthor = userId && bookDetail.lenderUserId && userId === bookDetail.lenderUserId;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:py-12 sm:px-16 md:py-16 md:px-24 font-inter">
        <div className="bg-white py-6 px-8 sm:py-8 sm:px-10 md:py-10 md:px-12 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-baseline mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {bookDetail.title}
                </h1>
                {bookDetail.createdAt && (
                    <p className="text-base sm:text-lg text-gray-500">
                        {bookDetail.createdAt.split('T')[0].replace(/-/g, '/')}
                    </p>
                )}
            </div>
            <hr className="border-t-2 border-gray-300 mb-6 sm:mb-8" />

            <div className="flex flex-col md:flex-row gap-16 mb-8"> {/* gap-8에서 gap-16으로 변경 */}
                {/* 책 이미지 영역 */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <img
                        src={displayImageUrl}
                        alt={bookDetail.bookTitle || '책 표지'}
                        className="w-80 h-80 object-cover rounded-lg shadow-md max-w-full"
                        onError={handleImageError}
                    />
                </div>

                {/* 책 정보 영역 */}
                <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-baseline mb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            책 정보
                        </h2>
                        {/* 대여 상태 표시 */}
                        {bookDetail.rentStatus === 'RENTED' && (
                            <span className="text-red-500 font-bold ml-2 text-lg">대여불가</span>
                        )}
                        {bookDetail.rentStatus === 'AVAILABLE' && (
                            <span className="text-green-600 font-bold ml-2 text-lg">대여가능</span>
                        )}
                        {bookDetail.rentStatus === 'EXPIRED' && (
                            <span className="text-gray-500 font-bold ml-2 text-lg">기간만료</span>
                        )}
                    </div>
                    <hr className="border-t border-gray-200 mb-4" />
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-center">
                            <p className="font-semibold text-gray-600 w-24 text-left">책 제목:</p>
                            <p className="text-gray-700 flex-grow text-left">{bookDetail.bookTitle}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <p className="font-semibold text-gray-600 w-24 text-left">저자:</p>
                            <p className="text-gray-700 flex-grow text-left">{bookDetail.author}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <p className="font-semibold text-gray-600 w-24 text-left">출판사:</p>
                            <p className="text-gray-700 flex-grow text-left">{bookDetail.publisher}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <p className="font-semibold text-gray-600 w-24 text-left">카테고리:</p>
                            <p className="text-gray-700 flex-grow text-left">{bookDetail.category}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <p className="font-semibold text-gray-600 w-24 text-left">책 상태:</p>
                            <p className="text-gray-700 flex-grow text-left">{bookDetail.bookCondition}</p>
                        </div>
                    </div>
                    {/* 북북톡/수정하기/대여하기/북마크 버튼 영역 */}
                    <div className="flex items-center mt-auto space-x-3">

                        {/* 로그인 했고, 글 작성자가 아닌경우에만만 찜 버튼 */}
                        {user && !isAuthor && (
                            <button 
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border shadow-sm transition-colors ${
                                    isWishlisted 
                                        ? 'border-red-400 bg-red-50 hover:bg-red-100' 
                                        : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                                } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isWishlisted ? '찜 해제' : '찜하기'}
                            >
                                {wishlistLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                                        isWishlisted ? 'text-red-500' : 'text-gray-500'
                                    }`} viewBox="0 0 20 20" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        )}

                        {/* 로그인 하지 않았을 때, 찜 버튼 */}
                        {!user && !isAuthor &&(
                            <button 
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm"
                                onClick={() => alert('로그인이 필요한 서비스입니다.')}
                                title="로그인이 필요합니다"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}

                        {/* 로그인 했고, 글 작성자가 아닌경우에만 북북톡 */}
                        {user && !isAuthor && (
                            <button
                                onClick={handleChatClick}
                                className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow-md"
                            >
                                북북톡
                            </button>
                        )}

                        {/* 로그인 하지 않은 경우, 북북톡 버튼 */}
                        {!user && (
                            <button
                                onClick={() => alert('로그인이 필요한 서비스입니다.')}
                                className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow-md"
                            >
                                북북톡
                            </button>
                        )}

                        {/* 로그인 했고, 글 작성자인 경우 수정하기 버튼 표시 */}
                        {isAuthor && user && (
                            <button
                                onClick={() => router.push(`/bookbook/rent/edit/${id}`)}
                                className="px-10 py-2 rounded-lg bg-[#D5BAA3] text-white font-semibold hover:bg-[#C2A794] shadow-md"
                            >
                                수정하기
                            </button>
                        )}
                          {/* 로그인 했고, 글 작성자가 아닌 경우 대여하기 버튼 */}
                         {!isAuthor && user && (
                             <button
                                 onClick={() => setIsRentModalOpen(true)}
                                 className="px-10 py-2 rounded-lg bg-[#D5BAA3] text-white font-semibold hover:bg-[#C2A794] shadow-md"
                             >
                                 대여하기
                             </button>
                         )}
                         {/* 로그인하지 않은 경우 대여하기 버튼 */}
                         {!user && (
                             <button
                                 onClick={() => alert('로그인이 필요한 서비스입니다.')}
                                 className="px-10 py-2 rounded-lg bg-[#D5BAA3] text-white font-semibold hover:bg-[#C2A794] shadow-md"
                             >
                                 대여하기
                             </button>
                         )}
                    </div>
                </div>
            </div>

            <hr className="border-t-2 border-gray-300 my-6 sm:my-8" />

            {/* 글 내용 영역 및 대여자 정보 영역을 가로로 배치 */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* 글 내용 영역 (70% 너비) */}
                <div className="w-full md:w-7/10">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                        글 내용
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {bookDetail.contents}
                        </p>
                    </div>
                </div>

                {/* 수직 구분선 (모바일에서는 숨김) */}
                <div className="hidden md:block border-l-2 border-gray-300 mx-4"></div>

                {/* 대여자 정보 영역 (30% 너비) */}
                <div className="w-full md:w-3/10">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                        대여자 정보
                    </h2>
                    <button
                        onClick={handleOpenProfileModal}
                        className="w-full text-left p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">

                            <div>
                                <p className="font-semibold text-gray-800">{bookDetail.nickname}</p>
                                <p className="text-sm text-gray-600 mt-2">등록된 글: {bookDetail.lenderPostCount}</p>
                                <p className="text-sm text-gray-600">매너 점수: {bookDetail.rating}/5</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* 책 설명 영역 (알라딘 API에서 가져온 내용) - 기존 위치 유지 */}
            <div className="mt-8 mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    책 설명
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {bookDetail.description}
                    </p>
                </div>
            </div>

            {/* 하단 버튼 (이전 페이지로 돌아가기 등) */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => router.push('/bookbook')} // 특정 URL로 이동하도록 수정
                    className="px-6 py-2 text-white font-semibold rounded-lg shadow-md bg-gray-500 hover:bg-gray-600 transition duration-150"
                >
                    목록으로 돌아가기
                </button>
            </div>
        </div>

        {/* 대여하기 팝업 모달 */}
        {bookDetail && (
            <RentModal
                isOpen={isRentModalOpen}
                onClose={() => setIsRentModalOpen(false)}
                bookTitle={bookDetail.bookTitle}
                lenderNickname={bookDetail.nickname}
                rentId={bookDetail.id}
                borrowerUserId={userId}
            />
        )}
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={handleCloseProfileModal}
                userId={selectedLenderId}
            />
    </div>
    );
}