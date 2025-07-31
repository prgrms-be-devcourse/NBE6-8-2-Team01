"use client";

import React from "react";
import { userStatus } from "../../../_types/userResponseDto";

interface UserStatusFilterProps {
  selectedStatuses: Set<userStatus>;
  onStatusToggle: (status: userStatus) => void;
  onSelectAll: () => void;
}

interface UserStatusFilterState {
  checked: boolean;
  onChange: () => void;
  value: string;
  fontStyle: string
}

function UserStatusFilterItem({ checked, onChange, fontStyle, value} : UserStatusFilterState) {
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
        <UserStatusFilterItem
          checked={isAllSelected}
          onChange={onSelectAll}
          fontStyle="ml-2 text-sm text-gray-700 font-medium"
          value="전체"
        />

        <UserStatusFilterItem
            checked={selectedStatuses.has("ACTIVE")}
            onChange={() => onStatusToggle("ACTIVE")}
            fontStyle="ml-2 text-sm text-green-700"
            value="정상"
        />

        <UserStatusFilterItem
            checked={selectedStatuses.has("SUSPENDED")}
            onChange={() => onStatusToggle("SUSPENDED")}
            fontStyle="ml-2 text-sm text-red-700"
            value="활동 정지"
        />

        <UserStatusFilterItem
            checked={selectedStatuses.has("INACTIVE")}
            onChange={() => onStatusToggle("INACTIVE")}
            fontStyle="ml-2 text-sm text-gray-700"
            value="비활성화"
        />
      </div>
    </div>
  );
}
