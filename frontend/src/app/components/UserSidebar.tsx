'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarItem = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-4 py-2 rounded hover:bg-gray-100 transition ${
        isActive ? 'bg-[#D5BAA3] text-white' : 'text-gray-800'
      }`}
    >
      {label}
    </Link>
  );
};

export default function UserSidebar() {
  return (
    <aside className="w-64 min-h-screen p-6 border-r bg-white">
      <h2 className="text-xl font-bold mb-6"> 마이페이지</h2>

      <div className="mb-6">
        <p className="text-base font-bold text-gray-800 mb-2">내 정보</p>
        <SidebarItem href="/user/edit" label="회원정보 수정" />
      </div>

      <div className="mb-6">
        <p className="text-base font-bold text-gray-800 mb-2">내 도서</p>
        <SidebarItem href="/user/registered" label="도서 등록 내역" />
        <SidebarItem href="/user/rented" label="도서 대여 내역" />
        <SidebarItem href="/user/wishlist" label="찜한 도서" />
      </div>

      <div>
        <p className="text-base font-bold text-gray-800 mb-2">알림</p>
        <SidebarItem href="/bookbook/user/notification" label="알림 메시지" />
      </div>
    </aside>
  );
}
