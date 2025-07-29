"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import {
  UserBaseResponseDto,
  UserDetailResponseDto,
  getStatus,
  userStatus,
} from "../../_types/userResponseDto";
import { formatDate } from "../common/dateFormatter";
import UserDetailModal from "../user/manage/userDetailModal";
import { BaseContentComponentProps } from "./baseContentComponentProps";
import {
  UserFilterContainer,
  FilterState,
  SearchType,
} from "../user/filter";

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

export function UserListComponent({
  responseData,
  onRefresh,
}: BaseContentComponentProps) {
  const [selectedUser, setSelectedUser] = useState<UserDetailResponseDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState<FilterState>({
    userStatuses: new Set(["ACTIVE", "SUSPENDED", "INACTIVE"]), // 기본적으로 모든 상태 체크
    searchType: "nickname",
    searchTerm: "",
  });

  const handleManageClick = async (user: UserBaseResponseDto) => {
    console.log(
      `관리 버튼 클릭: 멤버 ID - ${user.id}, 닉네임 - ${user.nickname}`
    );
    setIsLoading(true);

    fetch(`http://localhost:8080/api/v1/admin/users/${user.id}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          setSelectedUser(null);
          return;
        }

        return response.json();
      })
      .then((data) => {
        console.log(data);
        setSelectedUser(data.data as UserDetailResponseDto);
      });

    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const [users, setUsers] = useState<UserBaseResponseDto[]>([]);

  useEffect(() => {
    if (responseData) {
      const data = responseData as UserBaseResponseDto[];
      setUsers(data.reverse());
    }
  }, [responseData]);

  // 필터링된 멤버 목록
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 상태 필터링
      if (!filters.userStatuses.has(user.userStatus)) {
        return false;
      }

      // 검색어 필터링
      if (filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase().trim();
        let searchValue = "";

        switch (filters.searchType) {
          case "id":
            searchValue = user.id.toString();
            break;
          case "username":
            searchValue = user.username.toLowerCase();
            break;
          case "nickname":
            searchValue = user.nickname.toLowerCase();
            break;
        }

        return searchValue.includes(searchTerm);
      }

      return true;
    });
  }, [users, filters]);

  // 상태 체크박스 핸들러
  const handleStatusToggle = (status: userStatus) => {
    const newStatuses = new Set(filters.userStatuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    setFilters((prev) => ({ ...prev, userStatuses: newStatuses }));
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

  const handleSearchTypeChange = (type: SearchType) => {
    setFilters((prev) => ({ ...prev, searchType: type }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      userStatuses: new Set(["ACTIVE", "SUSPENDED", "INACTIVE"]),
      searchType: "nickname",
      searchTerm: "",
    });
  };

  const columns: ColumnDefinition<UserBaseResponseDto>[] = [
    { key: "id", label: "No" },
    { key: "username", label: "유저명" },
    { key: "nickname", label: "닉네임" },
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
            전체 멤버 목록
          </h3>
          <div className="text-sm text-gray-500">
            총 {users.length}명 중 {filteredUsers.length}명 표시
          </div>
        </div>

        {/* 필터 및 검색 영역 */}
        <UserFilterContainer
          filters={filters}
          onStatusToggle={handleStatusToggle}
          onSelectAll={handleSelectAll}
          onSearchTypeChange={handleSearchTypeChange}
          onSearchTermChange={handleSearchChange}
          onReset={resetFilters}
        />

        {/* 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable columns={columns} data={filteredUsers} />
        </div>
      </div>

      {/* 멤버 상세 정보 모달 */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onRefresh={onRefresh} // 새로고침 함수 전달
        />
      )}
    </>
  );
}
