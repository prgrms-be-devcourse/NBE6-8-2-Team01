import React, {useState} from "react";
import { SearchBox } from "./searchBox";
import { useFilter } from "@/app/admin/dashboard/_hooks/useFilter";
import { PageSelector } from "@/app/admin/dashboard/_components/common/filter/PageSelector";
import { ColumnDefinition, DataTable } from "@/app/admin/dashboard/_components/common/Table";
import { useDashBoardContext } from "@/app/admin/dashboard/_hooks/useDashboard";
import { PageResponse } from "@/app/admin/dashboard/_types/page";
import { PageButtonContainer } from "@/app/admin/dashboard/_components/common/pageButton";
import { StatusFilter } from "./StatusFilter";

interface FilterContainerProps<T extends string, Z extends { id: string | number }> {
    filterProps: ReturnType<typeof useFilter<T>>;
    columns: ColumnDefinition<Z>[];
    data: PageResponse<Z>;
    pageFactory: () => URLSearchParams;
    title?: string;
    getStatus?: (style: T) => string;
    getFontStyle?: (style: T) => string;
}

export function FilterContainer<
    T extends string,
    Z extends { id: string | number }
>({
    title,
    filterProps,
    columns,
    data,
    pageFactory,
    getFontStyle,
    getStatus
}: FilterContainerProps<T, Z>) {
    const {
        isExists,
        filters,
        resetFilters,
        setSearchTerm,
        setPerPage
    } = filterProps;

    const { currentItem, fetchData } = useDashBoardContext();
    const [page, setPage] = useState(data?.pageInfo?.currentPage || 1);
    const maxPage = data?.pageInfo?.totalPages || 0;

    const doSearch = () => {
        if (!currentItem || !currentItem.apiPath || currentItem.apiPath.trim().length === 0) {
            return;
        }

        const params = pageFactory();
        const requestPath = `${currentItem.apiPath}?${params.toString()}`;
        fetchData(requestPath);
        setPage(1);
    }

    const getPageData = (newPage: number) => {
        if (!currentItem || !currentItem.apiPath || !currentItem.apiPath.trim()) {
            return;
        }

        setPage(newPage);

        const params = pageFactory ? pageFactory() : new URLSearchParams();

        params.set("page", `${newPage}`);

        const requestPath = `${currentItem.apiPath}?${params.toString()}`;
        fetchData(requestPath);
    }

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                {/* 상태 필터 */}
                <div className="flex justify-between">
                    {(isExists && title && getStatus && getFontStyle) ?
                        <StatusFilter
                            title={title}
                            getStatus={getStatus}
                            getFontStyle={getFontStyle}
                            filterProps={filterProps}
                        />
                        : <></>
                    }

                    <PageSelector setPage={setPerPage} />

                </div>

                {/* 검색 */}
                <SearchBox
                    isListExists={isExists}
                    filterState={filters}
                    onSearchTermChange={setSearchTerm}
                    onReset={resetFilters}
                    onSearch={doSearch}
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
                <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                    <DataTable
                        columns={columns}
                        data={data}
                    />
                </div>
                {maxPage > 0 && (
                    <PageButtonContainer
                        page={page}
                        getPageData={getPageData}
                        pageInfo={data.pageInfo}
                    />
                )}
            </div>
        </>
    );
}