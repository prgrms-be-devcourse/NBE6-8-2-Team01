import { PageInfo } from "@/app/admin/dashboard/_types/page";

interface PageButtonContainerProps {
    page: number;
    setPage: (page: number) => void;
    pageInfo: PageInfo;
}

export function PageButtonContainer(
    { page, setPage, pageInfo } : PageButtonContainerProps
) {
    const totalPages = pageInfo.totalPages;

    const handlePrevious = () => {
        const newPage = page - 1;
        setPage(newPage);
    }
    const handleNext = () => {
        const newPage = page + 1;
        setPage(newPage);
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