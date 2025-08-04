"use client";

import React from "react";
import { getReportStatus, ReportStatus } from "@/app/admin/dashboard/_types/report";

interface ReportStatusFilterProps {
  selectedStatuses: Set<ReportStatus>;
  onStatusToggle: (status: ReportStatus) => void;
  onSelectAll: () => void;
}

interface ReportStatusFilterState {
  checked: boolean;
  onChange: () => void;
  value: string;
  fontStyle: string
}

function ReportStatusFilterItem({ checked, onChange, fontStyle, value} : ReportStatusFilterState) {
  return (
      <label className="flex items-center">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className={fontStyle}>{value}</span>
      </label>
  )
}

export function ReportStatusFilter({
  selectedStatuses,
  onStatusToggle,
  onSelectAll,
}: ReportStatusFilterProps) {
  const allStatuses: ReportStatus[] = ["PENDING", "REVIEWED", "PROCESSED"];

  const isAllSelected = allStatuses.every((status) =>
    selectedStatuses.has(status)
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        회원 상태
      </label>
      <div className="flex flex-wrap gap-3">
        <ReportStatusFilterItem
          checked={isAllSelected}
          onChange={onSelectAll}
          fontStyle="ml-2 text-sm text-gray-700 font-medium"
          value="전체"
        />

        <ReportStatusFilterItem
            checked={selectedStatuses.has("PENDING")}
            onChange={() => onStatusToggle("PENDING")}
            fontStyle="ml-2 text-sm text-green-700"
            value={getReportStatus("PENDING")}
        />

        <ReportStatusFilterItem
            checked={selectedStatuses.has("REVIEWED")}
            onChange={() => onStatusToggle("REVIEWED")}
            fontStyle="ml-2 text-sm text-red-700"
            value={getReportStatus("REVIEWED")}
        />

        <ReportStatusFilterItem
            checked={selectedStatuses.has("PROCESSED")}
            onChange={() => onStatusToggle("PROCESSED")}
            fontStyle="ml-2 text-sm text-gray-700"
            value={getReportStatus("PROCESSED")}
        />
      </div>
    </div>
  );
}
