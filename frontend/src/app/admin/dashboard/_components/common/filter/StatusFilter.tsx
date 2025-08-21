"use client";

import React from "react";
import { StatusFilterProps } from "@/app/admin/dashboard/_types/filter";
import { FilterItem } from "@/app/admin/dashboard/_components/common/filter/filterItem";

/*
* 대여 게시글 필터
*/
export function StatusFilter<T extends string>({
  title,
  getStatus,
  getFontStyle,
  filterProps
}: StatusFilterProps<T>) {
  const {
      statusList,
      filters,
      isAllSelected,
      selectAll,
      toggleStatus
  } = filterProps;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>
      <div className="flex flex-wrap gap-3">
        <FilterItem
          key="all-status"
          checked={isAllSelected}
          onChange={selectAll}
          fontStyle="ml-2 text-sm text-gray-700 font-medium"
          value="전체"
        />

        {statusList.map(status => (
          <FilterItem
            key={status}
            checked={filters.statuses.has(status)}
            onChange={() => toggleStatus(status)}
            fontStyle={getFontStyle(status)}
            value={getStatus(status)}
          />
        ))}
      </div>
    </div>
  );
}
