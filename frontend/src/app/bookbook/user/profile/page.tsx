'use client';

import React, { useState } from 'react'; // useEffect 제거

// 메인 React 컴포넌트
export default function App() {
    // 상태 변수 정의
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
    const [nickname, setNickname] = useState('홍길동'); // 닉네임 상태
    const [address, setAddress] = useState('서울특별시 강남구'); // 주소 상태

    // 이메일과 가입일은 변경되지 않으므로 상태로 관리하지 않고 직접 값을 사용합니다.
    const email = 'hong.gildong@example.com';
    const joinDate = '2023-01-01';

    // 원본 값 저장을 위한 상태 (취소 시 복원용) - 초기값을 직접 설정
    const [originalNickname, setOriginalNickname] = useState(nickname);
    const [originalAddress, setOriginalAddress] = useState(address);

    // "수정" 버튼 클릭 핸들러
    const handleEditClick = () => {
        if (!isEditing) { // 현재 수정 모드가 아닐 때만 진입
            setIsEditing(true); // 수정 모드 활성화
        }
        // 이미 수정 모드일 때는 아무 동작 안 함 (확인/취소로만 종료)
    };

    // "닉네임 변경" 버튼 클릭 핸들러
    const handleChangeNicknameClick = () => {
        // 실제 닉네임 변경 로직 (예: 모달 팝업, API 호출 등)
        console.log('닉네임 변경 기능을 구현해야 합니다.'); // 사용자에게 알림 대신 실제 UI로 대체해야 합니다.
        // 필요하다면 닉네임 입력 필드에 포커스
        document.getElementById('nickname')?.focus();
    };

    // "주소 변경" 버튼 클릭 핸들러
    const handleChangeAddressClick = () => {
        // 실제 주소 변경 로직 (예: 모달 팝업, API 호출 등)
        console.log('주소 변경 기능을 구현해야 합니다.'); // 사용자에게 알림 대신 실제 UI로 대체해야 합니다.
        // 필요하다면 주소 입력 필드에 포커스
        document.getElementById('address')?.focus();
    };

    // "확인" 버튼 클릭 핸들러
    const handleConfirmClick = () => {
        if (isEditing) {
            // 수정 모드일 때만 저장 로직 실행
            console.log('변경 사항을 저장합니다:', { nickname, address }); // 실제 저장 로직으로 대체
            // 예: saveProfileChanges(nickname, address);

            // 저장 후 수정 모드 비활성화 및 UI 초기화
            setIsEditing(false);
            setOriginalNickname(nickname); // 변경된 값으로 원본 업데이트
            setOriginalAddress(address);   // 변경된 값으로 원본 업데이트
        } else {
            // 수정 모드가 아닐 때 "확인" 버튼은 단순히 페이지 이동 또는 닫기 역할
            console.log('확인되었습니다.'); // 또는 다른 동작
        }
    };

    // "취소" 버튼 클릭 핸들러
    const handleCancelClick = () => {
        if (isEditing) {
            // 수정 모드일 때만 변경 사항 취소
            console.log('변경 사항을 취소하고 원래대로 되돌립니다.'); // 실제 취소 로직으로 대체
            // 원본 값으로 되돌리는 로직
            setNickname(originalNickname);
            setAddress(originalAddress);

            // 수정 모드 비활성화 및 UI 초기화
            setIsEditing(false);
        } else {
            // 수정 모드가 아닐 때 "취소" 버튼은 단순히 페이지 이동 또는 닫기 역할
            console.log('취소되었습니다.'); // 또는 다른 동작
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-5 bg-gray-100">
            <div className="container bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">홍길동 님</h1>
                    <button
                        id="editProfileBtn"
                        className={`edit-button px-4 py-2 rounded-lg font-medium transition-colors ${
                            isEditing ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                        onClick={handleEditClick}
                    >
                        수정
                    </button>
                </div>

                {/* 닉네임 입력 필드 */}
                <div className="mb-5">
                    <label htmlFor="nickname" className="flex items-center font-medium text-gray-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        닉네임
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            id="nickname"
                            className="flex-grow p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            disabled={!isEditing} // isEditing이 false일 때 비활성화
                        />
                        <button
                            id="changeNicknameBtn"
                            className={`change-button px-5 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                isEditing ? 'bg-gray-700 text-white hover:bg-gray-800' : 'hidden'
                            }`}
                            onClick={handleChangeNicknameClick}
                        >
                            변경
                        </button>
                    </div>
                </div>

                {/* 주소 입력 필드 */}
                <div className="mb-5">
                    <label htmlFor="address" className="flex items-center font-medium text-gray-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        주소
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            id="address"
                            className="flex-grow p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={!isEditing} // isEditing이 false일 때 비활성화
                        />
                        <button
                            id="changeAddressBtn"
                            className={`change-button px-5 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                isEditing ? 'bg-gray-700 text-white hover:bg-gray-800' : 'hidden'
                            }`}
                            onClick={handleChangeAddressClick}
                        >
                            변경
                        </button>
                    </div>
                </div>

                {/* E-mail 입력 필드 (항상 비활성화) */}
                <div className="mb-5">
                    <label htmlFor="email" className="flex items-center font-medium text-gray-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        E-mail
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        value={email}
                        disabled // 항상 비활성화
                    />
                </div>

                {/* 가입일 입력 필드 (항상 비활성화) */}
                <div className="mb-5">
                    <label htmlFor="joinDate" className="flex items-center font-medium text-gray-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                        가입일
                    </label>
                    <input
                        type="text"
                        id="joinDate"
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        value={joinDate}
                        disabled // 항상 비활성화
                    />
                </div>

                {/* 회원 상태 및 매너 점수 */}
                <div className="text-gray-600 text-base mt-4">
                    회원상태: <strong className="text-gray-800 font-semibold">일반회원</strong>
                </div>
                <div className="text-gray-600 text-base mt-2">
                    매너점수: <span className="text-yellow-400 text-xl ml-1">★★★★★</span> 0.0
                </div>

                {/* 하단 버튼 */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        className="footer-button px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-300 text-gray-800 hover:bg-gray-400"
                        onClick={handleConfirmClick}
                    >
                        확인
                    </button>
                    <button
                        className="footer-button px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
                        onClick={handleCancelClick}
                    >
                        취소
                    </button>
                </div>

                {/* 회원 탈퇴 링크 */}
                <div className="text-right mt-5 text-sm">
                    <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">회원탈퇴 &gt;</a>
                </div>
            </div>
        </div>
    );
}
