'use client';

import { Heart, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WishListItem as WishListItemType } from './types';

interface WishListCardProps {
    item: WishListItemType;
    onRemove: (id: number) => void;
}

export default function WishListCard({ item, onRemove }: WishListCardProps) {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available':
            case '대여가능':
                return 'bg-green-100 text-green-800';
            case 'Loaned':
            case '대출중':
                return 'bg-blue-100 text-blue-800';
            case 'Finished':
            case '대여불가':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Available':
                return '대여가능';
            case 'Loaned':
                return '대출중';
            case 'Finished':
                return '대출불가';
            default:
                return status;
        }
    };

    return (
        <div
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/bookbook/rent/${item.rentId}`)}
        >
            <div className="flex gap-4">
                {/* 책 이미지 */}
                <div className="flex-shrink-0">
                    <img
                        src={item.bookImage || "/book-placeholder.png"}
                        alt={item.bookTitle}
                        className="w-20 h-28 object-cover rounded border border-gray-200"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/book-placeholder.png";
                        }}
                    />
                </div>
                
                {/* 책 정보 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                {item.title}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-base font-medium text-gray-800">
                                    {item.bookTitle}
                                </p>
                                <p className="text-sm text-gray-600">저자: {item.bookAuthor}</p>
                                <p className="text-sm text-gray-600">출판사: {item.bookPublisher}</p>
                                <p className="text-sm text-gray-600">상태: {item.bookCondition}</p>
                            </div>
                        </div>

                        {/* 찜 해제 버튼 */}
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(item.id);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="찜 해제"
                            >
                                <Heart className="h-5 w-5 fill-current" />
                            </button>
                        </div>
                    </div>

                    {/* 추가 정보 */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {item.address && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{item.address}</span>
                            </div>
                        )}
                        {item.lenderNickname && (
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>책방지기: {item.lenderNickname}</span>
                            </div>
                        )}
                    </div>

                    {/* 상태 */}
                    <div className="flex items-center gap-2 mt-4 mb-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.rentStatus)}`}>
                            {getStatusText(item.rentStatus)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}