// src/app/components/SuspensionModal.tsx

'use client';

import React, { useEffect } from 'react';
import Modal from 'react-modal';

export default function SuspensionModal() {
    // ✅ 수정된 부분: useEffect를 사용하여 DOM에 접근
    useEffect(() => {
        // 이 코드는 클라이언트 측에서 컴포넌트가 마운트될 때 한 번만 실행됩니다.
        Modal.setAppElement('#__next');
    }, []); // 의존성 배열을 비워 컴포넌트가 처음 렌더링될 때만 실행되도록 설정

    const customStyles: Modal.Styles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            border: 'none',
            background: 'none',
            padding: '0',
            overflow: 'visible',
        },
    };

    return (
        <Modal
            isOpen={true}
            style={customStyles}
            contentLabel="회원 정지 알림"
            ariaHideApp={false}
            className="bg-white rounded-lg p-8 shadow-xl max-w-lg mx-auto text-center animate-fade-in-up"
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
            </div>
        </Modal>
    );
}