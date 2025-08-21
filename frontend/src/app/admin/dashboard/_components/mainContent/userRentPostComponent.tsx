'use client';

import React, { useState } from "react";
import Link from "next/link";
import PostDetailWithUserModal from "../post/manage/postDetailWithUserModal";
import { ColumnDefinition } from "../common/Table";
import { ContentComponentProps } from "./baseContentComponentProps";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";
import { useFilter } from "@/app/admin/dashboard/_hooks/useFilter";
import { FilterContainer } from "@/app/admin/dashboard/_components/common/filter/FilterContainer";
import { SearchParamFromFilter } from "@/app/admin/dashboard/_components/common/filter/searchParamFromFilter";
import {
    getRentStatus,
    RentPostDetailResponseDto,
    RentPostSimpleResponseDto,
    RentStatus
} from "../../_types/rentPost";


interface ManagementButtonProps {
    rentPost: RentPostSimpleResponseDto;
    onClick: (post: RentPostSimpleResponseDto) => void;
}

function ManagementButton({ rentPost, onClick }: ManagementButtonProps) {
    return (
        <button
            onClick={() => onClick(rentPost)}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
            관리
        </button>
    );
}

/*
* 유저의 게시글 목록을 나타내는 컴포넌트
*/
export function UserRentPostComponent({ data, onRefresh }: ContentComponentProps) {
    // data가 없거나 잘못된 형태일 때 기본값 설정
    const [selectedRentPost, setSelectedRentPost] = useState<RentPostDetailResponseDto>(
        null as unknown as RentPostDetailResponseDto
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const statusList : RentStatus[] = ["AVAILABLE", "LOANED", "FINISHED", "DELETED"];

    const filterProps = useFilter('admin-post-list-filters', statusList)

    const handleManageClick = async (post : RentPostSimpleResponseDto) => {
        const response = await fetch(`/api/v1/admin/rent/${post.id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            }
        })
        const data = await response.json()

        if (!data) return;

        setSelectedRentPost(data.data as RentPostDetailResponseDto);

        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRentPost(null as unknown as RentPostDetailResponseDto);
    };

    const searchFromFilter = () => {
        return SearchParamFromFilter(filterProps, "userId");
    }

    const columns: ColumnDefinition<RentPostSimpleResponseDto>[] = [
        { key: "id", label: "No" },
        { key: "lenderUserId", label: "대여자 ID" },
        {
            key: "status",
            label: "대여 상태",
            render: post => (
                <>{getRentStatus(post.status)}</>
            )
        },
        { key: "bookCondition", label: "도서 상태" },
        {
            key: "bookTitle",
            label: "도서명",
            render: (post =>
                <>
                    {post.bookTitle?.length >= 15
                        ? post.bookTitle.slice(0, 15) + "..."
                        : post.bookTitle}
                </>
            )
        },
        {
            key: "author",
            label: "작가" ,
            render : rentPost => {
                if (!rentPost.author) return;

                const representAuthor = rentPost.author.split(",", 2)
                return representAuthor.length > 1 ? `${representAuthor[0]} 등` : representAuthor[0];
            }  },
        {
            key: "createdDate",
            label: "작성일",
            render: (post) => <span>{formatDate(post.createdDate)}</span>
        },
        {
            key: "modifiedDate",
            label: "수정일",
            render: (post) => <span>{formatDate(post.modifiedDate)}</span>,
        },
        {
            key: "actions",
            label: "포스트",
            render: (rentPost) => (
                <Link href={`/bookbook/rent/${rentPost.id}`} target="_blank">
                    <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                        이동
                    </button>
                </Link>
            ),
        },
        {
            key: "management",
            label: "관리",
            render: (rentPost) => (
                <ManagementButton rentPost={rentPost} onClick={handleManageClick} />
            ),
        }
    ];

    const getStyle = (status : RentStatus)=> {
        switch (status) {
            case "AVAILABLE":
                return "ml-2 text-sm text-emerald-700 font-medium"
            case "LOANED":
                return "ml-2 text-sm text-yellow-700 font-medium";
            case "FINISHED":
                return "ml-2 text-sm text-blue-700 font-medium"
            case "DELETED":
                return "ml-2 text-sm text-red-700 font-medium";
            default:
                return "ml-2 text-sm text-slate-700 font-medium";
        }
    }

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    대여 글 목록
                </h3>
                <div className="text-sm text-gray-500">
                    {(data?.pageInfo?.totalElements ?? 0) > 0 ? `총 ${data.pageInfo.totalElements}건 검색 완료` : "검색 결과 없음"}
                </div>
            </div>

                {/* 필터 및 검색 영역 */}
            <FilterContainer
                title="글 상태"
                filterProps={filterProps}
                columns={columns}
                data={data}
                pageFactory={searchFromFilter}
                getStatus={getRentStatus}
                getFontStyle={getStyle}
            />

            {/* 멤버 상세 정보 모달 */}
            {selectedRentPost && (
                <PostDetailWithUserModal
                    post={selectedRentPost}
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onRefresh={onRefresh} // 새로고침 함수 전달
                />
            )}
        </div>
    );
}
