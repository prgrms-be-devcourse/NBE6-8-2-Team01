import { PageResponse } from "@/app/admin/dashboard/_types/page";

/*
* 메인 페이지 영역에서 쓰이는 컴포넌트들의 공통 props 입니다
*/
export interface ContentComponentProps {
    data: PageResponse<never>;
    onRefresh?: (path?: string) => void;
}