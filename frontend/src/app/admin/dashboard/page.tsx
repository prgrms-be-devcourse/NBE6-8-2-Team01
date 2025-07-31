'use client';

import { useState } from 'react';
import { SideBar } from "./_components/sidebar/sideBar";
import { MainContent } from "./_components/mainContent/mainContent";
import { useAuthContext } from "../global/hooks/useAuth";

export default function AdminPage() {
  const { logout: _logout } = useAuthContext();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleLogout = () => {
    console.log("로그아웃 처리");
    _logout(() => {
      alert("로그아웃 완료");
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar
        expandedItems={expandedItems}
        onToggle={handleToggle}
        onLogout={handleLogout}
      />
      <MainContent />
    </div>
  );
}
