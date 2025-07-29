"use client"; // Next.js: 클라이언트 컴포넌트임을 명시 (useState 등 Hooks 사용 시 필수)

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";


export default function BookRentPage() {
    // 폼 필드 상태 관리 (React useState 훅 사용)
    const [title, setTitle] = useState('');
    // bookImage 타입 명시: File 객체 또는 null. TypeScript 에러 방지.
    const [bookImage, setBookImage] = useState<File | null>(null);
    const [bookCondition, setBookCondition] = useState('');
    const [address, setAddress] = useState('');
    const [contents, setContents] = useState('');
    const [bookTitle, setBookTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [category, setCategory] = useState('');

    // 팝업 상태 관리
    const [showPopup, setShowPopup] = useState(false);

    // 이미지 미리보기를 위한 상태
    const defaultImageUrl = 'https://i.postimg.cc/pLC9D2vW/noimg.gif'; // 기본 이미지 URL
    const [previewImageUrl, setPreviewImageUrl] = useState<string>(defaultImageUrl); // 이미지 미리보기 URL 상태

    // useEffect 훅: bookImage 상태가 변경될 때마다 실행
    useEffect(() => {
        if (bookImage) {
            // File 객체로부터 임시 URL 생성 (브라우저에서만 유효)
            const objectUrl = URL.createObjectURL(bookImage);
            setPreviewImageUrl(objectUrl); // 미리보기 URL 업데이트

            // 컴포넌트 언마운트 또는 bookImage 변경 시 이전 URL 해제 (메모리 누수 방지)
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewImageUrl(defaultImageUrl); // 파일이 없으면 기본 이미지로 설정
        }
    }, [bookImage]); // bookImage 상태가 변경될 때마다 이 훅을 다시 실행

    // 드롭다운 필드 데이터
    const conditions = ['최상 (깨끗함)', '상 (사용감 적음)', '중 (사용감 있음)', '하 (손상 있음)'];
    const addresses = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'];

    const router = useRouter();

    // Form 초기화 함수
    const resetForm = () => {
        setTitle('');
        setBookImage(null);
        setBookCondition('');
        setAddress('');
        setContents('');
        setBookTitle('');
        setAuthor('');
        setPublisher('');
        setCategory('');
    };

    // 파일 입력 변경 처리: 선택된 파일을 bookImage 상태에 저장.
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBookImage(e.target.files[0]);
        } else {
            setBookImage(null);
        }
    };

    // 백엔드 API (POST /rent)로 데이터 전송.
    // 1. 이미지 파일이 있다면 먼저 이미지 업로드 API로 전송하여 URL을 받습니다.
    // 2. 받은 이미지 URL과 폼 데이터를 조합하여 대여글 생성 API로 전송합니다.
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 폼 기본 제출 동작(새로고침) 방지

        let imageUrl = 'https://i.postimg.cc/pLC9D2vW/noimg.gif'; // 기본 이미지 URL

        // 1. 이미지 파일 선택 시, 이미지 업로드 API에 전송
        if(bookImage){
            const imageFormData = new FormData(); // FormData 객체 생성
            imageFormData.append('file', bookImage); // 'file' 이름으로 File 객체 추가 (백엔드의 MultipartFile 이름과 같아야 함!)

            try{
                // 백엔드 이미지 업로드 API
                // 파일을 받고 저장한 후, 저장된 이미지의 URL을 반환
                const imageUploadRes = await fetch("http://localhost:8080/api/v1/bookbook/upload-image", {
                    method: "POST",
                    body: imageFormData,
                });

                // 이미지 업로드 응답이 정상적으로 동작할 경우
                if(imageUploadRes.ok){
                    const data = await imageUploadRes.json(); // 백엔드가 JSON 형태로 응답
                    imageUrl = data.imageUrl; // 반환된 이미지 URL 저장
                }else{ // 이미지 업로드 응답 실패 시
                    const errorText = await imageUploadRes.text();
                    console.error('이미지 업로드 실패', errorText);
                    alert(`이미지 업로드 실패: ${imageUploadRes.statusText || errorText}`);
                    return; // 대여글 등록 중단
                }
            }catch(error){
                console.error('이미지 업로드 중 네트워크 오류', error);
                alert('이미지 업로드 중 오류가 발생했습니다.');
                return; // 대여글 등록 중단
            }
        }

        // 폼에 담을 데이터 준비
        const formData = {
            title: title,
            bookCondition: bookCondition,
            bookImage: imageUrl,
            address: address,
            contents: contents,
            rentStatus: 'AVAILABLE',
            bookTitle: bookTitle,
            author: author,
            publisher: publisher,
            category: category
        };

        try{
            // rent 테이블에 데이터 저장(POST 요청)
            const res = await fetch("http://localhost:8080/bookbook/rent/create", {
            method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"}, // JSON 형식으로 데이터 전송 명시
                body: JSON.stringify(formData),
            });

            if(res.ok){
                resetForm();
                setShowPopup(true);
            } else {
                // 응답 실패 시 (HTTP 상태코드 4xx, 5xx)
                const errorData = await res.json();
                console.error('책 등록 실패', errorData);
                alert(`책 등록에 실패했습니다. ${errorData.msg || res.statusText}`); // 상세 에러 메시지 표시
            }
        } catch(error) {
            console.error('책 등록 중 네트워크 에러', error);
            alert('책 등록 중 네트워크 에러가 발생했습니다.');
        }
    };

    return (
        // 전체 페이지 컨테이너: 중앙 정렬, 반응형 패딩
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-16 md:py-16 md:px-24 font-inter">
            {/* 폼 컨테이너: 배경, 그림자, 반응형 내부 여백 */}
            <div className="bg-white py-6 px-8 sm:py-8 sm:px-10 md:py-10 md:px-12 rounded-xl shadow-lg w-full max-w-4xl">
                {/* 페이지 제목 */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-left">
                    중고 책 등록하기
                </h1>
                {/* 제목 아래 수평선 */}
                <hr className="border-t-2 border-gray-300 mb-6 sm:mb-8" />

                {/* 폼 섹션 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 글 제목 입력 필드 */}
                    <div>
                        <label htmlFor="postTitle" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            글 제목
                        </label>
                        <input
                            type="text"
                            id="postTitle"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="예: 식탁 위의 세계사 - 한번 읽어보세요!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required // HTML5 기본 유효성 검사: 필수 입력
                        />
                    </div>

                    {/* 책 이미지 업로드 필드 */}
                    <div>
                        <label htmlFor="bookImage" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            책 이미지 업로드
                        </label>
                        <div className="flex flex-col items-start space-y-3">
                            {/* 숨겨진 파일 입력 필드와 연결된 '파일 선택' 버튼 */}
                            <input
                                type="file"
                                id="bookImage"
                                className="hidden" // 기본 파일 입력을 숨김
                                onChange={handleImageChange}
                                accept="image/*" // 이미지 파일만 선택 가능하도록 제한
                            />
                            <label
                                htmlFor="bookImage" // '파일 선택' 버튼(label)을 클릭하면, 브라우저는 자동으로 숨겨진 <input type="file">을 클릭한 것처럼 동작
                                className="w-full sm:w-auto px-4 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer text-center
                                bg-[#D5BAA3] hover:bg-[#C2A794] focus:ring-[#D5BAA3]" // Tailwind 임의 값 색상 및 호버 효과
                            >
                                파일 선택
                            </label>     
                            {/* 이미지 미리보기 */}
                            <img
                                src={previewImageUrl}
                                alt="책 이미지"
                                className="w-[200px] h-[150px] object-cover rounded-lg"
                            />                       
                        </div>
                    </div>

                    {/* 책 상태 및 주소 드롭다운 필드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="bookCondition" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                                책 상태
                            </label>
                            <select
                                id="bookCondition"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                value={bookCondition}
                                onChange={(e) => setBookCondition(e.target.value)}
                                required
                            >
                                <option value="" disabled>선택하세요</option>
                                {conditions.map((cond) => (
                                    <option key={cond} value={cond}>{cond}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                                주소
                            </label>
                            <select
                                id="address"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            >
                                <option value="" disabled>선택하세요</option>
                                {addresses.map((addr) => (
                                    <option key={addr} value={addr}>{addr}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 글 내용 텍스트 영역 */}
                    <div>
                        <label htmlFor="contents" className="block text-gray-700 text-base font-medium mb-2 font-bold">
                            글 내용
                        </label>
                        <textarea
                            id="contents"
                            rows={6} // JSX 규칙: 숫자 타입으로 전달
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y"
                            placeholder="책에 대한 설명, 상태 등을 최대한 자세히 적어주세요."
                            value={contents}
                            onChange={(e) => setContents(e.target.value)}
                            maxLength={500}
                            required
                        ></textarea>
                        {/* 현재/최대 글자 수 표시 */}
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {contents.length}/500
                        </div>
                    </div>

                    {/* '책 검색하기' 기능 섹션 */}
                    <div className="flex flex-col sm:flex-row items-end justify-end sm:space-x-3 space-y-3 sm:space-y-0">
                        <p className="text-sm text-gray-600 text-right sm:text-left italic">
                            책 검색하기 기능으로 간편하게 입력하세요!
                        </p>
                        <button
                            type="button" // 폼 제출 방지
                            className="px-6 py-2 text-white font-semibold rounded-lg shadow-md
                            bg-[#D5BAA3] hover:bg-[#C2A794] focus:ring-[#D5BAA3]"
                            onClick={() => alert('책 검색하기 기능은 아직 구현되지 않았습니다.')}
                        >
                            책 검색하기
                        </button>
                        {/* 향후 계획: 외부 도서 API 활용하여 정보 자동 채우기 */}
                    </div>

                    {/* 책 제목 입력 필드 */}
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

                    {/* 저자 및 출판사 입력 필드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    {/* 카테고리 입력 필드 */}
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

                    {/* '등록하기' 제출 버튼 */}
                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit" // 폼 제출 역할
                            className="w-64 py-3 text-white text-lg font-semibold rounded-lg shadow-md transition duration-200
                            bg-[#D5BAA3] hover:bg-[#C2A794]"
                        >
                            등록하기
                        </button>
                    </div>
                </form>
            </div>
            {/* 팝업 */}
            {showPopup && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" // 배경을 반투명 검은색으로 변경
                  onClick={() => setShowPopup(false)} // 바깥 클릭 시 팝업 닫기
                >
                  <div
                    className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center"
                    onClick={e => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
                  >
                    <div className="mb-6 text-lg font-semibold">
                      글이 작성되었습니다.
                    </div>
                    {/* 글 목록 페이지로 이동하는 버튼 */}
                    <button
                      onClick={() => {
                        setShowPopup(false); // 팝업 닫기
                        router.push(`/bookbook/rent`); // rent 글 목록 페이지로 이동
                      }}
                      className="px-6 py-2 text-white rounded-lg font-bold bg-[#D5BAA3] hover:bg-[#C2A794]"
                    >
                      확인
                    </button>
                  </div>
                </div>
            )}
            </div>
    )
};