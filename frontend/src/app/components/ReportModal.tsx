"use client";

import React, { useState } from 'react';

// ⭐ 신고 모달 컴포넌트의 props 타입을 정의합니다.
interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: number;
    targetNickname: string;
}

const ReportModal = ({ isOpen, onClose, targetUserId, targetNickname }: ReportModalProps) => {
    // 신고 내용을 저장하는 상태
    const [reportReason, setReportReason] = useState<string>('');

    // 모달이 열려 있지 않으면 아무것도 렌더링하지 않습니다.
    if (!isOpen) {
        return null;
    }

    // 신고 버튼 클릭 시 호출될 함수
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (reportReason.trim() === '') {
            console.warn('신고 내용을 입력해주세요.');
            return;
        }

        // ⭐ 더미 데이터와 함께 신고 정보를 콘솔에 출력
        console.log(`사용자 ID ${targetUserId} (${targetNickname}) 신고: ${reportReason}`);

        // 실제 API 호출 로직은 여기에 추가합니다.
        // await fetch('/api/report', { ... });

        alert('신고가 접수되었습니다.');
        setReportReason(''); // 입력 필드 초기화
        onClose(); // 모달 닫기
    };

    return (
        // 모달 오버레이. z-index: 60으로 다른 모달 위에 뜹니다.
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in">
            {/* 모달 본체 */}
            <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-sm relative">

                {/* 닫기 버튼 */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>

                {/* ⭐ 신고 대상 닉네임이 포함된 제목 */}
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
                            className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-md"
                        >
                            신고하기
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


// ⭐ 모달 사용을 보여주기 위한 부모 컴포넌트
export default function App() {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // ⭐ 신고 대상 더미 데이터
    const dummyUser = { id: 123, nickname: '책 빌려줘요' };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 font-inter">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">신고 모달 테스트</h1>
            <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 shadow-lg transition-colors"
            >
                신고 모달 열기
            </button>

            {/* ⭐ 독립적으로 렌더링되는 ReportModal */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetUserId={dummyUser.id}
                targetNickname={dummyUser.nickname}
            />
        </div>
    );
}
