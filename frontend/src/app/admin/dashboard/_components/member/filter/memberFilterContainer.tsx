"use client";

import React from "react";
import { MemberStatusFilter } from "./memberStatusFilter";
import { MemberSearchBox, SearchType } from "./memberSearchBox";
import { userStatus } from "../../../_types/userResponseDto";

interface FilterState {
  userStatuses: Set<userStatus>;
  searchType: SearchType;
  searchTerm: string;
}

interface MemberFilterContainerProps {
  filters: FilterState;
  onStatusToggle: (status: userStatus) => void;
  onSelectAll: () => void;
  onSearchTypeChange: (type: SearchType) => void;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
}

export function MemberFilterContainer({
  filters,
  onStatusToggle,
  onSelectAll,
  onSearchTypeChange,
  onSearchTermChange,
  onReset,
}: MemberFilterContainerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* 상태 필터 */}
      <MemberStatusFilter
        selectedStatuses={filters.userStatuses}
        onStatusToggle={onStatusToggle}
        onSelectAll={onSelectAll}
      />

      {/* 검색 */}
      <MemberSearchBox
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
