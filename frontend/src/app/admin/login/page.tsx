"use client";

import { useState } from "react";
import { Lock, User, Eye, EyeOff, BookOpen, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/admin/global/hooks/useAuth";
import { UnauthorizedModal } from "../adminGuard";

export default function AdminLoginPage() {
    const { setLoginMember } = useAuthContext();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 공백 체크 함수
    const hasSpaceInUsername = username.includes(' ');
    const hasSpaceInPassword = password.includes(' ');
    const hasAnySpace = hasSpaceInUsername || hasSpaceInPassword;

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 공백이 포함된 경우 제출 방지
        if (hasAnySpace) {
            return;
        }

        setIsLoading(true);

        const reqBody = {
            username: username,
            password: password,
        }

        // TODO: 실제 로그인 API 연동
        fetch("http://localhost:8080/api/v1/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
            credentials: "include",
        }).then((response) => response.json())
        .then(data => {
            console.log(data);
            if (data.statusCode !== 200) {
                setShowUnauthorizedModal(true);
                return;
            }

            setLoginMember(data.data);
            router.push("/admin/dashboard");

        }).catch(error => {
            const message = error.message as string;
            if (message.endsWith("fetch")) {
                alert("서버와 연결하지 못했습니다.");
                return;
            }
            console.log(error);
        }).finally(() => {
            setIsLoading(false);
        })
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
                <div className="max-w-md w-full">
                    {/* 브랜드 로고 섹션 */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D5BAA3] rounded-2xl mb-4 shadow-lg">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">북북</h1>
                        <p className="text-gray-600">관리자 로그인</p>
                    </div>

                    {/* 로그인 폼 */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 유저네임 입력 */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    유저명
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={handleUsernameChange}
                                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                            hasSpaceInUsername 
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                        placeholder="유저명을 입력하세요"
                                    />
                                </div>
                                {/* 유저네임 스페이스 경고 */}
                                {hasSpaceInUsername && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                                        <span>유저네임에는 공백이 포함될 수 없습니다.</span>
                                    </div>
                                )}
                            </div>

                            {/* 비밀번호 입력 */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    비밀번호
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                            hasSpaceInPassword 
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                        placeholder="비밀번호를 입력하세요"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {/* 비밀번호 스페이스 경고 */}
                                {hasSpaceInPassword && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                                        <span>비밀번호에는 공백이 포함될 수 없습니다.</span>
                                    </div>
                                )}
                            </div>

                            {/* 로그인 버튼 */}
                            <button
                                type="submit"
                                disabled={isLoading || hasAnySpace}
                                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    isLoading || hasAnySpace
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-[#CCAD94] hover:bg-[#AA8B6F] text-white'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>로그인 중...</span>
                                    </>
                                ) : hasAnySpace ? (
                                    <span>공백을 제거해주세요</span>
                                ) : (
                                    <span>로그인</span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* 하단 정보 */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            © 2025 북북.
                        </p>
                    </div>
                </div>
            </div>
            {showUnauthorizedModal && <UnauthorizedModal />}
        </>
    );
}