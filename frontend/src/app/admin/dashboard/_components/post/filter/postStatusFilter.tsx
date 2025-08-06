"use client";

import React from "react";
import { getRentStatus, rentStatus } from "@/app/admin/dashboard/_types/rentPost";

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

/*
* 대여 게시글 필터
*/
export function PostStatusFilter({
  selectedStatuses,
  onStatusToggle,
  onSelectAll,
}: PostStatusFilterProps) {
  const allStatuses: rentStatus[] = ["AVAILABLE", "LOANED", "FINISHED", "DELETED"];

  const isAllSelected = allStatuses.every((status) =>
    selectedStatuses.has(status)
  );

  const fontStyle = (status : rentStatus) => {
      switch (status) {
          case "AVAILABLE":
              return "ml-2 text-sm text-green-700"
          case "LOANED":
              return "ml-2 text-sm text-blue-700"
          case "FINISHED":
              return "ml-2 text-sm text-gray-700"
          case "DELETED":
              return "ml-2 text-sm text-red-700"
          default:
              return ""
      }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        글 상태
      </label>
      <div className="flex flex-wrap gap-3">
        <PostStatusFilterItem
          checked={isAllSelected}
          onChange={onSelectAll}
          fontStyle="ml-2 text-sm text-gray-700 font-medium"
          value="전체"
        />
        {allStatuses.map(status => (
          <PostStatusFilterItem
            key={status}
            checked={selectedStatuses.has(status)}
            onChange={() => onStatusToggle(status)}
            fontStyle={fontStyle(status)}
            value={getRentStatus(status)}
          />
        ))}
      </div>
    </div>
  );
}
