import { createContext, use, useEffect, useState } from "react";
import {userRole, userStatus} from "@/app/admin/dashboard/_types/userResponseDto";
import apiClient from "@/app/bookbook/user/utils/apiClient";

export interface UserLoginResponseDto {
    id: number;
    username: string;
    email?: string;
    nickname?: string;
    address?: string;
    rating?: number;
    role: userRole;
    userStatus: userStatus;
    createAt: string;
    registrationCompleted: boolean;
}

export default function useAuth() {
    const [loginMember, setLoginMember] = useState<UserLoginResponseDto>(
        null as unknown as UserLoginResponseDto
    );
    const [isInitialized, setIsInitialized] = useState(false);
    
    const isLogin = loginMember !== null;
    const isAdmin = isLogin && loginMember.role === "ADMIN";

    useEffect(() => {
        const checkAuthStatus = () => {
            apiClient<UserLoginResponseDto>("/api/v1/admin/me", { // todo: api/v1/bookbook/users로 시도
                method: "GET",
            }).then(data => {
                setLoginMember(data.data);
            }).catch(error => {
                console.log("Auth Check Failure : ", error);
            }).finally(() => {
                setIsInitialized(true);
            })
        };

        checkAuthStatus();
    }, []);

    const clearLoginMember = () => {
        setLoginMember(null as unknown as UserLoginResponseDto);
    };

    const logout = (onSuccess: () => void) => {
        apiClient("/api/v1/admin/logout", {
            method: "DELETE",
        }).then((data) => {
            if (data) {
                alert(data.msg);
                return;
            }
            clearLoginMember();
            onSuccess();
        })
        .catch((error) => {
            console.error("Logout error:", error);
            // 에러가 발생해도 로그아웃 처리
            clearLoginMember();
            onSuccess();
        });
    };

    return {
        isLogin,
        isAdmin,
        loginMember,
        logout,
        setLoginMember,
        clearLoginMember,
        isInitialized,
    };
}

export const AuthContext = createContext<ReturnType<typeof useAuth>>(
    null as unknown as ReturnType<typeof useAuth>,
);

export function AuthProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const authState = useAuth();

    return <AuthContext value={authState}>{children}</AuthContext>;
}

export function useAuthContext() {
    const authState = use(AuthContext);

    if (authState === null) throw new Error("AuthContext is not found");

    return authState;
}