"use client";

import React, { useState } from 'react';

interface RentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookTitle: string;
    lenderNickname: string;
    rentId: number; // 대여 게시글 ID를 props로 받습니다.
    borrowerUserId: number | null; // 빌리는 사람의 ID를 props로 받습니다.
}

export default function RentModal({ isOpen, onClose, bookTitle, lenderNickname, rentId, borrowerUserId }: RentModalProps) {
    // formData의 초기 상태를 props에서 가져와 설정합니다.
    // message 필드가 완전히 제거되었습니다.
    const initialFormData = {
        recipient: lenderNickname,
        title: `[대여 신청] ${bookTitle}`,
    };

    const [formData, setFormData] = useState(initialFormData);

    // 모달 내용 초기화 함수
    const resetBookRentModal = () => {
        setFormData(initialFormData); // formData를 초기 상태로 되돌립니다.
    };

    // message 필드가 제거되었으므로, handleInputChange는 더 이상 필요하지 않습니다.
    // 하지만 recipient나 title 필드가 readOnly이므로, 현재 이 함수는 사용되지 않습니다.
    // 혹시 나중에 다른 필드를 추가하거나 수정 가능하게 만들 경우를 대비하여 남겨두었습니다.
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // borrowerUserId가 유효한지 확인합니다.
        if (borrowerUserId === null || borrowerUserId === undefined) {
            console.error('로그인한 사용자 ID를 찾을 수 없습니다. 대여 신청을 할 수 없습니다.');
            // 사용자에게 알림을 표시하는 로직 (예: 토스트 메시지)을 여기에 추가할 수 있습니다.
            return;
        }

        // 현재 날짜를 'YYYY년MM월DD일' 형식으로 생성합니다.
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = today.getDate().toString().padStart(2, '0');
        // 백엔드 LocalDateTime 형식에 맞게 'YYYY-MM-DDTHH:MM:SS' 형태로 변환
        const hours = today.getHours().toString().padStart(2, '0');
        const minutes = today.getMinutes().toString().padStart(2, '0');
        const seconds = today.getSeconds().toString().padStart(2, '0');
        const loanDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;


        // 백엔드로 보낼 데이터 객체를 구성합니다.
        // message 필드는 백엔드 DTO에 없으므로 완전히 제거합니다.
        const requestData = {
            loanDate: loanDate, // 현재 날짜 (LocalDateTime 형식)
            rentId: rentId, // props로 받은 대여 게시글 ID
            // borrowerUserId는 URL 경로에 포함되므로 request body에서는 제거합니다.
            // 백엔드 DTO (RentListCreateRequestDto)에 borrowerUserId 필드가 없습니다.
        };

        try {
            // 대여 신청 API를 호출합니다.
            // borrowerUserId는 URL 경로에 포함됩니다.
            const response = await fetch(`http://localhost:8080/api/v1/user/${borrowerUserId}/rentlist/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 필요하다면 인증 헤더 (예: 'Authorization': `Bearer ${token}`)를 여기에 추가하세요.
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                // HTTP 에러가 발생한 경우
                const errorText = await response.text();
                console.error('대여 신청 실패 응답:', response.status, errorText);
                throw new Error(`대여 신청에 실패했습니다: ${errorText}`);
            }

            // 성공 메시지를 콘솔에 출력하고 모달을 닫고 폼을 초기화합니다.
            console.log('대여 신청이 완료되었습니다.');
            onClose();
            resetBookRentModal();
        } catch (error: any) {
            // 에러 발생 시 콘솔에 출력하고 사용자에게 알립니다.
            console.error('대여 신청 실패:', error);
            console.log(`대여 신청 중 오류가 발생했습니다. 다시 시도해주세요: ${error.message}`);
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
                            resetBookRentModal(); // 모달 닫기 전에 폼 초기화
                            onClose();
                        }}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D5BAA3] focus:border-transparent"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D5BAA3] focus:border-transparent"
                            required
                            readOnly
                        />
                    </div>

                    {/* 대여 신청 메세지 필드가 완전히 제거되었습니다. */}

                    {/* 버튼 영역 */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                resetBookRentModal(); // 취소 버튼 클릭 시 폼 초기화
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 text-gray-600 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#D5BAA3] text-white font-semibold rounded-lg hover:bg-[#C2A794]"
                        >
                            신청하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
