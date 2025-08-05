'use client';

import React from 'react';
import Modal from 'react-modal';

export default function SuspensionModal({ onClose }: { onClose: () => void }) {
    return (
        <Modal
            isOpen={true}
            contentLabel="회원 정지 알림"
            ariaHideApp={false}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 shadow-xl max-w-lg mx-auto text-center animate-fade-in-up"
            overlayClassName="fixed inset-0 bg-transparent flex items-center justify-center z-50"
            onRequestClose={onClose}
        >
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-lg mx-auto text-center">
                <h2 className="text-3xl font-bold text-red-600 mb-4">
                    🚨 회원 정지 알림
                </h2>
                <p className="text-gray-700 text-lg mb-6">
                    회원님의 계정은 현재 **관리자에 의해 정지**되었습니다.
                </p>
                <p className="text-gray-600 text-md mb-8">
                    서비스 이용이 불가능하며, 해제 관련 문의는 고객센터로 연락해주시기 바랍니다.
                </p>
                <div className="p-4 bg-gray-100 rounded-lg text-left">
                    <p className="font-semibold text-gray-800">고객센터 정보</p>
                    <p className="text-sm text-gray-600 mt-1">이메일: help@bookbook.com</p>
                    <p className="text-sm text-gray-600">전화: 02-1234-5678</p>
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                    확인
                </button>
            </div>
        </Modal>
    );
}