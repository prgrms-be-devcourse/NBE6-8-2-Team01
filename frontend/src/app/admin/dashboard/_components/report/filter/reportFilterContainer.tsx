"use client";

import React from "react";
import { ReportStatusFilter } from "./reportStatusFilter";
import { ReportStatus } from "@/app/admin/dashboard/_types/report";
import { SearchBox } from "../../common/searchBox";

interface FilterState {
  statuses: Set<ReportStatus>;
  searchTerm: string;
}

interface UserFilterContainerProps {
  filters: FilterState;
  onStatusToggle: (status: ReportStatus) => void;
  onSelectAll: () => void;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
  onSearch: () => void;
}

export function ReportFilterContainer({
  filters,
  onStatusToggle,
  onSelectAll,
  onSearchTermChange,
  onReset,
  onSearch,
}: UserFilterContainerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* 상태 필터 */}
      <ReportStatusFilter
        selectedStatuses={filters.statuses}
        onStatusToggle={onStatusToggle}
        onSelectAll={onSelectAll}
      />

      {/* 검색 */}
      <SearchBox
        searchTerm={filters.searchTerm}
        onSearchTermChange={onSearchTermChange}
        onReset={onReset}
        onSearch={onSearch}
      />
    </div>
  );
}

export type { FilterState };
