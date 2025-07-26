'use client';

import { useState, useEffect } from 'react';
import { SideBar } from "./_components/sidebar/sideBar";
import { MenuItem } from "./_types/menuItem";
import { MainContent } from "@/app/admin/dashboard/_components/mainContent/mainContent";

export default function AdminPage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState('dashboard');
  const [responseData, setResponseData] = useState<unknown>(null);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

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
    // TODO: 로그아웃 API 호출 및 로그인 페이지로 리다이렉트
  };

  useEffect(() => {
    const handleApiCall = () => {
      // Early return: currentItem이 없거나 apiPath가 유효하지 않으면 API 호출 중단
      if (!currentItem || !currentItem.apiPath || currentItem.apiPath.trim().length === 0) {
        const reason = !currentItem ? "currentItem is null" : "apiPath 없음";
        console.log(`API 호출 중단: ${reason}`);
        setResponseData(null);
        return;
      }

      // 조건 충족 시 API 호출을 진행합니다.
      console.log("API 호출:", currentItem.apiPath);
      // TODO: 실제 API 호출 로직 구현
    };

    handleApiCall();
  }, [currentItem]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar
        expandedItems={expandedItems}
        onToggle={handleToggle}
        activeItem={activeItem}
        onItemClick={setActiveItem}
        onLogout={handleLogout}
      />
      <MainContent 
        activeItem={activeItem}
        responseData={responseData}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
      />
    </div>
  );
}
