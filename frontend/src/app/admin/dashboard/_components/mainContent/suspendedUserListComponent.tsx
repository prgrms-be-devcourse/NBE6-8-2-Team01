"use client";

import React from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { SuspendedUser } from "../../_types/suspendedUser";
import { ContentComponentProps } from "./baseContentComponentProps";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";

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

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        정지 멤버 목록
      </h3>
      <DataTable columns={columns} data={data} />
    </>
  );
}
