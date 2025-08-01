'use client';

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import {getRentStatus, RentPostDetailResponseDto, RentPostSimpleResponseDto, rentStatus} from "../../_types/rentPost";
import { ContentComponentProps } from "./baseContentComponentProps";
import { FilterState, PostFilterContainer } from "@/app/admin/dashboard/_components/post/filter";
import { useDashBoardContext } from "@/app/admin/dashboard/_hooks/useDashboard";
import Link from "next/link";
import apiClient from "@/app/bookbook/user/utils/apiClient";
import {formatDate} from "@/app/admin/dashboard/_components/common/dateFormatter";
import PostDetailWithUserModal from "../post/manage/postDetailWithUserModal";

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

export function UserRentPostComponent({ data, onRefresh }: ContentComponentProps) {
    // data가 없거나 잘못된 형태일 때 기본값 설정
    const [selectedRentPost, setSelectedRentPost] = useState<RentPostDetailResponseDto>(
        null as unknown as RentPostDetailResponseDto
    );
    const [selectedRentPostId, setSelectedRentPostId] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentItem, fetchData } = useDashBoardContext();

    const getInitialFilters = (): FilterState => {
        try {
            const saved = sessionStorage.getItem('admin-post-list-filters');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    statuses: new Set(parsed.statuses || ["AVAILABLE", "LOANED", "FINISHED"]),
                    searchTerm: parsed.searchTerm || "",
                };
            }
        } catch (error) {
            console.warn('필터 상태 복원 실패:', error);
        }

        return {
            statuses: new Set(["AVAILABLE", "LOANED", "FINISHED"]),
            searchTerm: "",
        };
    };

    const [filters, setFilters] = useState<FilterState>(getInitialFilters);

    const saveFilters = useCallback(() => {
        try {
            const toSave = {
                statuses: Array.from(filters.statuses),
                searchTerm: filters.searchTerm,
            };
            sessionStorage.setItem('admin-post-list-filters', JSON.stringify(toSave));
        } catch (error) {
            console.warn('필터 상태 저장 실패:', error);
        }
    }, [filters]);

    const handleManageClick = async (post : RentPostSimpleResponseDto) => {
        console.log(`관리 버튼 클릭: 멤버 ID - ${post.id}`);

        apiClient(`/bookbook/rent/${post.id}`, {
            method: "GET",
        }).then((data) => {
            console.log(data.data);
            setSelectedRentPost(data.data as RentPostDetailResponseDto);
            setSelectedRentPostId(post.id);
        });

        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRentPost(null as unknown as RentPostDetailResponseDto);
    };

    useEffect(() => {
        saveFilters();
    }, [saveFilters]);

    const handleStatusToggle = (status: rentStatus) => {
        const newStatuses = new Set(filters.statuses);
        if (newStatuses.has(status)) {
            newStatuses.delete(status);
        } else {
            newStatuses.add(status);
        }

        if (newStatuses.size === 0) {
            setFilters((prev) => ({ ...prev, statuses: new Set(["AVAILABLE", "LOANED", "FINISHED"])}));
        } else {
            setFilters((prev) => ({ ...prev, statuses: newStatuses }));
        }
    };

    const handleSelectAll = () => {
        const allStatuses: rentStatus[] = ["AVAILABLE", "LOANED", "FINISHED"];
        const isAllSelected = allStatuses.every((status) =>
            filters.statuses.has(status)
        );

        if (isAllSelected) {
            setFilters((prev) => ({ ...prev, statuses: new Set() }));
        } else {
            setFilters((prev) => ({ ...prev, statuses: new Set(allStatuses) }));
        }
    };

    const handleSearchChange = (value: string) => {
        setFilters((prev) => ({ ...prev, searchTerm: value }));
    };

    const resetFilters = () => {
        const resetState: FilterState = {
            statuses: new Set(["AVAILABLE", "LOANED", "FINISHED"]),
            searchTerm: "",
        };
        setFilters(resetState);
    };

    const searchFromFilter = () => {
        const params = new URLSearchParams();

        filters.statuses.forEach(status => params.append("status", status));

        if (filters.searchTerm) {
            const nickname = filters.searchTerm.trim();
            params.append("nickname", `${nickname}`);
        }

        return params
    }

    const doSearch = () => {
        if (!currentItem || !currentItem.apiPath || currentItem.apiPath.trim().length === 0) {
            return;
        }

        const params = searchFromFilter();
        const requestPath = `${currentItem.apiPath}?${params.toString()}`;
        fetchData(requestPath);
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
        { key: "author", label: "작가" },
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

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    멤버 목록
                </h3>
                <div className="text-sm text-gray-500">
                    {(data?.data?.length ?? 0) > 0 ? `총 ${data.data.length}건 검색 완료` : "검색 결과 없음"}
                </div>
            </div>

                {/* 필터 및 검색 영역 */}
            <PostFilterContainer
                filters={filters}
                onStatusToggle={handleStatusToggle}
                onSelectAll={handleSelectAll}
                onSearchTermChange={handleSearchChange}
                onReset={resetFilters}
                onSearch={doSearch}
            />

                {/* 테이블 */}
            <div className="bg-white rounded-lg border border-gray-200">
                <DataTable
                    columns={columns}
                    data={data}
                    pageFactory={searchFromFilter}
                />
            </div>

            {/* 멤버 상세 정보 모달 */}
            {selectedRentPost && (
                <PostDetailWithUserModal
                    id={selectedRentPostId}
                    post={selectedRentPost}
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onRefresh={onRefresh} // 새로고침 함수 전달
                />
            )}
        </div>
    );
}
