"use client";

import React, { useState } from 'react';

interface RentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookTitle: string;
    lenderNickname: string;
}

export default function RentModal({ isOpen, onClose, bookTitle, lenderNickname }: RentModalProps) {
    const [formData, setFormData] = useState({
        recipient: lenderNickname,
        title: `[대여신청] ${bookTitle}`,
        message: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // 대여 신청 API 호출
            const response = await fetch('http://localhost:8080/bookbook/rent/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('대여 신청에 실패했습니다.');
            }

            alert('대여 신청이 완료되었습니다.');
            onClose();
        } catch (error) {
            console.error('대여 신청 실패:', error);
            alert('대여 신청에 실패했습니다. 다시 시도해주세요.');
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
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* 받는사람 */}
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                            받는사람
                        </label>
                        <input
                            type="text"
                            id="recipient"
                            name="recipient"
                            value={formData.recipient}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D5BAA3] focus:border-transparent"
                            required
                        />
                    </div>

                    {/* 제목 */}
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
                        />
                    </div>

                    {/* 대여 신청 메세지 */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            대여 신청 메세지
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D5BAA3] focus:border-transparent resize-none"
                            placeholder="대여하고 싶은 이유나 조건 등을 자유롭게 작성해주세요."
                            required
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
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