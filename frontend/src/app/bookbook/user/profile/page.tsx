'use client';

import React, { useState, useEffect } from 'react';

export default function App() {
    // 서버에서 받아올 사용자 정보를 위한 초기 상태
    const [userData, setUserData] = useState({
        id: null, // UserResponseDto의 필드명은 'id'
        username: '', // 백엔드에서 받아올 사용자 이름 (이메일과 다를 수 있음)
        nickname: '로딩중...',
        address: '로딩중...',
        email: '로딩중...',
        rating: 0.0, // 매너 점수 추가
        userStatus: '로딩중...', // 사용자 상태 추가
        createAt: '로딩중...', // 가입일 필드명 변경
    });

    const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
    const [editedNickname, setEditedNickname] = useState(''); // 수정 중인 닉네임
    const [editedAddress, setEditedAddress] = useState('');   // 수정 중인 주소

    // 원본 값 저장을 위한 상태 (취소 시 복원용)
    const [originalNickname, setOriginalNickname] = useState('');
    const [originalAddress, setOriginalAddress] = useState('');

    // 컴포넌트 마운트 시 사용자 정보 로드
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/v1/bookbook/users/me', {
                    credentials: 'include' // 세션 쿠키 전송
                });

                if (response.ok) {
                    const rsData = await response.json(); // RsData 객체 전체를 받음
                    const data = rsData.data; // 실제 UserResponseDto는 data 필드 안에 있음

                    setUserData({
                        id: data.id,
                        username: data.username,
                        nickname: data.nickname,
                        address: data.address || '', // 백엔드에서 null로 올 수 있으니 대비
                        email: data.email,
                        rating: data.rating, // 매너 점수 설정
                        userStatus: data.userStatus, // 사용자 상태 설정
                        createAt: data.createAt ? new Date(data.createAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                        }) : '날짜 없음',
                    });
                    setEditedNickname(data.nickname);
                    setEditedAddress(data.address || '');
                    setOriginalNickname(data.nickname);
                    setOriginalAddress(data.address || '');
                } else if (response.status === 401) {
                    console.log('로그인이 필요합니다.');
                    alert('로그인이 필요합니다.'); // alert 사용
                    // 로그인되지 않은 경우 처리: 로그인 페이지로 리다이렉트 권장
                    // window.location.href = '/bookbook/login'; // 예시
                } else {
                    const errorRsData = await response.json(); // 에러 응답도 RsData 형태일 수 있음
                    console.error('사용자 정보 로드 실패:', errorRsData.msg || response.statusText);
                    alert(`사용자 정보를 불러오는데 실패했습니다: ${errorRsData.msg || '알 수 없는 오류'}`); // alert 사용
                }
            } catch (error) {
                console.error('사용자 정보 로드 중 오류 발생:', error);
                alert('네트워크 오류가 발생했습니다.'); // alert 사용
            }
        };

        fetchUserData();
    }, []); // 컴포넌트 첫 렌더링 시 한 번만 실행

    // "수정" 버튼 클릭 핸들러
    const handleEditClick = () => {
        if (!isEditing) {
            // 수정 모드 진입 시 현재 값을 수정 필드에 로드
            setEditedNickname(userData.nickname);
            setEditedAddress(userData.address);
            setIsEditing(true);
        }
    };

    // 닉네임 변경 시 백엔드 닉네임 중복 확인 (선택 사항)
    const handleCheckNicknameAvailability = async () => {
        if (!editedNickname) {
            alert('닉네임을 입력해주세요.'); // alert 사용
            return;
        }
        if (editedNickname === originalNickname) {
            alert('현재 닉네임과 동일합니다.'); // alert 사용
            return;
        }
        try {
            const response = await fetch(`/api/v1/bookbook/users/check-nickname?nickname=${editedNickname}`);
            if (response.ok) {
                const rsData = await response.json();
                if (rsData.data.isAvailable) { // RsData의 data 필드에서 isAvailable 추출
                    alert('사용 가능한 닉네임입니다.'); // alert 사용
                } else {
                    alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.'); // alert 사용
                }
            } else {
                const errorRsData = await response.json();
                alert(`닉네임 중복 확인 중 오류가 발생했습니다: ${errorRsData.msg || '알 수 없는 오류'}`); // alert 사용
            }
        } catch (error) {
            console.error('닉네임 중복 확인 오류:', error);
            alert('네트워크 오류로 닉네임 중복 확인에 실패했습니다.'); // alert 사용
        }
    };

    // "확인" 버튼 클릭 핸들러 (수정 사항 저장)
    const handleConfirmClick = async () => {
        if (!isEditing) {
            console.log('수정 모드가 아닙니다.');
            alert('수정 모드가 아닙니다.'); // alert 사용
            return;
        }

        // 닉네임 또는 주소 중 하나라도 변경되지 않았다면 업데이트 요청을 보내지 않음
        if (editedNickname === originalNickname && editedAddress === originalAddress) {
            alert('변경할 내용이 없습니다.'); // alert 사용
            setIsEditing(false); // 변경사항 없으면 수정 모드 종료
            return;
        }

        if (!editedNickname || !editedAddress) {
            alert('닉네임과 주소를 모두 입력해주세요.'); // alert 사용
            return;
        }

        try {
            const response = await fetch('/api/v1/bookbook/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nickname: editedNickname,
                    address: editedAddress,
                }),
                credentials: 'include'
            });

            if (response.ok) {
                // 성공적으로 저장되었으면 userData 업데이트
                setUserData(prev => ({
                    ...prev,
                    nickname: editedNickname,
                    address: editedAddress,
                }));
                setOriginalNickname(editedNickname); // 원본도 업데이트
                setOriginalAddress(editedAddress);
                setIsEditing(false); // 수정 모드 종료
                alert('프로필 정보가 성공적으로 업데이트되었습니다.'); // alert 사용
            } else if (response.status === 400 || response.status === 409) { // 400 Bad Request, 409 Conflict (닉네임 중복 등)
                const errorRsData = await response.json();
                alert(`업데이트 실패: ${errorRsData.msg || '입력값이 유효하지 않습니다.'}`); // alert 사용
            } else {
                alert('프로필 업데이트에 실패했습니다.'); // alert 사용
            }
        } catch (error) {
            console.error('프로필 업데이트 중 오류 발생:', error);
            alert('네트워크 오류로 프로필 업데이트에 실패했습니다.'); // alert 사용
        }
    };

    // "취소" 버튼 클릭 핸들러
    const handleCancelClick = () => {
        if (isEditing) {
            setEditedNickname(originalNickname); // 원본 값으로 되돌리기
            setEditedAddress(originalAddress);
            setIsEditing(false); // 수정 모드 비활성화
            alert('변경 사항이 취소되었습니다.'); // alert 사용
        } else {
            // 수정 모드가 아닐 때 "취소" 버튼은 뒤로 가기 또는 홈으로 이동
            window.history.back(); // 또는 window.location.href = '/bookbook';
        }
    };

    // 회원 탈퇴 핸들러
    const handleDeactivateAccount = async (event: React.MouseEvent<HTMLAnchorElement>) => { // 타입 추가
        event.preventDefault(); // 기본 링크 동작 방지

        if (confirm('정말로 계정을 비활성화(회원 탈퇴) 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) { // confirm 사용
            try {
                const response = await fetch('/api/v1/bookbook/users/me', {
                    method: 'DELETE',
                    credentials: 'include' // 세션 쿠키 전송
                });

                if (response.ok) {
                    alert('회원 탈퇴가 성공적으로 처리되었습니다.'); // alert 사용
                    // 백엔드 DELETE /me는 세션 무효화까지는 안 하므로, 로그아웃 URL로 이동
                    window.location.href = '/api/v1/bookbook/users/logout';
                } else if (response.status === 401) {
                    alert('로그인이 필요합니다.'); // alert 사용
                    window.location.href = '/bookbook'; // 로그인 페이지로 리다이렉트
                } else {
                    const errorRsData = await response.json();
                    alert(`회원 탈퇴 실패: ${errorRsData.msg || '알 수 없는 오류'}`); // alert 사용
                }
            } catch (error) {
                console.error('회원 탈퇴 중 오류 발생:', error);
                alert('네트워크 오류로 회원 탈퇴에 실패했습니다.'); // alert 사용
            }
        }
    };

    // 매너 점수를 별표로 변환하는 함수
    const renderRatingStars = (rating: number) => { // 타입 추가
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
                {halfStar && <span className="text-yellow-400">½</span>} {/* 반 별표 유니코드 */}
                {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-300">★</span>)}
            </>
        );
    };

    // 사용자 상태를 한국어로 변환하는 함수
    const getUserStatusKorean = (status: string) => { // 타입 추가
        switch (status) {
            case 'ACTIVE': return '활동 중';
            case 'INACTIVE': return '탈퇴';
            case 'SUSPENDED': return '정지';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-5 bg-gray-100">
            <div className="container bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-8">
                    {/* 사용자 닉네임과 "님" 표시 */}
                    <h1 className="text-3xl font-bold text-gray-800">{userData.nickname} 님</h1>
                    <button
                        id="editProfileBtn"
                        className={`edit-button px-4 py-2 rounded-lg font-medium transition-colors ${
                            isEditing ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                        onClick={handleEditClick}
                        disabled={isEditing} // 수정 모드일 때는 "수정" 버튼 비활성화
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
                            value={isEditing ? editedNickname : userData.nickname}
                            onChange={(e) => setEditedNickname(e.target.value)}
                            disabled={!isEditing}
                        />
                        <button
                            id="changeNicknameBtn"
                            className={`change-button px-5 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                isEditing ? 'bg-gray-700 text-white hover:bg-gray-800' : 'hidden'
                            }`}
                            onClick={handleCheckNicknameAvailability}
                        >
                            중복 확인
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
                            value={isEditing ? editedAddress : userData.address}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            disabled={!isEditing}
                        />
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
                        value={userData.email || ''} // null일 경우 빈 문자열 표시
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
                        value={userData.createAt}
                        disabled // 항상 비활성화
                    />
                </div>

                {/* 회원 상태 및 매너 점수 */}
                <div className="text-gray-600 text-base mt-4">
                    회원상태: <strong className="text-gray-800 font-semibold">{getUserStatusKorean(userData.userStatus)}</strong>
                </div>
                <div className="text-gray-600 text-base mt-2 flex items-center">
                    매너점수: <span className="text-xl ml-1">{renderRatingStars(userData.rating)}</span> <span className="ml-1">{userData.rating.toFixed(1)}</span>
                </div>

                {/* 하단 버튼 */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        className="footer-button px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-700 text-white hover:bg-gray-800"
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
                    <a
                        href="#"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        onClick={handleDeactivateAccount}
                    >
                        회원탈퇴 &gt;
                    </a>
                </div>
            </div>
        </div>
    );
}