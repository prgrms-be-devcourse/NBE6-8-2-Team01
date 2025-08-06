// 25.08.06
// src/app/bookbook/rent/edit/[id]/page.tsx
// 글 수정을 위한 페이지

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

// 분리한 AddressSelectionPopup 컴포넌트를 import
import AddressSelectionPopup from '@/app/components/AddressSelectionPopup';

interface BookSearchResult {
    bookTitle: string;
    author: string;
    publisher: string;
    pubDate: string;
    coverImageUrl: string;
    category: string;
    bookDescription: string;
}

interface BookDetail {
    id: number;
    title: string;
    bookTitle: string;
    author: string;
    publisher: string;
    category: string;
    description: string;
    bookCondition: string;
    address: string;
    contents: string;
    bookImage: string;
    rentStatus: 'AVAILABLE' | 'RENTED' | 'EXPIRED';
    createdAt: string;
    lenderUserId: number;
}

// API 응답 타입
interface ApiResponse {
    msg?: string;
    imageUrl?: string;
}

// Props 타입 정의
interface EditBookPageProps {
    params: Promise<{ id: string }>;
}

export default function EditBookPage({ params }: EditBookPageProps): React.JSX.Element {
    const { id } = React.use(params);
    const router = useRouter();
    
    const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 폼 상태들
    const [title, setTitle] = useState<string>('');
    const [bookImage, setBookImage] = useState<File | null>(null);
    const [bookCondition, setBookCondition] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [contents, setContents] = useState<string>('');
    const [bookTitle, setBookTitle] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [publisher, setPublisher] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    // Toast 메시지 상태 추가
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error' | null>(null);

    // 토스트 메세지를 보여주는 함수
    const showToast = (message: string, type: 'success' | 'error'): void => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setToastMessage(null);
            setToastType(null);
        }, 3000); // 3초 후에 자동으로 사라짐
    };

    const [showPopup, setShowPopup] = useState<boolean>(false);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showBookSearchModal, setShowBookSearchModal] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);

    // 페이지네이션 관련 상태 추가 및 수정
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; // 백엔드 MaxResults와 동일하게 10으로 설정
    const [hasMoreResults, setHasMoreResults] = useState<boolean>(false);

    const defaultImageUrl = 'https://i.postimg.cc/pLC9D2vW/noimg.gif';
    const [previewImageUrl, setPreviewImageUrl] = useState<string>(defaultImageUrl);

    // 주소 선택 관련 상태 추가
    const [isAddressPopupOpen, setIsAddressPopupOpen] = useState<boolean>(false); // 팝업 출력 용
    const [selectedAddress, setSelectedAddress] = useState<string>(''); // 선택된 주소

    // 기존 데이터 불러오기
    useEffect(() => {
        const fetchBookDetail = async (): Promise<void> => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:8080/bookbook/rent/${id}`);

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`Failed to fetch book details: ${response.status} ${response.statusText} - ${errorData}`);
                }

                const data: BookDetail = await response.json();
                setBookDetail(data);
                
                // 폼 데이터 설정
                setTitle(data.title);
                setBookCondition(data.bookCondition);
                setSelectedAddress(data.address);
                setAddress(data.address);
                setContents(data.contents);
                setBookTitle(data.bookTitle);
                setAuthor(data.author);
                setPublisher(data.publisher);
                setCategory(data.category);
                setDescription(data.description);
                setPreviewImageUrl(data.bookImage || defaultImageUrl);
            } catch (err: unknown) {
                console.error("책 상세 정보 불러오기 실패:", err);
                const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
                setError(`책 정보를 불러오는 데 실패했습니다: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetail();
    }, [id]);

    useEffect(() => {
        if (bookImage) {
            const objectUrl = URL.createObjectURL(bookImage);
            setPreviewImageUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            // 기존 이미지가 있으면 그대로 유지
            if (bookDetail?.bookImage) {
                // 받아온 이미지가 나오도록 이 부분을 수정합니다.
                const fullImageUrl = bookDetail.bookImage.startsWith('http') ? bookDetail.bookImage : `http://localhost:8080${bookDetail.bookImage}`;
                setPreviewImageUrl(fullImageUrl);
            } else {
                setPreviewImageUrl(defaultImageUrl);
            }
        }
    }, [bookImage, bookDetail]);

    const conditions = ['최상 (깨끗함)', '상 (사용감 적음)', '중 (사용감 있음)', '하 (손상 있음)'];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            setBookImage(e.target.files[0]);
        } else {
            setBookImage(null);
        }
    };

    // start 파라미터를 받는 handleBookSearch 함수로 변경
    const handleBookSearch = async (pageNumber: number): Promise<void> => {
        if (!searchQuery.trim()) {
            showToast('검색어를 입력해주세요.', 'error');
            return;
        }

        // 백엔드 책 검색 API 호출 시 start 파라미터 추가
        const backendSearchApiUrl = `http://localhost:8080/api/v1/bookbook/searchbook?query=${encodeURIComponent(searchQuery)}&start=${pageNumber}`;

        try {
            const response = await fetch(backendSearchApiUrl);
            if (!response.ok) {
                const errorData = await response.text();
                console.error('백엔드 책 검색 API 요청 실패:', response.status, response.statusText, errorData);
                showToast(`책 검색 API 요청 실패: ${response.status} ${response.statusText}`, 'error');
                return;
            }

            const data: BookSearchResult[] = await response.json(); 

            if (data && data.length > 0) {
                setSearchResults(data);
                // 가져온 결과 수가 itemsPerPage와 같으면 다음 페이지가 더 있을 수 있다고 가정
                setHasMoreResults(data.length === itemsPerPage);
                setShowBookSearchModal(true);
                setCurrentPage(pageNumber); // 검색 성공 시 현재 페이지 업데이트
            } else {
                showToast('검색 결과가 없습니다. 직접 입력해주세요.', 'error');
                setSearchResults([]);
                setHasMoreResults(false);
                setShowBookSearchModal(false); // 결과 없으면 모달 닫기
            }
        } catch (error: unknown) {
            console.error('책 검색 중 오류 발생', error);
            showToast('책 검색 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.', 'error');
            setSearchResults([]);
            setHasMoreResults(false);
            setShowBookSearchModal(false);
        }
    };

    // 책 선택 시 폼 필드 채우는 함수
    const selectBook = (book: BookSearchResult): void => {
        setBookTitle(book.bookTitle);
        setAuthor(book.author);
        setPublisher(book.publisher);
        setCategory(book.category || ''); // 카테고리 필드 추가
        setDescription(book.bookDescription || ''); // 책 설명 필드 추가
        setShowBookSearchModal(false); // 모달 닫기
    };

    // 백엔드 API (PUT /rent)로 데이터 전송.
    // 1. 새로운 이미지가 선택된 경우에만 이미지 업로드 API로 전송하여 URL을 받습니다.
    // 2. 받은 이미지 URL과 폼 데이터를 조합하여 대여글 수정 API로 전송합니다.
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        let imageUrl = bookDetail?.bookImage || 'https://i.postimg.cc/pLC9D2vW/noimg.gif'; // 기존 이미지 URL

        // ✅ 개선된 이미지 처리 로직
        // 1. 새로운 이미지가 선택된 경우 (bookImage가 존재하는 경우)
        if (bookImage) {
            const imageFormData = new FormData();
            imageFormData.append('file', bookImage);

            try {
                const imageUploadRes = await fetch("http://localhost:8080/api/v1/bookbook/upload-image", {
                    method: "POST",
                    body: imageFormData,
                });

                if (imageUploadRes.ok) {
                    const data: ApiResponse = await imageUploadRes.json();
                    imageUrl = data.imageUrl || imageUrl;
                } else {
                    const errorText = await imageUploadRes.text();
                    console.error('이미지 업로드 실패', errorText);
                    showToast(`이미지 업로드 실패: ${imageUploadRes.statusText || errorText}`, 'error');
                    return;
                }
            } catch (error: unknown) {
                console.error('이미지 업로드 중 네트워크 오류', error);
                showToast('이미지 업로드 중 오류가 발생했습니다.', 'error');
                return;
            }
        }
        // 2. 새로운 이미지가 선택되지 않았고, 기존 이미지도 없는 경우
        else if (!bookImage && previewImageUrl === defaultImageUrl) {
            showToast('책 이미지를 등록해 주세요.', 'error');
            return;
        }
        // 3. 새로운 이미지가 선택되지 않았지만 기존 이미지가 있는 경우
        // imageUrl은 이미 기존 이미지 URL로 설정되어 있으므로 그대로 사용

        const formData = {
            title: title,
            bookCondition: bookCondition,
            bookImage: imageUrl,
            address: selectedAddress,
            contents: contents,
            rentStatus: 'AVAILABLE' as const, // 백엔드의 RentStatus.AVAILABLE과 동일한 문자열
            bookTitle: bookTitle,
            author: author,
            publisher: publisher,
            category: category,
            description: description
        };

        // 백엔드 Rent 페이지 수정 Put 요청으로 전송
        try {
            const res = await fetch(`http://localhost:8080/bookbook/rent/edit/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowPopup(true);
            } else {
                const errorData: ApiResponse = await res.json();
                console.error('책 수정 실패', errorData);
                showToast(`책 수정에 실패했습니다. ${errorData.msg || res.statusText}`, 'error');
            }
        } catch (error: unknown) {
            console.error('책 수정 중 네트워크 에러', error);
            showToast('책 수정 중 네트워크 에러가 발생했습니다.', 'error');
        }
    };

    // 이미지 에러 핸들러
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
        const target = e.currentTarget;
        target.src = defaultImageUrl;
        target.alt = "이미지 로드 실패";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-gray-700 text-lg">책 정보를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    if (!bookDetail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-gray-700 text-lg">책 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-16 md:py-16 md:px-24 font-inter">
            <div className="bg-white py-6 px-8 sm:py-8 sm:px-10 md:py-10 md:px-12 rounded-xl shadow-lg w-full max-w-4xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-left">
                    중고 책 수정하기
                </h1>
                <hr className="border-t-2 border-gray-300 mb-6 sm:mb-8" />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="postTitle" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            글 제목
                        </label>
                        <input
                            type="text"
                            id="postTitle"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="글 제목을 입력해주세요."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="bookImage" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            책 이미지 업로드
                        </label>
                        <div className="flex flex-col items-start space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    id="bookImage"
                                    className="hidden" // 기본 파일 입력을 숨김
                                    onChange={handleImageChange}
                                    accept="image/*" // 이미지 파일만 선택 가능하도록 제한
                                />
                                <label
                                    htmlFor="bookImage" // '파일 선택' 버튼(label)을 클릭하면, 브라우저는 자동으로 숨겨진 <input type="file">을 클릭한 것처럼 동작
                                    className="px-4 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer text-center
                                    bg-[#D5BAA3] hover:bg-[#C2A794] focus:ring-[#D5BAA3]"
                                >
                                    파일 선택
                                </label>
                            </div>
                            <img
                                src={previewImageUrl}
                                alt="책 이미지"
                                className="w-[200px] h-[150px] object-cover rounded-lg"
                                onError={handleImageError}
                            />                       
                        </div>
                    </div>

                    {/* 책 상태, 주소 입력 부분 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* 책 상태 */}
                        <div className='md:col-span-1'> {/* 1:2 비율을 위해 md:col-span-1 추가 */}
                            <label htmlFor="bookCondition" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                                책 상태
                            </label>
                            {/* 책 상태 토글 */}
                            <select
                                id="bookCondition"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 h-12"
                                value={bookCondition}
                                onChange={(e) => setBookCondition(e.target.value)}
                                required
                            >
                                <option value="" disabled>책 상태를 선택하세요</option>
                                {conditions.map((cond) => (
                                    <option key={cond} value={cond}>{cond}</option>
                                ))}
                            </select>
                        </div>

                        {/* 주소 입력 */}
                        <div className='md:col-span-2'> {/* 1:2 비율을 위해 md:col-span-2 추가 */}
                            <label htmlFor="address" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                                주소
                            </label>

                            {/* 주소 선택 필드를 텍스트와 버튼으로 변경 */}
                            <div className="flex items-center space-x-2">
                                {/* 주소 선택 인풋 상자 */}
                                <input
                                    type="text"
                                    id="address"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 h-12"
                                    value={selectedAddress || '주소를 선택해주세요'} // 선택된 주소 표시
                                    readOnly // 직접 입력 방지
                                    required
                                />
                                {/* 책 선택 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => setIsAddressPopupOpen(true)} // 주소 팝업 열기
                                    className="px-4 py-3 whitespace-nowrap text-white font-semibold rounded-lg shadow-md bg-[#D5BAA3] hover:bg-[#C2A794] "
                                >
                                    선택
                                </button>
                            </div>

                        </div>
                    </div>

                    <div>
                        <label htmlFor="contents" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            글 내용
                        </label>
                        <textarea
                            id="contents"
                            rows={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y"
                            placeholder="책에 대한 설명, 상태 등을 자세히 적어주세요."
                            value={contents}
                            onChange={(e) => setContents(e.target.value)}
                            maxLength={500}
                            required
                        ></textarea>
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {contents.length}/500
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-end space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
                        {/* 책 도움말 말풍선 */}
                        <div className="relative w-full sm:w-auto">
                            {/* 책 검색 상자 */}
                            <input
                                type="text"
                                placeholder="책 제목 입력"
                                className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {/* 비어있을 때만 출력하는 span 부분 */}
                            {searchQuery.trim() === '' && (
                               <span className="absolute left-1/2 -top-8 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                                    책 검색 기능으로 간편하게 입력하세요!
                                </span>
                            )}
                        </div>

                        {/* 책 검색 버튼 */}
                        <button
                            type="button"
                            className="px-6 py-2 text-white font-semibold rounded-lg shadow-md
                            bg-[#D5BAA3] hover:bg-[#C2A794]"
                            onClick={() => handleBookSearch(1)}
                        >
                            책 검색하기
                        </button>
                    </div>

                    <div>
                        <label htmlFor="bookTitle" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            책 제목
                        </label>
                        <input
                            type="text"
                            id="bookTitle"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="예: 식탁 위의 세계사"
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="author" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                                저자
                            </label>
                            <input
                                type="text"
                                id="author"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="예: 이영숙"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="publisher" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                                출판사
                            </label>
                            <input
                                type="text"
                                id="publisher"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="예: 장비"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                                카테고리
                            </label>
                            <input
                                type="text"
                                id="category"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="예: 역사"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            책 설명
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y"
                            placeholder="책에 대한 간략한 설명을 입력하거나, 검색된 내용을 확인하세요."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            required
                        ></textarea>
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {description.length}/500
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit"
                            className="w-64 py-3 text-white text-lg font-semibold rounded-lg shadow-md transition duration-200
                            bg-[#D5BAA3] hover:bg-[#C2A794]"
                        >
                            수정하기
                        </button>
                    </div>
                </form>
            </div>

            {/* 토스트 메시지 컴포넌트 */}
            {toastMessage && (
                <div
                    className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-center z-50
                        ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {toastMessage}
                </div>
            )}
        
            {/* 책 검색 결과 팝업 모달 */}
            {showBookSearchModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
                    onClick={() => setShowBookSearchModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-6 sm:p-8 shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                            책 검색 결과
                        </h2>
                        <hr className="border-t-2 border-gray-300 mb-6" />

                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.map((book, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition duration-150 cursor-pointer"
                                    >
                                        <img
                                            src={book.coverImageUrl || defaultImageUrl}
                                            alt={book.bookTitle}
                                            className="w-24 h-32 object-cover rounded-md mb-3"
                                            onError={handleImageError}
                                        />
                                        <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-2">
                                            {book.bookTitle}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-1">
                                            {book.author} | {book.publisher}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {book.pubDate}
                                        </p>
                                        <button
                                            className="mt-4 px-4 py-2 text-white font-semibold rounded-lg bg-[#D5BAA3] hover:bg-[#C2A794] text-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                selectBook(book); // 책 선택 함수 호출
                                            }}
                                        >
                                            선택하기
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600">검색 결과가 없습니다.</p>
                        )}

                        <div className="flex justify-center items-center mt-6 space-x-4">
                            <button
                                onClick={() => handleBookSearch(currentPage - 1)} // 이전 버튼 클릭 시
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-[#D5BAA3] text-white disabled:opacity-50"
                            >
                                이전
                            </button>
                            {/* 현재 페이지 번호와 총 페이지 수를 정확히 알 수 없으므로, 현재 페이지 정보만 표시하거나, 다음 페이지가 있는지 여부로 대체 */}
                            <span>
                                페이지 {currentPage}
                            </span>
                            <button
                                onClick={() => handleBookSearch(currentPage + 1)} // 다음 버튼 클릭 시
                                disabled={!hasMoreResults} // 다음 페이지 결과가 없을 경우 비활성화
                                className="px-4 py-2 rounded-lg bg-[#D5BAA3] text-white disabled:opacity-50"
                            >
                                다음
                            </button>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowBookSearchModal(false)}
                                className="px-6 py-2 text-white rounded-lg font-bold bg-gray-500 hover:bg-gray-600"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}   

            {/* 글 수정 팝업 */}
            {showPopup && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                  onClick={() => setShowPopup(false)}
                >
                  <div
                    className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="mb-6 text-lg font-semibold">
                      글이 수정되었습니다.
                    </div>
                    <button
                      onClick={() => {
                        setShowPopup(false);
                        router.push(`/bookbook/rent/${id}`);
                      }}
                      className="px-6 py-2 text-white rounded-lg font-bold bg-[#D5BAA3] hover:bg-[#C2A794]"
                    >
                      확인
                    </button>
                  </div>
                </div>
            )}

            {/* 주소 선택 팝업 */}
            <AddressSelectionPopup
                isOpen={isAddressPopupOpen}
                onClose={() => setIsAddressPopupOpen(false)}
                onSelectAddress={(address: string) => {
                    setSelectedAddress(address);
                    setIsAddressPopupOpen(false);
                }}
            />
        </div>
    );
}