'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: number;
    targetNickname: string;
}

const ReportModal = ({ isOpen, onClose, targetUserId, targetNickname }: ReportModalProps) => {
    const [reportReason, setReportReason] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (reportReason.trim() === '') {
            toast.error('신고 내용을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/bookbook/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: targetUserId,
                    reason: reportReason,
                }),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '신고 제출에 실패했습니다.');
            }
            const result = await response.json();

            // 성공 알림을 먼저 띄웁니다.
            toast.success(result.msg);

            // ✨ setTimeout 없이 바로 모달을 닫습니다.
            onClose();

            setReportReason('');

        } catch (error: unknown) {
            console.error('신고 제출 오류:', error);
            if (error instanceof Error) {
                toast.error(`오류가 발생했습니다: ${error.message}`);
            } else {
                toast.error('알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
                <h2 className="text-xl font-bold mb-4 text-center text-gray-800">{targetNickname}님 신고</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-700 mb-2">신고 사유를 작성해주세요.</p>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full h-32 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="예: 욕설, 비방, 불건전한 행위 등"
                    ></textarea>
                    <div className="mt-4 flex justify-center space-x-2">
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? '신고 처리 중...' : '신고하기'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition-colors shadow-md"
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;