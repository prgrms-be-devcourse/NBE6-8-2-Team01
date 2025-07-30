'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../utils/apiClient'; // apiClient 경로에 맞게 조정

// UserResponseDto 타입 정의
interface UserResponseDto {
    id: number;
    username: string;
    nickname: string;
    address: string | null;
    email: string;
    rating: number;
    userStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    createAt: string;
}

export default function MyPage() {
    const router = useRouter();

    const [userData, setUserData] = useState<UserResponseDto | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedNickname, setEditedNickname] = useState<string>('');
    const [editedAddress, setEditedAddress] = useState<string>(''); // string 타입 유지

    const [originalNickname, setOriginalNickname] = useState<string>('');
    const [originalAddress, setOriginalAddress] = useState<string>(''); // string 타입 유지

    const [nicknameCheckStatus, setNicknameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const [nicknameCheckMessage, setNicknameCheckMessage] = useState<string>('');
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const rsData = await apiClient<UserResponseDto>('/api/v1/bookbook/users/me');
                const data = rsData.data;

                setUserData({
                    id: data.id,
                    username: data.username,
                    nickname: data.nickname,
                    address: data.address || '',
                    email: data.email,
                    rating: data.rating,
                    userStatus: data.userStatus,
                    createAt: data.createAt ? new Date(data.createAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                    }) : '날짜 없음',
                });
                // setEditedNickname, setEditedAddress 등에도 null 방지
                setEditedNickname(data.nickname);
                setEditedAddress(data.address || ''); // 여기서 string | null -> string으로 변환
                setOriginalNickname(data.nickname);
                setOriginalAddress(data.address || ''); // 여기서 string | null -> string으로 변환
                setNicknameCheckStatus('idle');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
                console.error('사용자 정보 로드 중 오류 발생:', error);
                toast.error(`사용자 정보를 불러오는데 실패했습니다: ${errorMessage}`);
            }
        };

        void fetchUserData();
    }, [router]);

    // 닉네임 입력 변경 핸들러 (디바운싱 적용)
    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditedNickname(value);
        setNicknameCheckMessage('');
        setNicknameCheckStatus('idle');

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (value.trim() && value !== originalNickname) {
            setNicknameCheckStatus('checking');
            debounceTimeoutRef.current = setTimeout(() => {
                // 비동기 함수 호출 시 반환되는 Promise를 명시적으로 무시 (ESLint 경고 방지)
                void checkNicknameAvailability(value);
            }, 500);
        } else if (value.trim() === originalNickname) {
            setNicknameCheckStatus('available');
            setNicknameCheckMessage('현재 닉네임과 동일합니다.');
        }
    };

    // 닉네임 중복 확인 비동기 함수
    const checkNicknameAvailability = async (nicknameToCheck: string) => {
        if (!nicknameToCheck.trim()) {
            setNicknameCheckMessage('닉네임을 입력해주세요.');
            setNicknameCheckStatus('unavailable');
            return;
        }

        try {
            const rsData = await apiClient<{ isAvailable: boolean }>(`/api/v1/bookbook/users/check-nickname?nickname=${encodeURIComponent(nicknameToCheck)}`);
            if (rsData.data && rsData.data.isAvailable) {
                setNicknameCheckStatus('available');
                setNicknameCheckMessage('사용 가능한 닉네임입니다.');
            } else {
                setNicknameCheckStatus('unavailable');
                setNicknameCheckMessage('이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setNicknameCheckStatus('unavailable');
            setNicknameCheckMessage(`중복 확인 중 오류: ${errorMessage}`);
            console.error('닉네임 중복 확인 오류:', error);
        }
    };


    // "수정" 버튼 클릭 핸들러
    const handleEditClick = () => {
        if (userData) {
            setEditedNickname(userData.nickname);
            setEditedAddress(userData.address || ''); // null일 경우 빈 문자열로 대체
            setOriginalNickname(userData.nickname);
            setOriginalAddress(userData.address || ''); // null일 경우 빈 문자열로 대체
            setIsEditing(true);
            setNicknameCheckStatus('idle');
            setNicknameCheckMessage('');
        }
    };

    // "확인" 버튼 클릭 핸들러 (수정 사항 저장)
    const handleConfirmClick = async () => {
        if (!isEditing) {
            toast.warn('수정 모드가 아닙니다.');
            return;
        }

        const trimmedNickname = editedNickname.trim();
        const trimmedAddress = editedAddress.trim();

        // 닉네임 유효성 검사 (변경이 있을 경우에만 중복 확인 상태 확인)
        if (trimmedNickname !== originalNickname && nicknameCheckStatus !== 'available') {
            toast.error('닉네임 중복 확인이 필요하거나 유효하지 않습니다.');
            return;
        }

        if (trimmedNickname === '' && trimmedAddress === '') {
            toast.warn('닉네임 또는 주소를 입력해주세요.');
            return;
        }

        if (trimmedNickname === originalNickname && trimmedAddress === originalAddress) {
            toast.info('변경할 내용이 없습니다.');
            setIsEditing(false);
            return;
        }

        const requestBody : {nickname?: string; address?: string} = {};

        if (trimmedNickname !== originalNickname) {
            requestBody.nickname = trimmedNickname;
        }

        if (trimmedAddress !== originalAddress) {
            requestBody.address = trimmedAddress;
        }

        try {
            await apiClient('/api/v1/bookbook/users/me', {
                method: 'PATCH',
                body: JSON.stringify(requestBody),
            });

            // userData 업데이트 시에도 string | null -> string으로 변환
            setUserData(prev => prev ? {
                ...prev,
                ...(requestBody.nickname ? { nickname: requestBody.nickname } : {}),
                // address는 항상 string으로 저장되도록 보장
                ...(requestBody.address !== undefined ? { address: requestBody.address } : {}),
            } : null);

            // originalNickname/Address 업데이트 시에도 string | null -> string으로 변환
            setOriginalNickname(requestBody.nickname || originalNickname);
            setOriginalAddress(requestBody.address || originalAddress); // null을 string으로 처리

            setIsEditing(false);
            setNicknameCheckStatus('idle');
            setNicknameCheckMessage('');
            toast.success('프로필 정보가 성공적으로 업데이트되었습니다.');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('프로필 업데이트 중 오류 발생:', error);
            toast.error(`프로필 업데이트 실패: ${errorMessage}`);
        }
    };

    // "취소" 버튼 클릭 핸들러
    const handleCancelClick = () => {
        if (isEditing) {
            setEditedNickname(originalNickname);
            setEditedAddress(originalAddress);
            setIsEditing(false);
            setNicknameCheckStatus('idle');
            setNicknameCheckMessage('');
            toast.info('변경 사항이 취소되었습니다.');
        } else {
            router.back();
        }
    };

    // 회원 탈퇴 핸들러
    const handleDeactivateAccount = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        // 사용자에게 최종 확인을 요청 (기존 confirm 유지)
        if (confirm('정말로 계정을 비활성화(회원 탈퇴) 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            // toast.promise를 사용하여 비동기 작업 진행 상황 표시
            const promise = apiClient('/api/v1/bookbook/users/me', {
                method: 'DELETE',
            });

            toast.promise(
                promise,
                {
                    pending: '회원 탈퇴를 진행 중입니다...',
                    success: '✅ 회원 탈퇴가 성공적으로 완료되었습니다! 북북과 함께해주셔서 감사합니다.',
                    error: {
                        render({ data }) {
                            // data는 catch 블록에서 던져진 Error 객체입니다.
                            const errorMessage = data instanceof Error ? data.message : '알 수 없는 오류가 발생했습니다.';
                            console.error('회원 탈퇴 중 오류:', data); // 원본 에러 로깅
                            return `❌ 회원 탈퇴 실패: ${errorMessage}`;
                        }
                    }
                }
            )
                .then(() => {
                    // Promise가 성공적으로 완료되면 로그인 페이지로 리다이렉트
                    // (백엔드 DELETE /me는 세션 무효화까지는 안 하므로, 로그아웃 URL로 이동)
                    router.push('/api/v1/bookbook/users/logout');
                })
                .catch(() => { // 'error'를 '_error'로 변경하여 의도적으로 사용되지 않음을 표시
                });
        }
    };

    // 매너 점수를 별표로 변환하는 함수
    const renderRatingStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
                {halfStar && <span className="text-yellow-400">½</span>}
                {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-300">★</span>)}
            </>
        );
    };

    // 사용자 상태를 한국어로 변환하는 함수
    const getUserStatusKorean = (status: UserResponseDto['userStatus']) => {
        switch (status) {
            case 'ACTIVE': return '활동 중';
            case 'INACTIVE': return '탈퇴';
            case 'SUSPENDED': return '정지';
            default: return status;
        }
    };

    if (!userData) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p>사용자 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center p-5 bg-gray-100">
            <div className="container bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{userData.nickname} 님</h1>
                    <button
                        id="editProfileBtn"
                        className={`edit-button px-4 py-2 rounded-lg font-medium transition-colors ${
                            isEditing ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                        onClick={handleEditClick}
                        disabled={isEditing}
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
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                id="nickname"
                                className="flex-grow p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                value={isEditing ? editedNickname : userData.nickname}
                                onChange={handleNicknameChange}
                                disabled={!isEditing}
                            />
                        </div>
                        {isEditing && nicknameCheckStatus !== 'idle' && (
                            <p className={`text-sm mt-1
                                ${nicknameCheckStatus === 'checking' ? 'text-blue-500' : ''}
                                ${nicknameCheckStatus === 'available' ? 'text-green-500' : ''}
                                ${nicknameCheckStatus === 'unavailable' ? 'text-red-500' : ''}
                            `}>
                                {nicknameCheckStatus === 'checking' && '닉네임 중복 확인 중...'}
                                {nicknameCheckStatus !== 'checking' && nicknameCheckMessage}
                            </p>
                        )}
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
                            value={isEditing ? editedAddress : userData.address || ''} // ★★★ 이 부분 수정 ★★★
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
                        value={userData.email || ''} // ★★★ 이 부분 수정 (명시적으로 || '' 추가) ★★★
                        disabled
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
                        value={userData.createAt || ''} // ★★★ 이 부분 수정 (명시적으로 || '' 추가) ★★★
                        disabled
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
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}