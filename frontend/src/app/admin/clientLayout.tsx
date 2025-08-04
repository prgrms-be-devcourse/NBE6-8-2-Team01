"use client";

import AdminGuard from "./adminGuard";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      <main className="flex-1 flex flex-col">{children}</main>
    </AdminGuard>
  );
}
