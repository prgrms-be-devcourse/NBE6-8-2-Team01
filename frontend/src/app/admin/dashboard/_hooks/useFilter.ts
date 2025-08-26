import { FilterState } from "@/app/admin/dashboard/_types/filter";
import { useCallback, useEffect, useState } from "react";

/*
* Filter를 사용하는 모든 컴포넌트에 사용되는 훅입니다
*
* @param key 세션 스토리지에 필터 정보를 임시 저장하는
* */
export function useFilter<T>(
    key: string,
    defaultStatusList : T[]
) {
    // 필터 로딩
    const isExists = defaultStatusList?.length !== 0;

    const getInitialFilters = useCallback((): FilterState<T> => {
        try {
            const saved = sessionStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    statuses: new Set(parsed.statuses || defaultStatusList),
                    searchTerm: parsed.searchTerm || "",
                };
            }
        } catch (error) {}
        return {
            statuses: new Set(defaultStatusList),
            searchTerm: "",
        };
    }, [key, defaultStatusList]);

    const [filters, setFilters] = useState<FilterState<T>>(getInitialFilters);

    const [perPage, setPerPage] = useState(10);

    const isAllSelected = defaultStatusList.every(status => filters.statuses.has(status));

    // 필터 저장
    useEffect(() => {
        try {
            const toSave = {
                statuses: Array.from(filters.statuses),
                searchTerm: filters.searchTerm,
            };
            sessionStorage.setItem(key, JSON.stringify(toSave));
        } catch (error) {}
    }, [filters, key])

    // 필터 업데이트 함수들
    const updateFilters = useCallback((updates: Partial<FilterState<T>>) => {
        setFilters(prev => ({ ...prev, ...updates }));
    }, []);

    const toggleStatus = useCallback((status: T) => {
        setFilters(prev => {
            const newStatuses = new Set(prev.statuses);
            if (newStatuses.has(status)) {
                newStatuses.delete(status);
            } else {
                newStatuses.add(status);
            }

            return { ...prev, statuses: newStatuses };
        });
    }, []);

    const selectAll = useCallback(() => {
        setFilters(prev => {
            const allStatuses = new Set(defaultStatusList);

            return {
                ...prev,
                statuses: isAllSelected ? new Set() : allStatuses
            };
        });
    }, [defaultStatusList, isAllSelected]);

    const resetFilters = useCallback(() => {
        setFilters({
            statuses: new Set(defaultStatusList),
            searchTerm: "",
        });
        setPerPage(10);
    }, [defaultStatusList]);

    const setSearchTerm = useCallback((searchTerm: string) => {
        setFilters(prev => ({ ...prev, searchTerm: searchTerm }));
    }, []);

    return {
        statusList: defaultStatusList,
        isExists,
        filters,
        updateFilters,
        toggleStatus,
        selectAll,
        resetFilters,
        setSearchTerm,
        isAllSelected,
        perPage,
        setPerPage
    };
}