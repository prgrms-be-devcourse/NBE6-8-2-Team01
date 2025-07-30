'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';

type ChatWindowProps = {
  message: {
    senderNickname: string;
  };
  onBack: () => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ message, onBack }) => {
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-300">
        <button onClick={onBack}>
          <ChevronLeft className="w-5 h-5 mr-2" />
        </button>
        <h3 className="font-bold text-lg">{message.senderNickname}</h3>
      </div>

      {/* 채팅 내용 (더미) */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto text-sm">
        <div className="text-left bg-gray-100 px-3 py-2 rounded-md w-fit">안녕하세요!</div>
        <div className="text-right bg-blue-100 px-3 py-2 rounded-md w-fit ml-auto">네 가능합니다.</div>
      </div>

      {/* 입력창 */}
      <div className="border-t px-4 py-2 flex gap-2">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
        />
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">전송</button>
      </div>
    </div>
  );
};

export default ChatWindow;
