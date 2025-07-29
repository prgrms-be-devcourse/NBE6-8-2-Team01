"use client";

import React from "react";
import { userStatus } from "../../../_types/userResponseDto";

interface UserStatusFilterProps {
  selectedStatuses: Set<userStatus>;
  onStatusToggle: (status: userStatus) => void;
  onSelectAll: () => void;
}

export function UserStatusFilter({
  selectedStatuses,
  onStatusToggle,
  onSelectAll,
}: UserStatusFilterProps) {
  const allStatuses: userStatus[] = ["ACTIVE", "SUSPENDED", "INACTIVE"];
  const isAllSelected = allStatuses.every((status) =>
    selectedStatuses.has(status)
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        회원 상태
      </label>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700 font-medium">전체</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedStatuses.has("ACTIVE")}
            onChange={() => onStatusToggle("ACTIVE")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-green-700">정상</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedStatuses.has("SUSPENDED")}
            onChange={() => onStatusToggle("SUSPENDED")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-red-700">활동 정지</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedStatuses.has("INACTIVE")}
            onChange={() => onStatusToggle("INACTIVE")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">비활성화</span>
        </label>
      </div>
    </div>
  );
}
