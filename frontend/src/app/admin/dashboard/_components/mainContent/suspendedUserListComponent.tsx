"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { SuspendedUser } from "../../_types/suspendedUser";
import { BaseContentComponentProps } from "./baseContentComponentProps";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";

export function SuspendedUserListComponent({ responseData }: BaseContentComponentProps) {
  const handleManageClick = (userId: number) => {
    console.log(`관리 버튼 클릭: 멤버 ID - ${userId}`);
    // TODO: 멤버 관리 로직 구현 (예: 정지 해제 API 호출)
  };

  // 데이터를 호출한 이후 useState를 이용해 변환하기
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);

  useEffect(() => {
    if (responseData) {
      const data = responseData as SuspendedUser[];
      setSuspendedUsers(data.reverse());
    }
  }, [responseData]);

  const columns: ColumnDefinition<SuspendedUser>[] = [
    { key: "id", label: "No" },
    { key: "userId", label: "아이디" },
    { key: "name", label: "이름" },
    { key: "email", label: "이메일" },
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
      <DataTable columns={columns} data={suspendedUsers} />
    </>
  );
}
