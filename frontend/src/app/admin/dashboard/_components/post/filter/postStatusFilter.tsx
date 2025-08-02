"use client";

import React from "react";
import {getRentStatus, rentStatus} from "@/app/admin/dashboard/_types/rentPost";

interface PostStatusFilterProps {
  selectedStatuses: Set<rentStatus>;
  onStatusToggle: (status: rentStatus) => void;
  onSelectAll: () => void;
}

interface PostStatusFilterState {
  checked: boolean;
  onChange: () => void;
  value: string;
  fontStyle: string
}

function PostStatusFilterItem({ checked, onChange, fontStyle, value} : PostStatusFilterState) {
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

export function PostStatusFilter({
  selectedStatuses,
  onStatusToggle,
  onSelectAll,
}: PostStatusFilterProps) {
  const allStatuses: rentStatus[] = ["AVAILABLE", "LOANED", "FINISHED"];

  const isAllSelected = allStatuses.every((status) =>
    selectedStatuses.has(status)
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        회원 상태
      </label>
      <div className="flex flex-wrap gap-3">
        <PostStatusFilterItem
          checked={isAllSelected}
          onChange={onSelectAll}
          fontStyle="ml-2 text-sm text-gray-700 font-medium"
          value="전체"
        />

        <PostStatusFilterItem
            checked={selectedStatuses.has("AVAILABLE")}
            onChange={() => onStatusToggle("AVAILABLE")}
            fontStyle="ml-2 text-sm text-green-700"
            value={getRentStatus("AVAILABLE")}
        />

        <PostStatusFilterItem
            checked={selectedStatuses.has("LOANED")}
            onChange={() => onStatusToggle("LOANED")}
            fontStyle="ml-2 text-sm text-red-700"
            value={getRentStatus("LOANED")}
        />

        <PostStatusFilterItem
            checked={selectedStatuses.has("FINISHED")}
            onChange={() => onStatusToggle("FINISHED")}
            fontStyle="ml-2 text-sm text-gray-700"
            value={getRentStatus("FINISHED")}
        />
      </div>
    </div>
  );
}
