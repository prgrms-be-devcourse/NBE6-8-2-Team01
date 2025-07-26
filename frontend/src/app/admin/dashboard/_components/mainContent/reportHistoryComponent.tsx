'use client';

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { Report } from "../../_types/report";
import { BaseContentComponentProps } from "./baseContentComponentProps";

// --- Mock Data ---
const mockReports: Report[] = [
  {
    id: 1,
    userId: 1,
    reportedUserId: 2,
    title: "제 책을 갖고 튀었어요",
    description: "제 하나 밖에 없는 소중한 책이예요 제발 꼭 잡아주세요!!",
    createdDate: "25-05-10"
  },
  {
    id: 2,
    userId: 3,
    reportedUserId: 4,
    title: "오랫동안 연락이 없고 돌려주지 않고 있어요",
    description: "조치 좀 해주시면 감사드리겠습니다!",
    createdDate: "25-05-20"
  },
  {
    id: 3,
    userId: 6,
    reportedUserId: 7,
    title: "광고글 같아요 신고합니다",
    description: "광고글 같아 보입니다. 해당 회원에 대해 조치 좀 부탁드려요",
    createdDate: "25-05-11"
  }
];

// --- Management Button Component ---

interface ManagementButtonProps {
  report: Report;
  onClick: (memberId: number) => void;
}

function ManagementButton({ report, onClick }: ManagementButtonProps) {
  return (
    <button
      onClick={() => onClick(report.id)}
      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
    >
      관리
    </button>
  );
}

export function ReportHistoryComponent({ responseData }: BaseContentComponentProps) {
  const handleManageClick = (reportId: number) => {
    console.log(`관리 버튼 클릭: 신고 ID - ${reportId}`);
    /** TODO: 멤버 관리 로직 구현 (예: 정지 해제 API 호출)
      * TODO: 모달을 통해 멤버를 정지시킬 수 있음
     */
  };

    // 데이터를 호출한 이후 useState를 이용해 변환하기
  const [suspendedMembers, setSuspendedMembers] = useState<Report[]>([]);

  useEffect(() => {
    if (responseData) {
      // setSuspendedMembers(responseData);
    }
    // TODO: 테스트 목적으로 추가. 수정 필요
    setSuspendedMembers(mockReports);
  }, [responseData]);

  const columns: ColumnDefinition<Report>[] = [
    { key: "id", label: "No" },
    { key: "userId", label: "신고자 ID" },
    { key: "reportedUserId", label: "신고대상자 ID" },
    { key: "title", label: "제목" },
    { key: "description", label: "세부내용" },
    { key: "createdDate", label: "신고일" },
    {
      key: "actions",
      label: "관리",
      render: (report) => (
        <ManagementButton report={report} onClick={handleManageClick} />
      ),
    },
  ];

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        신고 목록
      </h3>
        <DataTable columns={columns} data={suspendedMembers} />
    </>
  );
}
