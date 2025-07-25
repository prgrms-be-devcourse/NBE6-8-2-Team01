'use client';

import { usePathname } from 'next/navigation';
import UserSidebar from '../components/UserSidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isUserPage = pathname.startsWith('/bookbook/user'); // ✅ 조건 수정!

  if (isUserPage) {
    return (
      <div className="flex min-h-screen">
        <UserSidebar />
        <div className="flex-1 p-8">{children}</div>
      </div>
    );
  }

  return <main className="flex-grow">{children}</main>;
}
