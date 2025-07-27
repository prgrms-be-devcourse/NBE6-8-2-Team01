'use client';

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { SuspendedMember } from "../../_types/suspendedMember";
import { BaseContentComponentProps } from "./baseContentComponentProps";

// --- Mock Data ---
const mockSuspendedMembers: SuspendedMember[] = [
  {
    id: 1,
    userId: "coffee01",
    name: "매니저",
    email: "coffee01@xxx.com",
    suspendedDate: "25-05-01",
    releaseDate: "25-06-02",
    reason: "먹튀",
  },
  {
    id: 2,
    userId: "coffee02",
    name: "김커피",
    email: "coffee02@xxx.com",
    suspendedDate: "25-05-01",
    releaseDate: "25-06-02",
    reason: "자체 검토",
  },
  {
    id: 3,
    userId: "user03",
    name: "박회원",
    email: "user03@test.com",
    suspendedDate: "25-04-20",
    releaseDate: "25-05-20",
    reason: "광고성 게시물",
  },
];

// --- Management Button Component ---

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
      // setSuspendedMembers(responseData);
    }
    // 테스트 목적으로 추가했습니다
    setSuspendedMembers(mockSuspendedMembers);
  }, [responseData]);

  const columns: ColumnDefinition<SuspendedMember>[] = [
    { key: "id", label: "No" },
    { key: "userId", label: "아이디" },
    { key: "name", label: "이름" },
    { key: "email", label: "이메일" },
    { key: "suspendedDate", label: "정지일" },
    { key: "releaseDate", label: "정지 해제일" },
    { key: "reason", label: "사유" },
    {
      key: "actions",
      label: "관리",
      render: (member) => (
        <ManagementButton member={member} onClick={handleManageClick} />
      ),
    },
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
