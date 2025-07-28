"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { SuspendedMember } from "../../_types/suspendedMember";
import { BaseContentComponentProps } from "./baseContentComponentProps";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";

interface ManagementButtonProps {
  member: SuspendedMember;
  onClick: (memberId: number) => void;
}

function ManagementButton({ member, onClick }: ManagementButtonProps) {
  return (
    <button
      onClick={() => onClick(member.id)}
      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
    >
      관리
    </button>
  );
}

export function SuspendedMemberListComponent({ responseData }: BaseContentComponentProps) {
  const handleManageClick = (memberId: number) => {
    console.log(`관리 버튼 클릭: 멤버 ID - ${memberId}`);
    // TODO: 멤버 관리 로직 구현 (예: 정지 해제 API 호출)
  };

  // 데이터를 호출한 이후 useState를 이용해 변환하기
  const [suspendedMembers, setSuspendedMembers] = useState<SuspendedMember[]>([]);

  useEffect(() => {
    if (responseData) {
      const data = responseData as SuspendedMember[];
      setSuspendedMembers(data.reverse());
    }
  }, [responseData]);

  const columns: ColumnDefinition<SuspendedMember>[] = [
    { key: "id", label: "No" },
    { key: "userId", label: "아이디" },
    { key: "name", label: "이름" },
    { key: "email", label: "이메일" },
    {
      key: "suspendedAt",
      label: "정지일",
      render: (member) => <span>{formatDate(member.suspendedAt)}</span>,
    },
    {
      key: "resumedAt",
      label: "정지 해제일",
      render: (member) => <span>{formatDate(member.resumedAt)}</span>,
    },
    { key: "reason", label: "사유" },
  ];

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        정지 멤버 목록
      </h3>
      <DataTable columns={columns} data={suspendedMembers} />
    </>
  );
}
