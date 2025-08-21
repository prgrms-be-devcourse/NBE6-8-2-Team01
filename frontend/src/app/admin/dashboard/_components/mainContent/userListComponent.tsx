"use client";

import React, { useState } from "react";
import UserDetailModal from "../user/manage/userDetailModal";
import fetchUserInfoFromAdmin from "../common/fetchUserInfo";
import { ColumnDefinition } from "../common/Table";
import { UserBaseResponseDto, UserDetailResponseDto, getUserStatus, userStatus } from "../../_types/userResponseDto";
import { formatDate } from "../common/dateFormatter";
import { ContentComponentProps } from "./baseContentComponentProps";
import { toast } from "react-toastify";
import { useFilter } from "../../_hooks/useFilter";
import { FilterContainer } from "../common/filter/FilterContainer";
import { SearchParamFromFilter } from "@/app/admin/dashboard/_components/common/filter/searchParamFromFilter";


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

/*
* 유저 목록 컴포넌트
*/
export function UserListComponent({ data, onRefresh }: ContentComponentProps) {
  const statusList : userStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

  const [selectedUser, setSelectedUser] = useState<UserDetailResponseDto>(
      null as unknown as UserDetailResponseDto
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filterProps = useFilter("admin-user-list-filters", statusList);

  const handleManageClick = async (user: UserBaseResponseDto) => {
    try {
      const userInfo = await fetchUserInfoFromAdmin(user.id);
      setSelectedUser(userInfo as UserDetailResponseDto);

      setIsModalOpen(true);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null as unknown as UserDetailResponseDto);
  };


  // 필터 값을 기준으로 요청을 보낼 parameter를 생성함
  const searchFromFilter = () => {
    return SearchParamFromFilter(filterProps, "userId");
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
          {getUserStatus(user.userStatus)}
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

  const getStyle = (status : userStatus)=> {
    switch (status) {
      case "ACTIVE":
        return "ml-2 text-sm text-emerald-700 font-medium"
      case "SUSPENDED":
        return "ml-2 text-sm text-red-700 font-medium";
      case "INACTIVE":
        return "ml-2 text-sm text-yellow-700 font-medium";
      default:
        return "ml-2 text-sm text-slate-700 font-medium";
    }
  }

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
        <FilterContainer
          title="회원 상태"
          filterProps={filterProps}
          columns={columns}
          data={data}
          pageFactory={searchFromFilter}
          getStatus={getUserStatus}
          getFontStyle={getStyle}
        />
      </div>

      {/* 멤버 상세 정보 모달 */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
