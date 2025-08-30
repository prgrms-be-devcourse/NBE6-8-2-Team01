'use client';

import Image from "next/image";
import React, { useEffect, useState } from "react";

const HeroSection = () => {
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

  return (
    <section className="relative w-full h-[420px]">
      {/* 배경 이미지 */}
      <Image
        src="/library-hero.png" // public 경로 기준
        alt="도서관 배경"
        fill
        style={{ objectFit: "cover" }}
        priority
      />

      {/* 어두운 반투명 오버레이 */}
      <div className="absolute inset-0 bg-[#000000aa] z-10" />

      {/* 중앙 텍스트 */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-4">
        <p className="text-xl md:text-2xl font-semibold mb-2">북북</p>
        <h1 className="text-2xl md:text-4xl font-bold text-center leading-snug">
          당신의 책장이, <br /> 누군가의 책방이 됩니다.
        </h1>
      </div>
    </section>
  );
};

export default HeroSection;
