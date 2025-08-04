"use client";

import React, { ChangeEvent, useState } from "react";

interface SearchBoxProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
  onSearch?: () => void;
}

export function SearchBox({
  searchTerm,
  onSearchTermChange,
  onReset,
  onSearch,
}: SearchBoxProps) {

  const [enableButton, setEnableButton] = useState(true);
  const reset = () => {
    setEnableButton(true);
    onReset();
  }

  const checkNumber = (e : ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    const canSubmit = /^\d*$/.test(e.target.value) || !value || value.length == 0;
    setEnableButton(canSubmit);
    onSearchTermChange(value);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        검색
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={checkNumber}
          placeholder="(선택) 유저 ID로도 검색..."
          className="flex-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />

        <button
          onClick={reset}
          style={{
            cursor : "pointer",
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          초기화
        </button>

        <button
          onClick={enableButton ? onSearch : undefined}
          style={{
            cursor: enableButton ? "pointer" : "not-allowed",
            opacity: enableButton ? 1 : 0.6,
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          검색
        </button>
      </div>
      {!enableButton && (
          <span className="text-xs text-red-500">숫자만 입력 가능합니다!</span>
      )}
    </div>
  );
}
