"use client";

import React from "react";
import { ContentComponentProps } from "./baseContentComponentProps";

/*
* 대시보드 컴포넌트
*/
export function DashBoardComponent({ }: ContentComponentProps) {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        대시보드 메인
      </h3>
      <span>대시보드 메인 화면입니다. 메뉴를 클릭하여 정보를 확인해주세요.</span>
    </>
  );
}
