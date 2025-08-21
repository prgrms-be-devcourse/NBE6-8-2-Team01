'use client';

import React, { useState } from "react";
import ReportDetailWithUserModal from "@/app/admin/dashboard/_components/report/manage/reportDetailWithUserModal";
import { ColumnDefinition } from "../common/Table";
import { ContentComponentProps } from "./baseContentComponentProps";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";
import { useFilter } from "../../_hooks/useFilter";
import { FilterContainer } from "@/app/admin/dashboard/_components/common/filter/FilterContainer";
import { SearchParamFromFilter } from "@/app/admin/dashboard/_components/common/filter/searchParamFromFilter";
import {
  getReportStatus,
  ReportDetailResponseDto,
  ReportSimpleResponseDto,
  ReportStatus
} from "../../_types/report";


interface ManagementButtonProps {
  report: ReportSimpleResponseDto;
  onClick: (report: ReportSimpleResponseDto) => void;
}

function ManagementButton({ report, onClick }: ManagementButtonProps) {
  return (
    <button
      onClick={() => onClick(report)}
      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
    >
      관리
    </button>
  );
}

/*
* 유저 신고 목록을 나타내는 컴포넌트
*/
export function ReportHistoryComponent({ data, onRefresh }: ContentComponentProps) {
  const statusList : ReportStatus[] = ["PENDING", "REVIEWED", "PROCESSED"];

  const [selectedReport, setSelectedReport] = useState<ReportDetailResponseDto>(
      null as unknown as ReportDetailResponseDto
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filterProps = useFilter('admin-user-report-list-filters', statusList)

  const handleManageClick = async (report : ReportSimpleResponseDto) => {
    const response = await fetch(
        `/api/v1/admin/reports/${report.id}/review`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
    )

    const data = await response.json().then(data => {
      return data.data as ReportDetailResponseDto;
    }).catch(error => {
      return null as unknown as ReportDetailResponseDto
    });

    setSelectedReport(data);

    if (!data) return;

    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedReport(null as unknown as ReportDetailResponseDto);
  };

  const searchFromFilter = () => {
    return SearchParamFromFilter(filterProps, "targetUserId");
  }

  const columns: ColumnDefinition<ReportSimpleResponseDto>[] = [
    { key: "id", label: "No" },
    {
      key: "status",
      label: "처리 상태",
      render : report => (
          <>{getReportStatus(report.status)}</>
      )
    },
    { key: "reporterUserId", label: "신고자 ID" },
    { key: "targetUserId", label: "신고대상자 ID" },
    {
      key: "createdDate",
      label: "신고일",
      render : report => <>{formatDate(report.createdDate)}</>
    },
    {
      key: "actions",
      label: "관리",
      render: (report) => (
        <ManagementButton report={report} onClick={handleManageClick} />
      ),
    },
  ];

  const getStyle = (status : ReportStatus)=> {
    switch (status) {
      case "PENDING":
        return "ml-2 text-sm text-emerald-700 font-medium"
      case "REVIEWED":
        return "ml-2 text-sm text-yellow-700 font-medium";
      case "PROCESSED":
        return "ml-2 text-sm text-red-700 font-medium";
      default:
        return "ml-2 text-sm text-slate-700 font-medium";
    }
  }

  return (
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            신고 목록
          </h3>
          <div className="text-sm text-gray-500">
            {(data?.data?.length ?? 0) > 0 ? `총 ${data.data.length}건 검색 완료` : "검색 결과 없음"}
          </div>
        </div>

        {/* 필터 및 검색 영역 */}
        <FilterContainer
            title="회원 상태"
            filterProps={filterProps}
            columns={columns}
            data={data}
            pageFactory={searchFromFilter}
            getStatus={getReportStatus}
            getFontStyle={getStyle}
        />

        {/* 멤버 상세 정보 모달 */}
        {selectedReport && (
            <ReportDetailWithUserModal
                report={selectedReport}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onRefresh={onRefresh}
            />
        )}
      </div>
  );
}
