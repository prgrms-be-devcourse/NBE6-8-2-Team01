// src/app/bookbook/rent/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter는 클라이언트 컴포넌트에서 사용

// 백엔드에서 받아올 책 상세 정보의 타입을 정의합니다.
interface BookDetail {
    id: number; // 글 ID
    title: string; // 글 제목
    bookTitle: string; // 책 제목
    author: string; // 저자
    publisher: string; // 출판사
    category: string; // 카테고리
    description: string; // 책 설명 (알라딘 API에서 가져온 상세 설명)
    bookCondition: string; // 책 상태
    address: string; // 거래 희망 지역
    contents: string; // 글 내용 (사용자가 직접 작성한 내용)
    bookImage: string; // 책 이미지 URL (DB에 저장된 경로)
    rentStatus: 'AVAILABLE' | 'RENTED' | 'EXPIRED'; // 대여 상태
    createdAt: string; // 등록일 (예: 2025/07/22)
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Next.js 동적 라우팅으로 URL에서 'id' 값을 가져옴
    const { id } = React.use(params);

    const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter(); // 페이지 이동을 위한 useRouter 훅

    // 컴포넌트가 마운트되거나 ID가 변경될 때 책 상세 정보를 불러옵니다.
    useEffect(() => {
        const fetchBookDetail = async () => {
            if (!id) return; // ID가 없으면 API 호출하지 않음

            setLoading(true);
            setError(null);

            try {
                // 백엔드 API (예: GET /bookbook/rent/{id})를 호출하여 책 상세 정보를 가져옵니다.
                // 실제 백엔드 API 엔드포인트에 맞게 URL을 수정해야 합니다.
                const response = await fetch(`http://localhost:8080/bookbook/rent/${id}`);

                if (!response.ok) {
                    // HTTP 에러가 발생한 경우
                    const errorData = await response.text();
                    throw new Error(`Failed to fetch book details: ${response.status} ${response.statusText} - ${errorData}`);
                }

                const data: BookDetail = await response.json();
                setBookDetail(data);
            } catch (err: any) {
                console.error("책 상세 정보 불러오기 실패:", err);
                setError(`책 정보를 불러오는 데 실패했습니다: ${err.message || '알 수 없는 오류'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetail();
    }, [id]); // id가 변경될 때마다 useEffect 재실행

    // 로딩 중일 때 표시
    if (loading) {
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
    const backendBaseUrl = 'http://localhost:8080'; // 백엔드 서버 주소
    const displayImageUrl = `${backendBaseUrl}${bookDetail.bookImage}` || defaultCoverImageUrl; // 이미지가 없으면 기본 이미지 표시

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
                        onError={(e) => {
                            e.currentTarget.src = defaultCoverImageUrl;
                            e.currentTarget.alt = "이미지 로드 실패";
                        }}
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
                    {/* 수정하기/대여하기/북마크 버튼 영역 */}
                    <div className="flex items-center mt-auto space-x-3 justify-center">
                        <button className="px-5 py-2 rounded-lg bg-[#D5BAA3] text-white font-semibold hover:bg-[#C2A794] shadow-md">
                            수정하기
                        </button>
                        <button className="px-5 py-2 rounded-lg bg-[#D5BAA3] text-white font-semibold hover:bg-[#C2A794] shadow-md">
                            대여하기
                        </button>
                        {/* 북마크 버튼 스타일링 */}
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-400 bg-gray-50 hover:bg-gray-100 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </button>
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
                    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">

                        <div>
                            <p className="font-semibold text-gray-800">북북이1</p>
                            <p className="text-sm text-gray-600">등록된 글: 21</p>
                            <p className="text-sm text-gray-600">매너 점수: 4.5/5 &#x1F60A;</p>
                        </div>
                    </div>
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
                    onClick={() => router.back()} // router.back() 기능 복구
                    className="px-6 py-2 text-white font-semibold rounded-lg shadow-md bg-gray-500 hover:bg-gray-600 transition duration-150"
                >
                    목록으로 돌아가기
                </button>
            </div>
        </div>
    </div>
    );
}



// "use client";

// import React from 'react';
// import { useRouter } from 'next/navigation'; // useRouter 복구

// export default function BookDetailPagePreview() {
//     const router = useRouter(); // useRouter 초기화 복구

//     // ✅ 임의의 책 상세 데이터 (하드코딩된 값)
//     const bookDetail = {
//         id: 999, // 임의의 ID
//         title: "식탁 위의 세계사 한번 읽어보세요!",
//         bookTitle: "식탁 위의 세계사",
//         author: "이영숙",
//         publisher: "장비",
//         category: "역사",
//         description: `이 책은 인류의 역사를 '식탁' 위 음식과 문화의 교류로 설명합니다. 우리가 매일 먹는 음식 속에 숨겨진 역사적 사실들을 흥미롭게 풀어내며, 음식이라는 렌즈를 통해 세계사를 새롭게 조망하는 독특한 시각을 제공합니다.`, // 3줄 이내로 축소
//         bookCondition: "최상 (깨끗함)",
//         address: "서울특별시",
//         contents: `한 번 읽고 보관한 책입니다! 상태 좋아요 👍
// 심심할 때 읽어보세요.`,
//         bookImage: "https://i.postimg.cc/tJnB0F0B/sample-book-cover.jpg", // 임의의 책 표지 이미지 URL
//         rentStatus: 'AVAILABLE', // 임의의 대여 상태: 'AVAILABLE', 'RENTED', 'EXPIRED' 중 선택 가능
//         createdAt: "2025-07-22T10:00:00Z", // 임의의 등록일
//     };

//     const defaultCoverImageUrl = 'https://i.postimg.cc/pLC9D2vW/noimg.gif';
//     const displayImageUrl = bookDetail.bookImage || defaultCoverImageUrl;

//     return (
        // <div className="min-h-screen bg-gray-100 py-8 px-4 sm:py-12 sm:px-16 md:py-16 md:px-24 font-inter">
        //     <div className="bg-white py-6 px-8 sm:py-8 sm:px-10 md:py-10 md:px-12 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
        //         <div className="flex justify-between items-baseline mb-4">
        //             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
        //                 {bookDetail.title}
        //             </h1>
        //             {bookDetail.createdAt && (
        //                 <p className="text-base sm:text-lg text-gray-500">
        //                     {bookDetail.createdAt.split('T')[0].replace(/-/g, '/')}
        //                 </p>
        //             )}
        //         </div>
        //         <hr className="border-t-2 border-gray-300 mb-6 sm:mb-8" />

        //         <div className="flex flex-col md:flex-row gap-16 mb-8"> {/* gap-8에서 gap-16으로 변경 */}
        //             {/* 책 이미지 영역 */}
        //             <div className="flex-shrink-0 flex justify-center md:justify-start">
        //                 <img
        //                     src={displayImageUrl}
        //                     alt={bookDetail.bookTitle || '책 표지'}
        //                     className="w-80 h-80 object-cover rounded-lg shadow-md max-w-full"
        //                     onError={(e) => {
        //                         e.currentTarget.src = defaultCoverImageUrl;
        //                         e.currentTarget.alt = "이미지 로드 실패";
        //                     }}
        //                 />
        //             </div>

        //             {/* 책 정보 영역 */}
        //             <div className="flex-grow flex flex-col">
        //                 <div className="flex justify-between items-baseline mb-2">
        //                     <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
        //                         책 정보
        //                     </h2>
        //                     {/* 대여 상태 표시 */}
        //                     {bookDetail.rentStatus === 'RENTED' && (
        //                         <span className="text-red-500 font-bold ml-2 text-lg">대여불가</span>
        //                     )}
        //                     {bookDetail.rentStatus === 'AVAILABLE' && (
        //                         <span className="text-green-600 font-bold ml-2 text-lg">대여가능</span>
        //                     )}
        //                     {bookDetail.rentStatus === 'EXPIRED' && (
        //                         <span className="text-gray-500 font-bold ml-2 text-lg">기간만료</span>
        //                     )}
        //                 </div>
        //                 <hr className="border-t border-gray-200 mb-4" />
        //                 <div className="space-y-3 mt-4">
        //                     <div className="flex items-center justify-center">
        //                         <p className="font-semibold text-gray-600 w-24 text-left">책 제목:</p>
        //                         <p className="text-gray-700 flex-grow text-left">{bookDetail.bookTitle}</p>
        //                     </div>
        //                     <div className="flex items-center justify-center">
        //                         <p className="font-semibold text-gray-600 w-24 text-left">저자:</p>
        //                         <p className="text-gray-700 flex-grow text-left">{bookDetail.author}</p>
        //                     </div>
        //                     <div className="flex items-center justify-center">
        //                         <p className="font-semibold text-gray-600 w-24 text-left">출판사:</p>
        //                         <p className="text-gray-700 flex-grow text-left">{bookDetail.publisher}</p>
        //                     </div>
        //                     <div className="flex items-center justify-center">
        //                         <p className="font-semibold text-gray-600 w-24 text-left">카테고리:</p>
        //                         <p className="text-gray-700 flex-grow text-left">{bookDetail.category}</p>
        //                     </div>
        //                     <div className="flex items-center justify-center">
        //                         <p className="font-semibold text-gray-600 w-24 text-left">책 상태:</p>
        //                         <p className="text-gray-700 flex-grow text-left">{bookDetail.bookCondition}</p>
        //                     </div>
        //                 </div>
        //                 {/* 수정하기/대여하기/북마크 버튼 영역 */}
        //                 <div className="flex items-center mt-auto space-x-3 justify-center">
        //                     <button className="px-5 py-2 rounded-lg bg-[#D5BAA3] text-white font-semibold hover:bg-[#C2A794] shadow-md">
        //                         수정하기
        //                     </button>
        //                     <button className="px-5 py-2 rounded-lg bg-[#D5BAA3] text-white font-semibold hover:bg-[#C2A794] shadow-md">
        //                         대여하기
        //                     </button>
        //                     {/* 북마크 버튼 스타일링 */}
        //                     <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-400 bg-gray-50 hover:bg-gray-100 shadow-sm">
        //                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        //                             <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        //                         </svg>
        //                     </button>
        //                 </div>
        //             </div>
        //         </div>

        //         <hr className="border-t-2 border-gray-300 my-6 sm:my-8" />

        //         {/* 글 내용 영역 및 대여자 정보 영역을 가로로 배치 */}
        //         <div className="flex flex-col md:flex-row gap-8">
        //             {/* 글 내용 영역 (70% 너비) */}
        //             <div className="w-full md:w-7/10">
        //                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
        //                     글 내용
        //                 </h2>
        //                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        //                     <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        //                         {bookDetail.contents}
        //                     </p>
        //                 </div>
        //             </div>

        //             {/* 수직 구분선 (모바일에서는 숨김) */}
        //             <div className="hidden md:block border-l-2 border-gray-300 mx-4"></div>

        //             {/* 대여자 정보 영역 (30% 너비) */}
        //             <div className="w-full md:w-3/10">
        //                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
        //                     대여자 정보
        //                 </h2>
        //                 <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        //                     <img
        //                         src="https://i.postimg.cc/NjW58yB7/image.png" // 대여자 프로필 이미지 (임시)
        //                         alt="대여자 프로필"
        //                         className="w-16 h-16 rounded-full object-cover"
        //                     />
        //                     <div>
        //                         <p className="font-semibold text-gray-800">북북이1</p>
        //                         <p className="text-sm text-gray-600">등록된 글: 21</p>
        //                         <p className="text-sm text-gray-600">매너 점수: 4.5/5 &#x1F60A;</p>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>

        //         {/* 책 설명 영역 (알라딘 API에서 가져온 내용) - 기존 위치 유지 */}
        //         <div className="mt-8 mb-8">
        //             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
        //                 책 설명
        //             </h2>
        //             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        //                 <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        //                     {bookDetail.description}
        //                 </p>
        //             </div>
        //         </div>

        //         {/* 하단 버튼 (이전 페이지로 돌아가기 등) */}
        //         <div className="mt-8 flex justify-center">
        //             <button
        //                 onClick={() => router.back()} // router.back() 기능 복구
        //                 className="px-6 py-2 text-white font-semibold rounded-lg shadow-md bg-gray-500 hover:bg-gray-600 transition duration-150"
        //             >
        //                 목록으로 돌아가기
        //             </button>
        //         </div>
        //     </div>
        // </div>
//     );
// }
