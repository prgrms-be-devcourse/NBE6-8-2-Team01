import React from "react";

interface LoginModalProps {
    onClose: () => void;
}

const LoginButton = () => {
    const adminLogin = () => {
        window.location.href = "/admin";
    };

    return (
        <button
            onClick={adminLogin}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#CCAD94] hover:bg-[#AA8B6F] py-2 text-sm font-medium text-white transition-colors"
        >
            새로고침
        </button>
    );
};

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-80 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                    aria-label="닫기"
                >
                    ×
                </button>

                {/* 제목 */}
                <h2 className="text-lg font-bold mb-4 text-center">유효하지 않은 권한입니다</h2>

                <div className="flex flex-col gap-3">
                    <LoginButton />
                </div>
            </div>
        </div>
    );
};

export default LoginModal;