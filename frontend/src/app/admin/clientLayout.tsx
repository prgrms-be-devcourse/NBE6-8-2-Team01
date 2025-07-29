"use client";

import AdminGuard from "./adminGuard";

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="flex-1 flex flex-col">
            <AdminGuard>
                {children}
            </AdminGuard>
        </main>
    );
}