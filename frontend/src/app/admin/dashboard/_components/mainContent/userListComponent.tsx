"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { UserBaseResponseDto, UserDetailResponseDto, getStatus, userStatus} from "../../_types/userResponseDto";
import { formatDate } from "../common/dateFormatter";
import UserDetailModal from "../user/manage/userDetailModal";
import { ContentComponentProps } from "./baseContentComponentProps";
import { UserFilterContainer, FilterState } from "../user/filter";
import { useDashBoardContext } from "@/app/admin/dashboard/_hooks/useDashboard";

interface ManagementButtonProps {
  user: UserBaseResponseDto;
  onClick: (user: UserBaseResponseDto) => void;
}

function ManagementButton({ user, onClick }: ManagementButtonProps) {
  return (
    <button
      onClick={() => onClick(user)}
      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
    >
      관리
    </button>
  );
}

export function UserListComponent({ data }: ContentComponentProps) {
  const [selectedUser, setSelectedUser] = useState<UserDetailResponseDto>(
      null as unknown as UserDetailResponseDto
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentItem, fetchData } = useDashBoardContext();

  // sessionStorage에서 필터 상태 복원하는 함수
  const getInitialFilters = (): FilterState => {
    try {
      const saved = sessionStorage.getItem('admin-user-list-filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          userStatuses: new Set(parsed.userStatuses || ["ACTIVE", "SUSPENDED", "INACTIVE"]),
          searchTerm: parsed.searchTerm || "",
        };
      }
    } catch (error) {
      console.warn('필터 상태 복원 실패:', error);
    }
    
    return {
      userStatuses: new Set(["ACTIVE", "SUSPENDED", "INACTIVE"]),
      searchTerm: "",
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);

  // 필터 상태를 sessionStorage에 저장하는 함수
  const saveFilters = useCallback(() => {
    try {
      const toSave = {
        userStatuses: Array.from(filters.userStatuses),
        searchTerm: filters.searchTerm,
      };
      sessionStorage.setItem('admin-user-list-filters', JSON.stringify(toSave));
    } catch (error) {
      console.warn('필터 상태 저장 실패:', error);
    }
  }, [filters]);

  const handleManageClick = async (user: UserBaseResponseDto) => {
    console.log(`관리 버튼 클릭: 멤버 ID - ${user.id}, 닉네임 - ${user.nickname}`);

    await fetch(`/api/v1/admin/users/${user.id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data=> data.json()))
      .then(data=> {
        console.log(data);
        setSelectedUser(data.data as UserDetailResponseDto);
      });

    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null as unknown as UserDetailResponseDto);
  };

  useEffect(() => {
    saveFilters();
  }, [saveFilters]);

  // 상태 체크박스 핸들러
  const handleStatusToggle = (status: userStatus) => {
    const newStatuses = new Set(filters.userStatuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }

    if (newStatuses.size === 0) {
      setFilters((prev) => ({ ...prev, userStatuses: new Set(["ACTIVE", "SUSPENDED", "INACTIVE"])}));
    } else {
      setFilters((prev) => ({ ...prev, userStatuses: newStatuses }));
    }
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    const allStatuses: userStatus[] = ["ACTIVE", "SUSPENDED", "INACTIVE"];
    const isAllSelected = allStatuses.every((status) =>
      filters.userStatuses.has(status)
    );

    if (isAllSelected) {
      setFilters((prev) => ({ ...prev, userStatuses: new Set() }));
    } else {
      setFilters((prev) => ({ ...prev, userStatuses: new Set(allStatuses) }));
    }
  };

  // 검색 핸들러
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  // 필터 초기화
  const resetFilters = () => {
    const resetState: FilterState = {
      userStatuses: new Set(["ACTIVE", "SUSPENDED", "INACTIVE"]),
      searchTerm: "",
    };
    setFilters(resetState);
  };

  const searchFromFilter = () => {
    const params = new URLSearchParams();

    filters.userStatuses.forEach(status => params.append("status", status));

    if (filters.searchTerm) {
      const number = Number(filters.searchTerm.trim());
      params.append("userId", `${number}`);
    }

    return params
  }

  const doSearch = () => {
    if (!currentItem || !currentItem?.apiPath || !currentItem.apiPath.trim()) {
      return;
    }

    const params = searchFromFilter();
    const requestPath = `${currentItem.apiPath}?${params.toString()}`;
    fetchData(requestPath);
  }

  const columns: ColumnDefinition<UserBaseResponseDto>[] = [
    { key: "id", label: "No" },
    { key: "username", label: "유저명" },
    { key: "nickname", label: "닉네임" },
    { key: "email", label: "이메일" },
    {
      key: "createdAt",
      label: "가입일",
      render: (user) => <span>{formatDate(user.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      label: "수정일",
      render: (user) => <span>{formatDate(user.updatedAt)}</span>,
    },
    { key: "rating", label: "평점" },
    {
      key: "userStatus",
      label: "상태",
      render: (user) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.userStatus === "ACTIVE"
              ? "text-green-600 bg-green-50"
              : user.userStatus === "SUSPENDED"
              ? "text-red-600 bg-red-50"
              : "text-gray-600 bg-gray-50"
          }`}
        >
          {getStatus(user.userStatus)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "관리",
      render: (user) => (
        <ManagementButton user={user} onClick={handleManageClick} />
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            멤버 목록
          </h3>
            <div className="text-sm text-gray-500">
              {data.data.length > 0 ? `총 ${data.data.length}명 검색 완료` : "검색 결과 없음"}
            </div>
        </div>

        {/* 필터 및 검색 영역 */}
        <UserFilterContainer
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
      </div>

      {/* 멤버 상세 정보 모달 */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
