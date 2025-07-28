"use client";

import React from "react";

export type SearchType = "id" | "username" | "nickname" | "email";

interface MemberSearchBoxProps {
  searchType: SearchType;
  searchTerm: string;
  onSearchTypeChange: (type: SearchType) => void;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
}

export function MemberSearchBox({
  searchType,
  searchTerm,
  onSearchTypeChange,
  onSearchTermChange,
  onReset,
}: MemberSearchBoxProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        검색
      </label>
      <div className="flex gap-2">
        <select
          value={searchType}
          onChange={(e) => onSearchTypeChange(e.target.value as SearchType)}
          className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="id">멤버 ID</option>
          <option value="username">유저명</option>
          <option value="nickname">닉네임</option>
          <option value="email">이메일</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder={`${
            searchType === "id"
              ? "멤버 ID"
              : searchType === "username"
              ? "유저명"
              : searchType === "nickname"
              ? "닉네임"
              : "이메일"
          }로 검색...`}
          className="flex-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />

        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
