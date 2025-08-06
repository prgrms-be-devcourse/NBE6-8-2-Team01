export interface PageResponse<T> {
    data: T[];
    pageInfo: PageInfo;
}

export interface PageInfo {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
}