"use client";

import { AuthProvider } from "./global/hooks/useAuth";
import ClientLayout from "./clientLayout";
import { useEffect, useState } from "react";
import LoadingScreen from "@/app/components/Loading";

export default function ContextLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 클라이언트에서만 렌더링하여 hydration 문제 방지
    if (!isMounted) {
        return <LoadingScreen message="로딩 중..."/>
    }

    return (
        <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
    );
}