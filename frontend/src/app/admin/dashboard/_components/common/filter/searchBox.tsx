"use client";

import React, { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";

interface SearchBoxProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
  onSearch?: () => void;
}

/*
* 어드민 컴포넌트 용 초기화 / 검색 버튼
*
* 입력된 정보에 따라 초기화 / 검색을 실시하며 성공 시 토스트 알림을 띄웁니다.
*/
export function SearchBox({
  searchTerm,
  onSearchTermChange,
  onReset,
  onSearch : _onSearch,
}: SearchBoxProps) {

  const [enableButton, setEnableButton] = useState(true);

  // 유저 ID 기반으로 검색하기 때문에 숫자가 아니면 검색을 진행할 수 없음
  const checkNumber = (e : ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    const canSubmit = /^\d*$/.test(e.target.value) || !value || value.length == 0;
    setEnableButton(canSubmit);
    onSearchTermChange(value);
  }

  // 리셋
  const reset = () => {
    setEnableButton(true);
    onReset();

    toast.success("필터가 초기화되었습니다");
  }

  // 검색 실행 시
  const onSearch = () => {
    if (!_onSearch) return;

    _onSearch();
    toast.success("검색이 완료되었습니다.");
  }

  // 에러 발생 시
  const onError = (action: string) => {
    toast.error(`${action}에 실패했습니다.`)
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
          onError={_ => onError("초기화")}
          style={{
            cursor : "pointer",
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          초기화
        </button>

        <button
          onClick={enableButton ? onSearch : undefined}
          onError={_ => onError("검색")}
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
