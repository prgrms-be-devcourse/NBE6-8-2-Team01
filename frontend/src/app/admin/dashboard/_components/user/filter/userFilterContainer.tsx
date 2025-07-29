"use client";

import React from "react";
import { UserStatusFilter } from "./userStatusFilter";
import { UserSearchBox, SearchType } from "./userSearchBox";
import { userStatus } from "../../../_types/userResponseDto";

interface FilterState {
  userStatuses: Set<userStatus>;
  searchType: SearchType;
  searchTerm: string;
}

interface UserFilterContainerProps {
  filters: FilterState;
  onStatusToggle: (status: userStatus) => void;
  onSelectAll: () => void;
  onSearchTypeChange: (type: SearchType) => void;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
}

export function UserFilterContainer({
  filters,
  onStatusToggle,
  onSelectAll,
  onSearchTypeChange,
  onSearchTermChange,
  onReset,
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
        searchType={filters.searchType}
        searchTerm={filters.searchTerm}
        onSearchTypeChange={onSearchTypeChange}
        onSearchTermChange={onSearchTermChange}
        onReset={onReset}
      />
    </div>
  );
}

export type { FilterState, SearchType };
