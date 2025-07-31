"use client";

import React from "react";
import { UserStatusFilter } from "./userStatusFilter";
import { UserSearchBox } from "./userSearchBox";
import { userStatus } from "../../../_types/userResponseDto";

interface FilterState {
  userStatuses: Set<userStatus>;
  searchTerm: string;
}

interface UserFilterContainerProps {
  filters: FilterState;
  onStatusToggle: (status: userStatus) => void;
  onSelectAll: () => void;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
  onSearch: () => void;
}

export function UserFilterContainer({
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
      <UserStatusFilter
        selectedStatuses={filters.userStatuses}
        onStatusToggle={onStatusToggle}
        onSelectAll={onSelectAll}
      />

      {/* 검색 */}
      <UserSearchBox
        searchTerm={filters.searchTerm}
        onSearchTermChange={onSearchTermChange}
        onReset={onReset}
        onSearch={onSearch}
      />
    </div>
  );
}

export type { FilterState };
