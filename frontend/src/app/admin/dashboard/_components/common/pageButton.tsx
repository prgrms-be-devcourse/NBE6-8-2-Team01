import { PageInfo } from "@/app/admin/dashboard/_types/page";

interface PageButtonContainerProps {
    page: number;
    getPageData: (page: number) => void;
    pageInfo: PageInfo;
}

/*
* Page와 상호작용 할 때 쓰이는 컴포넌트 입니다.
* 페이지 현황에 따라 자동으로 비활성화 됩니다.
*/
export function PageButtonContainer(
    { page, getPageData, pageInfo } : PageButtonContainerProps
) {
    const totalPages = pageInfo.totalPages;

    const handlePrevious = () => {
        const newPage = page - 1;
        getPageData(newPage);
    }
    const handleNext = () => {
        const newPage = page + 1;
        getPageData(newPage);
    }

    return (
        <div className="flex justify-center gap-2 py-5">
            <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={handlePrevious}
                disabled={page <= 1}
            >
                이전
            </button>
            <span className="px-2 py-2">{page} / {totalPages}</span>
            <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={handleNext}
                disabled={page >= totalPages}
            >
                다음
            </button>
        </div>
    )
}