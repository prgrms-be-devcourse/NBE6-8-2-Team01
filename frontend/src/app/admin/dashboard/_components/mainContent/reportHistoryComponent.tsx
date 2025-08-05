'use client';

import React, { useCallback, useEffect, useState } from "react";
import { DataTable, ColumnDefinition } from "../common/Table";
import { ContentComponentProps } from "./baseContentComponentProps";
import { useDashBoardContext } from "@/app/admin/dashboard/_hooks/useDashboard";
import { FilterState, ReportFilterContainer } from "@/app/admin/dashboard/_components/report/filter";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";
import ReportDetailWithUserModal from "@/app/admin/dashboard/_components/report/manage/reportDetailWithUserModal";
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

export function ReportHistoryComponent({ data, onRefresh }: ContentComponentProps) {
  const statusList : ReportStatus[] = ["PENDING", "REVIEWED", "PROCESSED"];

  const [selectedReport, setSelectedReport] = useState<ReportDetailResponseDto>(
      null as unknown as ReportDetailResponseDto
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentItem, fetchData } = useDashBoardContext();

  const getInitialFilters = (): FilterState => {
    try {
      const saved = sessionStorage.getItem('admin-user-report-list-filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          statuses: new Set(parsed.statuses || statusList),
          searchTerm: parsed.searchTerm || "",
        };
      }
    } catch (error) {
      console.warn('필터 상태 복원 실패:', error);
    }

    return {
      statuses: new Set(statusList),
      searchTerm: "",
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);

  const saveFilters = useCallback(() => {
    try {
      const toSave = {
        statuses: Array.from(filters.statuses),
        searchTerm: filters.searchTerm,
      };
      sessionStorage.setItem('admin-user-report-list-filters', JSON.stringify(toSave));
    } catch (error) {
      console.warn('필터 상태 저장 실패:', error);
    }
  }, [filters]);

  const handleManageClick = async (report : ReportSimpleResponseDto) => {
    console.log(`관리 버튼 클릭: 멤버 ID - ${report.id}`);

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

  useEffect(() => {
    saveFilters();
  }, [saveFilters]);

  const handleStatusToggle = (status: ReportStatus) => {
    const newStatuses = new Set(filters.statuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }

    if (newStatuses.size === 0) {
      setFilters((prev) => ({ ...prev, statuses: new Set(statusList)}));
    } else {
      setFilters((prev) => ({ ...prev, statuses: newStatuses }));
    }
  };

  const handleSelectAll = () => {
    const allStatuses: ReportStatus[] = statusList;
    const isAllSelected = allStatuses.every((status) =>
        filters.statuses.has(status)
    );

    if (isAllSelected) {
      setFilters((prev) => ({ ...prev, statuses: new Set() }));
    } else {
      setFilters((prev) => ({ ...prev, statuses: new Set(allStatuses) }));
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  const resetFilters = () => {
    const resetState: FilterState = {
      statuses: new Set(statusList),
      searchTerm: "",
    };
    setFilters(resetState);
  };

  const searchFromFilter = () => {
    const params = new URLSearchParams();

    filters.statuses.forEach(status => params.append("status", status));

    if (filters.searchTerm) {
      const userId = Number(filters.searchTerm.trim());
      if (userId) params.append("targetUserId", `${userId}`);
    }

    return params
  }

  const doSearch = () => {
    if (!currentItem || !currentItem.apiPath || currentItem.apiPath.trim().length === 0) {
      return;
    }

    const params = searchFromFilter();
    const requestPath = `${currentItem.apiPath}?${params.toString()}`;
    fetchData(requestPath);
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
        <ReportFilterContainer
            filters={filters}
            onStatusToggle={handleStatusToggle}
            onSelectAll={handleSelectAll}
            onSearchTermChange={handleSearchChange}
            onReset={resetFilters}
            onSearch={doSearch}
        />

        {/* 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
              columns={columns}
              data={data}
              pageFactory={searchFromFilter}
          />
        </div>

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
