'use client';

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { Member } from "../../_types/member";
import {BaseContentComponentProps} from "@/app/admin/dashboard/_components/mainContent/baseContentComponentProps";

// --- Mock Data ---
const mockMembers: Member[] = [
  {
    id: 1,
    userId: "coffee01",
    name: "매니저",
    email: "coffee01@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 2,
    userId: "coffee02",
    name: "김커피",
    email: "coffee02@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 3,
    userId: "user03",
    name: "박회원",
    email: "user03@test.com",
    createDate: "25-04-20",
    lastModifiedDate: "25-05-20",
    status: "일시정지",
  },
  {
    id: 4,
    userId: "coffee01",
    name: "매니저",
    email: "coffee01@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 5,
    userId: "coffee02",
    name: "김커피",
    email: "coffee02@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 6,
    userId: "user03",
    name: "박회원",
    email: "user03@test.com",
    createDate: "25-04-20",
    lastModifiedDate: "25-05-20",
    status: "일시정지",
  },
  {
    id: 7,
    userId: "coffee01",
    name: "매니저",
    email: "coffee01@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 8,
    userId: "coffee02",
    name: "김커피",
    email: "coffee02@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 9,
    userId: "user03",
    name: "박회원",
    email: "user03@test.com",
    createDate: "25-04-20",
    lastModifiedDate: "25-05-20",
    status: "일시정지",
  },
  {
    id: 10,
    userId: "coffee01",
    name: "매니저",
    email: "coffee01@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 11,
    userId: "coffee02",
    name: "김커피",
    email: "coffee02@xxx.com",
    createDate: "25-05-01",
    lastModifiedDate: "25-06-02",
    status: "정상",
  },
  {
    id: 12,
    userId: "user03",
    name: "박회원",
    email: "user03@test.com",
    createDate: "25-04-20",
    lastModifiedDate: "25-05-20",
    status: "일시정지",
  }
];

interface ManagementButtonProps {
  member: Member;
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

export function MemberListComponent({ responseData }: BaseContentComponentProps) {
  const handleManageClick = (memberId: number) => {
    console.log(`관리 버튼 클릭: 멤버 ID - ${memberId}`);
    // TODO: 멤버 관리 로직 구현 (예: 강제 탈퇴, 정지 등)
  };

  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (responseData) {
      // setMembers(responseData);
    }
    // TODO: 테스트 목적으로 추가. 수정 필요
    setMembers(mockMembers);
  }, [responseData]);

  const columns: ColumnDefinition<Member>[] = [
    { key: "id", label: "No" },
    { key: "userId", label: "아이디" },
    { key: "name", label: "이름" },
    { key: "email", label: "이메일" },
    { key: "createDate", label: "가입일" },
    { key: "lastModifiedDate", label: "마지막 수정일" },
    { key: "status", label: "상태" },
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
        전체 멤버 목록
      </h3>
      <DataTable columns={columns} data={members} />
    </>
  );
}
