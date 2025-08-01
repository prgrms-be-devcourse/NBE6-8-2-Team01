'use client';

import React, { useState } from 'react';
import { PageResponse } from "@/app/admin/dashboard/_types/page";
import { useDashBoardContext } from "@/app/admin/dashboard/_hooks/useDashboard";
import { PageButtonContainer } from "@/app/admin/dashboard/_components/common/pageButton";


/**
 * 테이블의 각 열(column)을 정의
 * @template T - 데이터 객체의 타입
 */
export interface ColumnDefinition<T> {
  // 데이터 객체의 키 또는 커스텀 키 (예: 'actions')
  key: keyof T | string;
  // 테이블 헤더에 표시될 라벨
  label: string;
  // 셀 내용을 커스텀하게 렌더링하기 위한 함수 (예: 버튼, 포맷팅된 날짜)
  render?: (item: T) => React.ReactNode;
}

/**
 * DataTable 컴포넌트의 props를 정의
 * @template T - 데이터 객체의 타입
 */
interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: PageResponse<any | null>;
  pageFactory?: () => URLSearchParams;
}

/**
 * 데이터를 받아 테이블 형태로 렌더링하는 재사용 가능한 컴포넌트
 * @template T - 데이터 객체는 'id' 프로퍼티를 가져야 함.
 */
export function DataTable<T extends { id: string | number }>(
    { columns, data, pageFactory }: DataTableProps<T>
) {
  const [page, setPage] = useState(1);
  const { fetchData, currentItem } = useDashBoardContext();

  const PER_PAGE = 10;
  const currentPage = data?.pageInfo?.currentPage || 1;
  const pagedData = data?.data || [];
  const maxPage = data?.pageInfo?.totalPages || 0;

  const getDataFromButton = (newPage: number) => {
    if (!currentItem || !currentItem.apiPath || !currentItem.apiPath.trim()) {
      return;
    }

    setPage(newPage);

    const params = pageFactory ? pageFactory() : new URLSearchParams();

    params.set("page", `${newPage}`);
    params.set("size", `${PER_PAGE}`);

    const requestPath = `${currentItem.apiPath}?${params.toString()}`;
    fetchData(requestPath);
  }

  return (
    <>
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-blue-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData?.length > 0 ? (
              pagedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-7 py-3 whitespace-nowrap text-sm text-gray-800">
                      {/* render 함수가 있으면 실행하고, 없으면 키에 해당하는 값을 그대로 표시 */}
                      {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={columns?.length} className="px-6 py-12 text-center text-sm text-gray-500">
                    데이터가 없습니다.
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      {maxPage > 0 && (
        <
          PageButtonContainer
            page={currentPage}
            setPage={getDataFromButton}
            pageInfo={data.pageInfo}
        />
      )}
    </>
  );
}
