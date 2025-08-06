// src/app/bookbook/MessagePopup/[roomId]/page.tsx
'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatWindow from '../components/ChatWindow';

// Props 타입 정의
interface ChatPageContentProps {
  params: Promise<{ roomId: string }>;
}

interface ChatPageProps {
  params: Promise<{ roomId: string }>;
}

function ChatPageContent({ params }: ChatPageContentProps): React.JSX.Element {
  const { roomId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 쿼리 파라미터에서 추가 정보 가져오기
  const bookTitle = searchParams.get('bookTitle');
  const otherUserNickname = searchParams.get('otherUserNickname');

  const handleBack = (): void => {
    // 이전 페이지로 돌아가기
    router.back();
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

// 로딩 컴포넌트
function LoadingComponent(): React.JSX.Element {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 font-inter">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">채팅을 불러오는 중...</p>
        <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function ChatPage({ params }: ChatPageProps): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ChatPageContent params={params} />
    </Suspense>
  );
}