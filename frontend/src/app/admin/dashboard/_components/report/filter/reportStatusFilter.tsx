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

  const fontStyle = (status : ReportStatus) => {
    const base = "ml-2 text-sm text-";
    let color: string;

    switch (status) {
      case "PENDING":
        color = "green"
        break;
      case "REVIEWED":
        color = "blue"
        break;
      case "PROCESSED":
        color = "gray"
        break;
      default:
        color = "gray";
        break;
    }

    return base + color + "-700 font-medium";
  }

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

        {allStatuses.map(status => (
          <ReportStatusFilterItem
            key={status}
            checked={selectedStatuses.has(status)}
            onChange={() => onStatusToggle(status)}
            fontStyle={fontStyle(status)}
            value={getReportStatus(status)}
          />
        ))}
      </div>
    </div>
  );
}
