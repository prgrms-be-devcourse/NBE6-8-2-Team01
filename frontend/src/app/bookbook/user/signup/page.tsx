'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaMapMarkerAlt } from 'react-icons/fa';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddressSelectionPopup from '../../../components/AddressSelectionPopup';

const SignupPage = () => {
    const router = useRouter();

    const [nickname, setNickname] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

    const [nicknameError, setNicknameError] = useState<string>('');
    const [nicknameCheckStatus, setNicknameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [formError, setFormError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false); // Add state for popup

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNickname(value);
        setNicknameError('');
        setNicknameCheckStatus('idle');

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (value.trim()) {
            setNicknameCheckStatus('checking');
            debounceTimeoutRef.current = setTimeout(() => {
                handleNicknameCheck(value);
            }, 500);
        }
    };

    const handleNicknameCheck = async (nicknameToCheck: string) => {
        if (!nicknameToCheck.trim()) {
            setNicknameError('닉네임을 입력해주세요.');
            setNicknameCheckStatus('unavailable');
            toast.error('닉네임을 입력해주세요!');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/check-nickname?nickname=${encodeURIComponent(nicknameToCheck)}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                let errorMessage = '닉네임 중복 확인 실패';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    console.error('Failed to parse error response:', jsonError);
                }

                setNicknameCheckStatus('unavailable');
                setNicknameError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            const rsData = await response.json();

            if (rsData.data.isAvailable) {
                setNicknameCheckStatus('available');
                setNicknameError('');
                toast.success('사용 가능한 닉네임입니다!');
            } else {
                setNicknameCheckStatus('unavailable');
                setNicknameError('이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.');
                toast.warn('이미 사용 중인 닉네임입니다.');
            }
        } catch (error) {
            let errorMessage = '알 수 없는 오류가 발생했습니다.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (errorMessage === '재로그인이 필요합니다.') {
                toast.warn('세션이 만료되었습니다. 다시 로그인해 주세요.');
                setNicknameError('');
            } else {
                toast.error(`오류: ${errorMessage}`);
                setNicknameError(`닉네임 중복 확인 중 오류가 발생했습니다: ${errorMessage}`);
            }

            setNicknameCheckStatus('unavailable');
            console.error('Nickname check error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loading) return;

        if (!nickname.trim()) {
            setNicknameError('닉네임을 입력해주세요.');
            toast.error('닉네임을 입력해주세요!');
            return;
        }
        if (nicknameCheckStatus !== 'available') {
            setNicknameError('닉네임 중복 확인을 완료하거나 유효한 닉네임을 입력해주세요.');
            toast.error('사용 가능한 닉네임인지 확인해주세요!');
            return;
        }
        if (!address.trim()) {
            setFormError('주소를 입력해주세요.');
            toast.error('주소를 입력해주세요!');
            return;
        }
        if (!agreedToTerms) {
            setFormError('이용약관에 동의해야 합니다.');
            toast.error('이용약관에 동의해야 합니다!');
            return;
        }

        setFormError('');
        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/users/me`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nickname, address }),
                }
            );

            if (!response.ok) {
                let errorMessage = '회원 정보 업데이트 실패';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    console.error('Failed to parse error response:', jsonError);
                }

                setFormError(errorMessage);
                toast.error(errorMessage);
                return;
            }

            toast.success('회원 가입이 완료되었습니다.');
            router.push('/bookbook');

        } catch (error) {
            let errorMessage = '알 수 없는 오류가 발생했습니다.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (errorMessage === '재로그인이 필요합니다.') {
                toast.warn('세션이 만료되었습니다. 다시 로그인해 주세요.');
            } else {
                toast.error(`정보 업데이트 실패: ${errorMessage}`);
            }

            setFormError(`정보 업데이트에 실패했습니다: ${errorMessage}`);
            console.error('User info update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // New functions to handle the popup
    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleSelectAddress = (selectedAddress: string) => {
        setAddress(selectedAddress);
        setFormError('');
        handleClosePopup();
    };

    return (
        <div className="font-sans bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="signup-container bg-white p-8 sm:px-10 rounded-lg shadow-lg w-full max-w-lg text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">추가 정보 입력</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="nickname" className="flex items-center font-bold text-gray-700 mb-2 text-lg">
                            <FaUser className="text-xl mr-2" /> 닉네임
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                placeholder="닉네임을 입력하세요 (2~10자)"
                                value={nickname}
                                onChange={handleNicknameChange}
                                className="flex-grow p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-12"
                                maxLength={10}
                                disabled={loading}
                            />
                        </div>
                        {nicknameCheckStatus === 'checking' && <p className="text-blue-500 text-sm mt-1">닉네임 중복 확인 중...</p>}
                        {nicknameCheckStatus === 'available' && (
                            <p className="text-green-500 text-sm mt-1">✔ 사용 가능한 닉네임입니다.</p>
                        )}
                        {nicknameCheckStatus === 'unavailable' && nicknameError && (
                            <p className="text-red-500 text-sm mt-1">✖ {nicknameError}</p>
                        )}
                    </div>
                    {/* 주소 입력 필드 (modified) */}
                    <div className="mb-6">
                        <label htmlFor="address" className="flex items-center font-bold text-gray-700 mb-2 text-lg">
                            <FaMapMarkerAlt className="text-xl mr-2" /> 주소
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="address"
                                name="address"
                                placeholder="주소를 선택하세요"
                                value={address}
                                readOnly
                                className="flex-grow p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-12 bg-gray-50 cursor-pointer"
                                onClick={handleOpenPopup}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={handleOpenPopup}
                                className="p-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300 h-12"
                                disabled={loading}
                            >
                                주소 찾기
                            </button>
                        </div>
                    </div>
                    {/* 이용약관 동의 섹션 */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-700 mb-2 text-lg">이용약관 동의</h3>
                        <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-48 overflow-y-auto text-sm text-gray-600 mb-4">
                            <p className="mb-2">
                                <strong>북북 서비스 이용약관</strong>
                            </p>
                            <p className="mb-2">
                                <strong>제1조 (목적)</strong> 본 약관은 &quot;북북&quot; (이하 &quot;회사&quot;)이 제공하는 독서 기록, 커뮤니티 활동, 도서 정보 공유 등의 모든 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 회원의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                            </p>
                            <p className="mb-2">
                                <strong>제2조 (회원가입 및 자격)</strong> 1. 회원이 되고자 하는 자는 본 약관에 동의하고, 회사가 정하는 가입 양식에 따라 개인 정보를 기입함으로써 회원가입을 신청합니다. 2. 회사는 전항의 신청에 대하여 업무 수행상 또는 기술상 지장이 없는 경우에 한하여 승낙합니다. 3. 다음 각 호의 1에 해당하는 경우, 회사는 회원가입 승낙을 유보 또는 거절할 수 있습니다.
                                <br /> (1) 다른 사람의 명의를 사용하거나 허위 정보를 기재한 경우
                                <br /> (2) 사회의 안녕과 질서 또는 미풍양속을 저해할 목적으로 신청한 경우
                                <br /> (3) 기타 회사가 정한 요건이 미비된 경우
                            </p>
                            <p className="mb-2">
                                <strong>제3조 (서비스 이용 및 제한)</strong> 1. 회원은 본 약관 및 회사의 정책에 따라 서비스를 이용할 수 있습니다. 2. 회원은 서비스를 이용함에 있어 관계 법령, 본 약관의 규정, 이용 안내 및 서비스와 관련하여 회사가 통지하는 사항 등을 준수하여야 합니다. 3. 회원은 다음 각 호의 행위를 하여서는 안 됩니다.
                                <br /> (1) 타인의 정보를 도용하는 행위
                                <br /> (2) &quot;북북&quot; 서비스의 정상적인 운영을 방해하는 행위
                                <br /> (3) 불법적인 홍보 또는 스팸 행위
                                <br /> (4) 기타 관계 법령에 위배되거나 공서양속에 저해되는 행위
                            </p>
                            <p className="mb-2">
                                <strong>제4조 (개인정보 보호)</strong> 회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
                            </p>
                            <p className="mb-2">
                                <strong>제5조 (게시물의 관리)</strong> 회원이 서비스에 게시하거나 등록하는 게시물로 인해 발생하는 모든 책임은 회원 본인에게 있으며, 회사는 회원의 게시물이 다음 각 호의 1에 해당한다고 판단되는 경우 사전 통지 없이 삭제할 수 있습니다.
                                <br /> (1) 다른 회원 또는 제3자를 비방하거나 명예를 훼손하는 내용인 경우
                                <br /> (2) 공공질서 및 미풍양속에 위반되는 내용인 경우
                                <br /> (3) 범죄적 행위에 결부된다고 인정되는 내용인 경우
                                <br /> (4) 회사의 저작권, 제3자의 저작권 등 기타 권리를 침해하는 내용인 경우
                                <br /> (5) 기타 관계 법령에 위반된다고 판단되는 경우
                            </p>
                            <p className="mb-2">
                                <strong>제6조 (계약 해지 및 이용 제한)</strong> 1. 회원은 언제든지 서비스 이용 계약 해지를 신청할 수 있으며, 회사는 관련 법령 등이 정하는 바에 따라 이를 즉시 처리하여야 합니다. 2. 회원이 다음 각 호의 1에 해당하는 경우, 회사는 서비스 이용을 제한하거나 해지할 수 있습니다.
                                <br /> (1) 제2조 3항에 해당하는 경우
                                <br /> (2) 제3조 3항에 해당하는 경우
                                <br /> (3) 서비스 운영을 고의로 방해한 경우
                            </p>
                            <p className="text-center font-semibold mt-4">--- 약관 내용의 끝 ---</p>
                        </div>
                        <label htmlFor="agreeTerms" className="flex items-center text-gray-700">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreedToTerms}
                                onChange={(e) => {
                                    setAgreedToTerms(e.target.checked);
                                    setFormError('');
                                }}
                                className="mr-2 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={loading}
                            />
                            이용약관에 동의합니다.
                        </label>
                    </div>

                    {formError && <p className="text-red-500 text-center text-sm mb-4">{formError}</p>}

                    <button
                        type="submit"
                        className="w-full p-4 bg-gray-800 text-white font-bold text-lg rounded-md cursor-pointer
                      hover:bg-gray-700 transition-colors duration-300"
                        disabled={loading}
                    >
                        {loading ? '처리 중...' : '정보 업데이트 및 가입 완료'}
                    </button>
                </form>
            </div>

            {/* Render the AddressSelectionPopup */}
            <AddressSelectionPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                onSelectAddress={handleSelectAddress}
            />
        </div>
    );
};

export default SignupPage;