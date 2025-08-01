"use client";

import React from "react";

interface PostSearchBoxProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
  onSearch?: () => void;
}

export function PostSearchBox({
  searchTerm,
  onSearchTermChange,
  onReset,
  onSearch,
}: PostSearchBoxProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        검색
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="유저명으로도 검색..."
          className="flex-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />

        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          초기화
        </button>

        <button
          onClick={onSearch}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          검색
        </button>
      </div>
    </div>
  );
}
