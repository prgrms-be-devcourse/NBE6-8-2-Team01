"use client";

import React from "react";
import { ColumnDefinition } from "../common/Table";
import { SuspendedUser } from "../../_types/suspendedUser";
import { ContentComponentProps } from "./baseContentComponentProps";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";
import { FilterContainer } from "@/app/admin/dashboard/_components/common/filter/FilterContainer";
import { SearchParamFromFilter } from "@/app/admin/dashboard/_components/common/filter/searchParamFromFilter";
import { useFilter } from "@/app/admin/dashboard/_hooks/useFilter";


/*
* 정지 유저 이력을 나타내는 컴포넌트
*/
export function SuspendedUserListComponent({ data }: ContentComponentProps) {
  const columns: ColumnDefinition<SuspendedUser>[] = [
    { key: "id", label: "No" },
    { key: "userId", label: "아이디" },
    { key: "name", label: "이름" },
    {
      key: "suspendedAt",
      label: "정지일",
      render: (user) => <span>{formatDate(user.suspendedAt)}</span>,
    },
    {
      key: "resumedAt",
      label: "정지 해제일",
      render: (user) => <span>{formatDate(user.resumedAt)}</span>,
    },
    { key: "reason", label: "사유" },
  ];

  const filterProps = useFilter('admin-suspended-history-list', []);
  const searchFromFilter = () => {
    return SearchParamFromFilter(filterProps, "userId");
  }

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        정지 멤버 목록
      </h3>
      <FilterContainer
          filterProps={filterProps}
          columns={columns}
          data={data}
          pageFactory={searchFromFilter}
      />
    </>
  );
}
