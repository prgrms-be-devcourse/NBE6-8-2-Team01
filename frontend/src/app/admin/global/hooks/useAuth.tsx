import { createContext, use, useEffect, useState } from "react";
import { userRole } from "@/app/admin/dashboard/_types/userResponseDto";
import { authFetch } from "@/app/util/authFetch";
import {dummyFunction} from "@/app/admin/dashboard/_components/common/dummyFunction";

export interface UserLoginResponseDto {
    id: number;
    username: string;
    nickname: string;
    email: string;
    role: userRole;
    avatar?: string
}

export default function useAuth() {
    const [loginMember, setLoginMember] = useState<UserLoginResponseDto>(
        null as unknown as UserLoginResponseDto
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const isLogin = loginMember !== null;
    const isAdmin = isLogin && loginMember.role === "ADMIN";

    useEffect(() => {
        let mounted = true;

        const fetchCurrentUser = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await authFetch(
                    '/api/v1/bookbook/users/me', {}, dummyFunction
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        // 인증되지 않은 사용자
                        setLoginMember(null as unknown as UserLoginResponseDto);
                        setError('해당 기능에 접근하기 위한 권한이 필요합니다.');
                        return;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (mounted && data.data) {
                    setLoginMember(data.data as UserLoginResponseDto);
                }
                
            } catch (err) {
                if (mounted) {
                    console.error('사용자 정보 조회 실패:', err);
                    setError(err instanceof Error ? err.message : '사용자 정보를 불러오는데 실패했습니다.');
                    setLoginMember(null as unknown as UserLoginResponseDto);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }
        
        fetchCurrentUser();

        return () => {
            mounted = false;
        }
    }, []);

    const clearLoginMember = () => {
        setLoginMember(null as unknown as UserLoginResponseDto);
    };

    const logout = (onSuccess: () => void) => {
        authFetch("/api/v1/admin/logout", { method: "DELETE" }, dummyFunction)
            .catch((error) => {
                console.error("Logout error:", error);
            })
            .finally(() => {
                clearLoginMember();
                onSuccess();
            })
    };

    return {
        isLogin,
        isAdmin,
        loginMember,
        logout,
        setLoginMember,
        clearLoginMember,
        loading,
        error
    };
}

export const AuthContext = createContext<ReturnType<typeof useAuth>>(
    null as unknown as ReturnType<typeof useAuth>,
);

export function AuthProvider(
    { children }: Readonly<{ children: React.ReactNode; }>
) {
    const authState = useAuth();

    return <AuthContext value={authState}>{children}</AuthContext>;
}

export function useAuthContext() {
    const authState = use(AuthContext);

    if (authState === null) throw new Error("AuthContext is not found");

    return authState;
}