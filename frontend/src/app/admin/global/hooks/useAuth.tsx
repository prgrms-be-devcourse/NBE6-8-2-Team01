import { createContext, useContext, useEffect, useRef, useState } from "react";
import { userRole } from "@/app/admin/dashboard/_types/userResponseDto";
import "@/app/util/fetchIntercepter";
import { toast } from "react-toastify";

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
    const checked = useRef(false);

    useEffect(() => {
        if (checked.current) {
            return;
        }

        checked.current = true;

        setLoading(true);
        setError("");

        console.log('[useAuth] 사용자 정보 조회 시작...');

        fetch('/api/v1/bookbook/users/me', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(response => {
            console.log('[useAuth] 응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.data) {
                console.log('[useAuth] 사용자 정보 조회 성공:', data.data);
                setLoginMember(data.data as UserLoginResponseDto);
            }
        })
        .catch(err => {
            console.error('[useAuth] 사용자 정보 조회 실패:', err);
            setError(err instanceof Error ? err.message : '사용자 정보를 불러오는데 실패했습니다.');
            setLoginMember(null as unknown as UserLoginResponseDto);
        })
        .finally(() => {
            setLoading(false);
        })
    }, []);

    const clearLoginMember = () => {
        setLoginMember(null as unknown as UserLoginResponseDto);
    };

    const logout = (onSuccess: () => void) => {
        fetch("/api/v1/admin/logout", { method: "DELETE" })
            .then((response) => {
                if (!response.ok) {
                    return;
                }

                toast.success("로그아웃이 완료되었습니다.");
            })
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
    const authState = useContext(AuthContext);

    if (authState === null) throw new Error("AuthContext is not found");

    return authState;
}