import {useFilter} from "@/app/admin/dashboard/_hooks/useFilter";

export interface FilterState<T> {
    statuses : Set<T>;
    searchTerm: string;
}

export interface StatusFilterProps<T> {
    title: string;
    filterProps: ReturnType<typeof useFilter<T>>;
    getStatus: (style: T) => string;
    getFontStyle: (style: T) => string;
}