"use client";

import { useState } from "react";
import { SideBar } from "./_components/sidebar/sideBar";
import { MainContent } from './_components/content/mainContent';

export default function AdminPage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState("dashboard");
  const [currentPath, setCurrentPath] = useState("");

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (id: string, apiPath?: string) => {
    setActiveItem(id);
    if (apiPath) {
      setCurrentPath(apiPath);
    }
  };

  const handleLogout = () => {
    console.log("로그아웃 처리");
    // 로그아웃 API 호출 및 로그인 페이지로 리다이렉트
  };

  const handleApiCall = () => {
    console.log("API 호출:", currentPath);
    // API 호출 로직
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar
        expandedItems={expandedItems}
        onToggle={handleToggle}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        onLogout={handleLogout}
      />
      <MainContent activeItem={activeItem} handleApiCall={handleApiCall} />
    </div>
  );
}
