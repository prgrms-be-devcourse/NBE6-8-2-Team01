// src/app/bookbook/MessagePopup/[roomId]/ChatPageClient.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatWindow from '../components/ChatWindow';

// Props 타입 정의
interface ChatPageClientProps {
  params: Promise<{ roomId: string }>;
}

export default function ChatPageClient({ params }: ChatPageClientProps): React.JSX.Element {
  const { roomId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 쿼리 파라미터에서 추가 정보 가져오기
  const bookTitle = searchParams.get('bookTitle');
  const otherUserNickname = searchParams.get('otherUserNickname');

  const handleBack = (): void => {
    // 이전 페이지로 돌아가기 또는 특정 페이지로 이동
    if (window.history.length > 1) {
      router.back();
    } else {
      // 히스토리가 없는 경우 메인 페이지로 이동
      router.push('/bookbook');
    }
  };

  return (
    <div className="h-screen bg-gray-100 font-inter flex justify-center">
      <div className="w-full max-w-sm bg-white">
        <ChatWindow
          roomId={roomId}
          bookTitle={bookTitle || undefined}
          otherUserNickname={otherUserNickname || undefined}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}