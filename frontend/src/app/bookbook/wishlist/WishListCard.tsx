'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { WishListItem as WishListItemType } from './types';

interface WishListCardProps {
    item: WishListItemType;
    onRemove: (id: number) => void;
}

export default function WishListCard({ item, onRemove }: WishListCardProps) {
    const router = useRouter();

    return (
        <div
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/bookbook/rent/${item.rentId}`)}
        >
            <div className="flex gap-4">
                {/* 책 이미지 */}
                <div className="flex-shrink-0">
                    <Image
                        src={item.bookImage}
                        alt={item.bookTitle}
                        width={80}
                        height={120}
                        className="rounded-md object-cover"
                    />
                </div>
                
                {/* 책 정보 */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">{item.bookTitle}</h3>
                            <p className="text-gray-600 text-sm mb-1">저자: {item.bookAuthor}</p>
                            <p className="text-gray-600 text-sm mb-1">출판사: {item.bookPublisher}</p>
                            <p className="text-gray-600 text-sm mb-2">책 컨디션: {item.bookCondition}</p>
                            <div className="text-sm">
                                <span className={`font-medium ${
                                    item.rentStatus === '대여가능' ? 'text-green-600' : 
                                    item.rentStatus === '대출중' ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                    {item.rentStatus === '대여가능' ? '대여가능' :
                                     item.rentStatus === '대출중' ? '대출중' : '대여불가'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(item.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="찜 해제"
                        >
                            <Heart className="h-6 w-6 fill-current" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}