'use client';

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { RentPost } from "../../_types/rentPost";
import { BaseContentComponentProps } from "./baseContentComponentProps";

// --- Mock Data ---
const mockRentPosts: RentPost[] = [
    {
        id: 1,
        lenderId: 1,
        name: "매니저",
        title: "이 책 재밌읍니다",
        author: "작자미상",
        publisher: "나",
        rentStatus: "대기중",
        createdDate: "25-05-06",
        modifiedDate: "25-05-06",
    },
    {
        id: 2,
        lenderId: 2,
        name: "매니저2",
        title: "이 책 재밌읍니다2",
        author: "작자미상",
        publisher: "너",
        rentStatus: "대출중",
        createdDate: "25-05-06",
        modifiedDate: "25-05-06",
    },
    {
        id: 3,
        lenderId: 3,
        name: "매니저3",
        title: "이 책 재밌읍니다3",
        author: "작자미상",
        publisher: "우리",
        rentStatus: "중단",
        createdDate: "25-05-06",
        modifiedDate: "25-05-06",
    }
];

interface ManagementButtonProps {
    rentPost: RentPost;
    onClick: (id: number) => void;
}

function ManagementButton({ rentPost, onClick }: ManagementButtonProps) {
    return (
        <button
            onClick={() => onClick(rentPost.id)}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
            클릭
        </button>
    );
}

export function UserRentPostComponent({ responseData }: BaseContentComponentProps) {
    const handleManageClick = (postId: number) => {
        console.log(`관리 버튼 클릭: 글 ID - ${postId}`);
        // TODO: 작성된 글로 이동
    };

    const [suspendedMembers, setsuspendedMembers] = useState<RentPost[]>([]);

    useEffect(() => {
        if (responseData) {
            // setSuspendedMembers(responseData);
        }
        // 테스트 목적으로 추가했습니다
        setsuspendedMembers(mockRentPosts);
    }, [responseData]);

    const columns: ColumnDefinition<RentPost>[] = [
        { key: "id", label: "No" },
        { key: "lenderId", label: "대여자 ID" },
        { key: "name", label: "이름" },
        { key: "title", label: "도서명" },
        { key: "author", label: "작가" },
        { key: "publisher", label: "출판사" },
        { key: "rentStatus", label: "대여 상태" },
        { key: "createdDate", label: "작성일"},
        { key: "modifiedDate", label: "수정일"},
        {
            key: "actions",
            label: "링크",
            render: (rentPost) => (
                <ManagementButton rentPost={rentPost} onClick={handleManageClick} />
            ),
        },
    ];

    return (
        <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                글 작성 목록
            </h3>
            <DataTable columns={columns} data={suspendedMembers} />
        </>
    );
}
