"use client";

import { AuthProvider } from "./_hook/useAuth";
import ClientLayout from "./clientLayout";

export default function ContextLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
    );
}