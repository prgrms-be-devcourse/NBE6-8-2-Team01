'use client';

import { useState } from 'react';


type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
  bookTitle: string;
  detailMessage: string;
  imageUrl: string;
  requester: string;
};

const notifications: Notification[] = [
  {
    id: 1,
    message: '📘 도서 대여 요청이 도착했어요!',
    time: '3시간 전',
    read: false,
    bookTitle: '불편한 편의점',
    detailMessage: '대여 부탁드립니다!',
    imageUrl: '/book-sample-3.png',
    requester: '홍길동',
  },
  {
    id: 2,
    message: '📕 찜한 도서가 대여 가능해졌습니다',
    time: '1일 전',
    read: true,
    bookTitle: '내가 틀릴 수도 있습니다',
    detailMessage: '지금 대여 가능합니다!',
    imageUrl: '/book-sample-2.png',
    requester: '김철수',
  },
  {
    id: 3,
    message: '📙 도서 반납일이 다가옵니다',
    time: '3일 전',
    read: false,
    bookTitle: '작별하지 않는다',
    detailMessage: '내일까지 반납 부탁드려요!',
    imageUrl: '/book-sample-1.png',
    requester: '이영희',
  },
];

export default function NotificationPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🔔 알림 메시지</h1>

      <div className="flex flex-col gap-3">
        {notifications.map((item) => (
          <div key={item.id}>
            {/* 알림 배너 */}
            <div
              onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
              className={`p-4 border rounded shadow-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedId === item.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : item.read ? 'bg-white' : 'bg-[#fff9f0]'
              }`}
            >
              <div className="flex justify-between items-center">
                <p className={`text-sm ${
                  selectedId === item.id 
                    ? 'font-semibold text-blue-800' 
                    : item.read ? 'text-gray-600' : 'font-semibold'
                }`}>
                  {item.message}
                </p>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            </div>

            {/* 선택된 알림의 상세 정보 */}
            {selectedId === item.id && (
              <div className="mt-3 mb-3 p-6 border rounded-lg shadow bg-white flex gap-6">
                <img
                  src={item.imageUrl}
                  alt="책 이미지"
                  width={120}
                  height={180}
                  className="rounded object-cover"
                />
                <div className="space-y-3 flex-1">
                  <h2 className="text-lg font-bold text-gray-800">{item.bookTitle}</h2>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">신청자:</span> {item.requester}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">메시지:</span> {item.detailMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}