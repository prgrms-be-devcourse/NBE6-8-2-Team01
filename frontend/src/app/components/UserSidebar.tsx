'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarItem = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-4 py-3 rounded text-lg font-semibold ${
        isActive 
          ? 'bg-[#D5BAA3] text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
};

export default function UserSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">마이페이지</h2>

        <nav className="space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-600 mb-3">내 정보</h3>
            <div className="space-y-1">
              <SidebarItem href="/bookbook/user/profile" label="회원정보 수정" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-600 mb-3">내 도서</h3>
            <div className="space-y-1">
              <SidebarItem href="/bookbook/user/lendlist" label="도서 등록 내역" />
              <SidebarItem href="/bookbook/user/rentlist" label="도서 대여 내역" />
              <SidebarItem href="/bookbook/user/wishlist" label="찜한 도서" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-600 mb-3">알림</h3>
            <div className="space-y-1">
              <SidebarItem href="/bookbook/user/notification" label="알림 메시지" />
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
