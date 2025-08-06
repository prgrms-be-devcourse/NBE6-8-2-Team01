// 08.05 현준
// 책 빌리기 기능을 위한 모달

"use client";

import React, { useState } from 'react';

interface RentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookTitle: string;
    lenderNickname: string;
    rentId: number; // 대여 게시글 ID
    borrowerUserId: number | null; // 빌리는 사람의 ID
}

export default function RentModal({ isOpen, onClose, bookTitle, lenderNickname, rentId, borrowerUserId }: RentModalProps) {
    // formData의 초기 상태를 props에서 가져와 설정합니다.
    const initialFormData = {
        recipient: lenderNickname,
        title: `[대여 신청] ${bookTitle}`,
        message: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetBookRentModal = () => {
        setFormData(initialFormData); // formData를 초기화.
    };

    // 모달 내용 변경 함수
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // borrowerUserId가 유효한지 확인.
        if (borrowerUserId === null || borrowerUserId === undefined) {
            alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 현재 날짜를 LocalDateTime 형식으로 생성
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const hours = today.getHours().toString().padStart(2, '0');
            const minutes = today.getMinutes().toString().padStart(2, '0');
            const seconds = today.getSeconds().toString().padStart(2, '0');
            const loanDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

            const requestData = {
                loanDate: loanDate,
                rentId: rentId,
            };

            // fetchInterceptor가 자동으로 BASE_URL 처리와 인증 헤더를 추가해줍니다
            const response = await fetch(`/api/v1/user/${borrowerUserId}/rentlist/create`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            console.log('🔔 대여 신청 응답 상태:', response.status);

            if (!response.ok) {
                let errorMessage = '대여 신청에 실패했습니다.';
                
                try {
                    const errorData = await response.json();
                    console.log('🔍 에러 응답 데이터:', errorData);
                    
                    // 👆 백엔드 응답에서 msg 필드 추출
                    if (errorData && errorData.msg) {
                        errorMessage = errorData.msg;
                    } else if (errorData && typeof errorData === 'object') {
                        // RsData 형태가 아닌 경우를 위한 대안
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    }
                } catch (parseError) {
                    console.error('에러 응답 파싱 실패:', parseError);
                    const errorText = await response.text();
                    console.log('원본 에러 텍스트:', errorText);
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            // 성공 처리
            alert('대여 신청이 완료되었습니다! 승인 결과는 알림 페이지에서 확인하실 수 있습니다.');
            onClose();
            resetBookRentModal();
            
        } catch (error: unknown) {
            console.error('대여 신청 실패:', error);
            
            // fetchInterceptor에서 이미 인증 에러는 처리하므로 다른 에러만 처리
            if (error instanceof Error) {
                if (error.message.includes('재로그인이 필요합니다')) {
                    // fetchInterceptor에서 이미 로그인 모달을 열었으므로 별도 처리 불필요
                    return;
                } else {
                    // 깔끔한 에러 메시지만 표시
                    alert(error.message || '알 수 없는 오류가 발생했습니다.');
                }
            } else {
                // Error 객체가 아닌 경우를 대비
                alert('알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* 헤더 */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">대여 신청</h2>
                    <button
                        onClick={() => {
                            resetBookRentModal();
                            onClose();
                        }}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* 받는사람 (readOnly) */}
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                            받는 사람
                        </label>
                        <input
                            type="text"
                            id="recipient"
                            name="recipient"
                            value={formData.recipient}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D5BAA3] focus:border-transparent bg-gray-50"
                            required
                            readOnly
                        />
                    </div>

                    {/* 제목 (readOnly) */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            제목
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D5BAA3] focus:border-transparent bg-gray-50"
                            required
                            readOnly
                        />
                    </div>

                    {/* 안내 메시지 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-700">
                            📘 대여 신청이 완료되면 책 소유자에게 알림이 전송됩니다.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            승인 결과는 알림 페이지에서 확인하실 수 있습니다.
                        </p>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                resetBookRentModal();
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 text-gray-600 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#D5BAA3] text-white font-semibold rounded-lg hover:bg-[#C2A794] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    신청 중...
                                </>
                            ) : (
                                '신청하기'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}