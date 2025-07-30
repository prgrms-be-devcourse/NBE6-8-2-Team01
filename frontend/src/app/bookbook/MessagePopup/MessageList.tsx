'use client';

import React from 'react';

type ChatPreview = {
  id: number;
  user: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
};

type MessageListProps = {
  chats: ChatPreview[];
  onSelect: (id: number) => void;
  selectedId: number | null;
};

const MessageList = ({ chats, onSelect, selectedId }: MessageListProps) => {
  return (
    <aside className="w-1/3 border-r h-full p-4 bg-white">
      <h2 className="text-lg font-bold mb-4">전체 대화</h2>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
              selectedId === chat.id ? 'bg-gray-100' : ''
            }`}
          >
            <img src={chat.avatar} alt="avatar" className="w-10 h-10 rounded-full mr-3" />
            <div className="flex-1">
              <p className="font-medium">{chat.user}</p>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
            <span className="text-xs text-gray-400">{chat.lastTime}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default MessageList;
