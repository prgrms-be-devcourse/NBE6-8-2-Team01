import { useFilter } from "@/app/admin/dashboard/_hooks/useFilter";

export function SearchParamFromFilter<T>(
    filterProps : ReturnType<typeof useFilter<T>>,
    searchTermKey : string
){
    const params = new URLSearchParams();
    const filters = filterProps.filters;

    filters.statuses.forEach(status => {
        params.append("status", status as string);
    });

    if (filters.searchTerm) {
        const id = Number(filters.searchTerm.trim());
        if (id) params.append(searchTermKey, String(id));
    }

    params.append("size", `${filterProps.perPage}`);
    return params;
}