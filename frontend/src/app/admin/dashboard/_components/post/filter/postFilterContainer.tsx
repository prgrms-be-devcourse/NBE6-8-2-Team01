"use client";

import React from "react";
import { PostStatusFilter } from "./postStatusFilter";
import { PostSearchBox } from "./postSearchBox";
import {rentStatus} from "@/app/admin/dashboard/_types/rentPost";

interface FilterState {
  statuses: Set<rentStatus>;
  searchTerm: string;
}

interface UserFilterContainerProps {
  filters: FilterState;
  onStatusToggle: (status: rentStatus) => void;
  onSelectAll: () => void;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
  onSearch: () => void;
}

export function PostFilterContainer({
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
      <PostStatusFilter
        selectedStatuses={filters.statuses}
        onStatusToggle={onStatusToggle}
        onSelectAll={onSelectAll}
      />

      {/* 검색 */}
      <PostSearchBox
        searchTerm={filters.searchTerm}
        onSearchTermChange={onSearchTermChange}
        onReset={onReset}
        onSearch={onSearch}
      />
    </div>
  );
}

export type { FilterState };
