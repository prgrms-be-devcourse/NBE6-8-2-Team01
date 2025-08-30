'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 새로운 모달 컴포넌트 import
import WithdrawalModal from '../../../components/WithdrawalModal';
import AddressSelectionPopup from '../../../components/AddressSelectionPopup';


// 인터페이스와 기타 함수는 동일합니다.
// ... (이전 코드와 동일)
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

export default function MyPage(): React.JSX.Element | null {
    const router = useRouter();

    const [userData, setUserData] = useState<UserResponseDto | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedNickname, setEditedNickname] = useState<string>('');
    const [editedAddress, setEditedAddress] = useState<string>('');

    const [originalNickname, setOriginalNickname] = useState<string>('');
    const [originalAddress, setOriginalAddress] = useState<string>('');

    const [nicknameCheckStatus, setNicknameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const [nicknameCheckMessage, setNicknameCheckMessage] = useState<string>('');
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // 회원 탈퇴 모달 상태를 위한 state 추가
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 약간의 지연을 두어 하이드레이션이 완료된 후 렌더링
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/me`);
                if (!response.ok) {
                    throw new Error(response.statusText || '사용자 정보 로드 실패');
                }
                const resData = await response.json();
                const data = resData.data;

                const formattedUserData = {
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
                };
                setUserData(formattedUserData);
                setEditedNickname(data.nickname);
                setEditedAddress(data.address || '');
                setOriginalNickname(data.nickname);
                setOriginalAddress(data.address || '');
                setNicknameCheckStatus('idle');
            } catch (error: unknown) {
                let errorMessage = '알 수 없는 오류가 발생했습니다.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                console.error('사용자 정보 로드 중 오류 발생:', error);
                toast.error(`사용자 정보를 불러오는데 실패했습니다: ${errorMessage}`);
            }
        };

        fetchUserData();
    }, [mounted]);

    // 서버 사이드 렌더링 중에는 아무것도 렌더링하지 않음
    if (!mounted) {
        return null;
    }

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
                checkNicknameAvailability(value);
            }, 500);
        } else if (value.trim() === originalNickname) {
            setNicknameCheckStatus('available');
            setNicknameCheckMessage('현재 닉네임과 동일합니다.');
        }
    };

    const checkNicknameAvailability = async (nicknameToCheck: string) => {
        if (!nicknameToCheck.trim()) {
            setNicknameCheckMessage('닉네임을 입력해주세요.');
            setNicknameCheckStatus('unavailable');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/check-nickname?nickname=${encodeURIComponent(nicknameToCheck)}`);

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || '닉네임 중복 확인 실패';
                setNicknameCheckStatus('unavailable');
                setNicknameCheckMessage(errorMessage);
                console.error('닉네임 중복 확인 오류:', errorMessage);
                return;
            }

            const rsData = await response.json();
            if (rsData && rsData.data.isAvailable) {
                setNicknameCheckStatus('available');
                setNicknameCheckMessage('사용 가능한 닉네임입니다.');
            } else {
                setNicknameCheckStatus('unavailable');
                setNicknameCheckMessage('이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.');
            }
        } catch (error: unknown) {
            let errorMessage = '알 수 없는 오류가 발생했습니다.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setNicknameCheckStatus('unavailable');
            setNicknameCheckMessage(`중복 확인 중 오류: ${errorMessage}`);
            console.error('닉네임 중복 확인 오류:', error);
        }
    };

    const handleEditClick = () => {
        if (userData) {
            setEditedNickname(userData.nickname);
            setEditedAddress(userData.address || '');
            setOriginalNickname(userData.nickname);
            setOriginalAddress(userData.address || '');
            setIsEditing(true);
            setNicknameCheckStatus('idle');
            setNicknameCheckMessage('');
        }
    };

    const handleConfirmClick = async () => {
        if (!isEditing) {
            toast.warn('수정 모드가 아닙니다.');
            return;
        }

        const trimmedNickname = editedNickname.trim();
        const trimmedAddress = editedAddress.trim();

        if (trimmedNickname !== originalNickname && nicknameCheckStatus !== 'available') {
            toast.error('닉네임 중복 확인이 필요하거나 유효하지 않습니다.');
            return;
        }

        if (!trimmedNickname && !trimmedAddress) {
            toast.warn('닉네임 또는 주소를 입력해주세요.');
            return;
        }

        if (trimmedNickname === originalNickname && trimmedAddress === originalAddress) {
            toast.info('변경할 내용이 없습니다.');
            setIsEditing(false);
            return;
        }

        const requestBody: { nickname?: string; address?: string } = {};

        if (trimmedNickname !== originalNickname) {
            requestBody.nickname = trimmedNickname;
        }

        if (trimmedAddress !== originalAddress) {
            requestBody.address = trimmedAddress;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || '프로필 업데이트 실패';
                throw new Error(errorMessage);
            }

            setUserData(prev => prev ? {
                ...prev,
                nickname: requestBody.nickname !== undefined ? requestBody.nickname : prev.nickname,
                address: requestBody.address !== undefined ? requestBody.address : prev.address,
            } : null);

            setOriginalNickname(requestBody.nickname !== undefined ? requestBody.nickname : originalNickname);
            setOriginalAddress(requestBody.address !== undefined ? requestBody.address : originalAddress);

            setIsEditing(false);
            setNicknameCheckStatus('idle');
            setNicknameCheckMessage('');
            toast.success('프로필 정보가 성공적으로 업데이트되었습니다.');

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('프로필 업데이트 중 오류 발생:', error);
            toast.error(`프로필 업데이트 실패: ${errorMessage}`);
        }
    };

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

    // 회원 탈퇴 버튼 클릭 시 모달을 여는 핸들러
    const handleOpenWithdrawalModal = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setIsWithdrawalModalOpen(true);
    };

    // 회원 탈퇴 모달에서 취소 버튼 클릭 시 모달을 닫는 핸들러
    const handleCloseWithdrawalModal = () => {
        setIsWithdrawalModalOpen(false);
    };

    // 회원 탈퇴 모달에서 확인 버튼 클릭 시 실제 탈퇴 로직 실행
    const handleConfirmDeactivateAccount = () => {
        // 모달 닫기
        handleCloseWithdrawalModal();

        if (userData?.userStatus === 'SUSPENDED') {
            toast.error('❌ 정지된 계정은 탈퇴할 수 없습니다.');
            return;
        }

        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/me`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    let errorMessage = '회원 탈퇴 실패';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                    }
                    reject(new Error(errorMessage));
                    return;
                }

                resolve(response);
            } catch (error) {
                reject(error);
            }
        });

        toast.promise(
            deletePromise,
            {
                pending: '회원 탈퇴를 진행 중입니다...',
                success: '북북과 함께해주셔서 감사합니다.',
                error: {
                    render({ data }) {
                        const errorMessage = data instanceof Error ? data.message : '알 수 없는 오류가 발생했습니다.';
                        console.error('회원 탈퇴 중 오류:', data);
                        return `❌ 회원 탈퇴 실패: ${errorMessage}`;
                    }
                }
            }
        ).then(() => {
            router.push('/api/v1/bookbook/users/logout');
        }).catch(() => {
        });
    };

    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleSelectAddress = (selectedAddress: string) => {
        setEditedAddress(selectedAddress);
        handleClosePopup();
    };

    const renderRatingStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

        return (
            <>
                {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
                {halfStar && <span className="text-yellow-400">½</span>}
                {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-300">★</span>)}
            </>
        );
    };

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
                            value={isEditing ? editedAddress : userData.address || ''}
                            readOnly
                            onClick={isEditing ? handleOpenPopup : undefined}
                            disabled={!isEditing}
                        />
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleOpenPopup}
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300"
                            >
                                주소 찾기
                            </button>
                        )}
                    </div>
                </div>

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
                        value={userData.email || ''}
                        disabled
                    />
                </div>

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
                        value={userData.createAt || ''}
                        disabled
                    />
                </div>

                <div className="text-gray-600 text-base mt-4">
                    회원상태: <strong className="text-gray-800 font-semibold">{getUserStatusKorean(userData.userStatus)}</strong>
                </div>
                <div className="text-gray-600 text-base mt-2 flex items-center">
                    매너점수: <span className="text-xl ml-1">{renderRatingStars(userData.rating)}</span> <span className="ml-1">{userData.rating.toFixed(1)}</span>
                </div>

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

                <div className="text-right mt-5 text-sm">
                    <a
                        href="#"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        onClick={handleOpenWithdrawalModal} // 모달을 여는 함수로 변경
                    >
                        회원탈퇴 &gt;
                    </a>
                </div>
            </div>

            <AddressSelectionPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                onSelectAddress={handleSelectAddress}
            />
            {/* 커스텀 회원 탈퇴 모달 컴포넌트 추가 */}
            <WithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={handleCloseWithdrawalModal}
                onConfirm={handleConfirmDeactivateAccount}
            />
        </div>
    );
}