'use client';

import React, { useEffect, useState } from 'react';

const Bottom = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 약간의 지연을 두어 하이드레이션이 완료된 후 렌더링
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 서버 사이드 렌더링 중에는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  // 클라이언트 사이드에서만 렌더링
  return (
    <div suppressHydrationWarning>
      <footer className="w-full bg-[#D5BAA3] py-6 px-4">
        <div className="max-w-7xl mx-auto text-white text-sm sm:text-base leading-relaxed">
          <p className="font-bold text-lg mb-1">북북</p>
          <p>@Copyright 2025 BookBook co, Ltd.</p>
          <p>All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Bottom;
