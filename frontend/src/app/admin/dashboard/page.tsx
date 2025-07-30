'use client';

import { useState, useEffect } from 'react';
import { SideBar } from "./_components/sidebar/sideBar";
import { MenuItem } from "./_types/menuItem";
import { MainContent } from "./_components/mainContent/mainContent";
import { useAuthContext } from "../_hook/useAuth";

export default function AdminPage() {
  const { logout: _logout, loginMember } = useAuthContext();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState('dashboard');
  const [responseData, setResponseData] = useState<unknown | null>(null);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  // 데이터 새로고침 함수
  const refreshData = () => {
    if (!currentItem || !currentItem.apiPath || currentItem.apiPath.trim().length === 0) {
      return;
    }

    setLoading(true);
    const requestURL = `http://localhost:8080${currentItem.apiPath}`;

    fetch(requestURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      credentials: "include",
    })
      .then(response => {
        if (!response.ok) {
          setResponseData(null);
        }
        return response.json();
      })
      .then(data => {
        console.log('데이터 새로고침:', data);
        setResponseData(data.data);
      })
      .catch(error => {
        console.log(error.message);
        setResponseData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

  useEffect(() => {
    setLoading(true);

    const handleApiCall = () => {
      // Early return: currentItem이 없거나 apiPath가 유효하지 않으면 API 호출 중단
      if (!currentItem || !currentItem.apiPath || currentItem.apiPath.trim().length === 0) {
        const reason = !currentItem ? "currentItem is null" : "apiPath 없음";
        console.log(`API 호출 중단: ${reason}`);
        setResponseData([]);
        setLoading(false);
        return;
      }

      // 조건 충족 시 API 호출을 진행합니다.
      console.log("API 호출:", currentItem.apiPath);
      const requestURL = `http://localhost:8080${currentItem.apiPath}`;

      fetch(requestURL, { method: "GET" })
          .then(response => {
            if (!response.ok) {
              setResponseData(null);
            }
            return response.json();
          })
          .then(data => {
            console.log(data);
            setResponseData(data.data);
          })
          .catch(error => {
            console.log(error.message);
            setResponseData(null);
          })
          .finally(() => {
            setLoading(false);
          })
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
        loginMember={loginMember}
      />
      <MainContent
        activeItem={activeItem}
        responseData={responseData}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        loading={loading}
        onRefresh={refreshData}
      />
    </div>
  );
}
