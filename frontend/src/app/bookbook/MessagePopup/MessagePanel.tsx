'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import ChatWindow from './ChatWindow';

type Props = {
  onClose: () => void;
};

type Message = {
  id: number;
  senderNickname: string;
  recentMessage: string;
  timestamp: string;
};

const MessagePanel: React.FC<Props> = ({ onClose }) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const mockMessages: Message[] = [
    {
      id: 1,
      senderNickname: '홍길동',
      recentMessage: '안녕하세요! 책 대여 가능할까요?',
      timestamp: '5분 전',
    },
    {
      id: 2,
      senderNickname: '김철수',
      recentMessage: '반납 날짜를 연장할 수 있을까요?',
      timestamp: '어제',
    },
  ];

  return (
    <>
      {/* 반투명 배경 */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* 메시지 패널 */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 flex flex-col animate-slideIn">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <h2 className="text-lg font-bold">채팅</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* 메시지 목록 */}
        {!selectedMessage ? (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className="border-b border-gray-200 pb-3 cursor-pointer hover:bg-gray-50 rounded-md transition"
                onClick={() => setSelectedMessage(msg)}
              >
                <p className="font-semibold text-gray-800">{msg.senderNickname}</p>
                <p className="text-sm text-gray-600">{msg.recentMessage}</p>
                <p className="text-xs text-gray-400">{msg.timestamp}</p>
              </div>
            ))}
          </div>
        ) : (
          <ChatWindow message={selectedMessage} onBack={() => setSelectedMessage(null)} />
        )}
      </div>
    </>
  );
};

export default MessagePanel;
