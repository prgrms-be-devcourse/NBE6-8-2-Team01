'use client';

import React, { useState } from 'react';

// --- Type Definitions ---

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
  data: T[];
}

/**
 * 데이터를 받아 테이블 형태로 렌더링하는 재사용 가능한 컴포넌트
 * @template T - 데이터 객체는 'id' 프로퍼티를 가져야 함.
 */
export function DataTable<T extends { id: string | number }>({ columns, data }: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const PER_PAGE = 10;
  const total = data ? data.length : 0;
  const totalPages = Math.ceil(total / PER_PAGE);
  const startIndex = (page - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  const pagedData = data ? data.slice(startIndex, endIndex) : [];

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
            {pagedData.length > 0 ? (
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
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                    데이터가 없습니다.
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      {total > 0 && total > PER_PAGE && (
        <div className="flex justify-center gap-2 py-5">
          <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
          >
            이전
          </button>
          <span className="px-2 py-2">{page} / {totalPages}</span>
          <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
