import { PageResponse } from "@/app/admin/dashboard/_types/page";

export interface ContentComponentProps {
    data: PageResponse<unknown>;
    onRefresh?: (path?: string) => void;
}