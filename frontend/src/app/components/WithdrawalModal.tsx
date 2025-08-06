    // components/WithdrawalModal.tsx
    'use client';

    import React, { useEffect } from 'react';
    import Modal from 'react-modal';

    interface WithdrawalModalProps {
        isOpen: boolean;
        onClose: () => void;
        onConfirm: () => void;
    }

    const customModalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
        },
    } as const;

    export default function WithdrawalModal({ isOpen, onClose, onConfirm }: WithdrawalModalProps) {
        useEffect(() => {
            // Set the app element to the body on the client side
            if (typeof window !== 'undefined') {
                Modal.setAppElement('body');
            }
        }, []);

        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                style={customModalStyles}
                contentLabel="회원 탈퇴 확인"
            >
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">계정 비활성화 (회원 탈퇴)</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        정말로 계정을 비활성화 하시겠습니까?
                        <br />
                        이 작업은 되돌릴 수 없습니다.
                    </p>
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300"
                        >
                            탈퇴하기
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-300"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }