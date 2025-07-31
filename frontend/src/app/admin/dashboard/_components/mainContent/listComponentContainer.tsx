import { ContentComponentProps } from "./baseContentComponentProps";
import { SuspendedUserListComponent } from "./suspendedUserListComponent";
import { DashBoardComponent } from "./dashBoardComponent";
import { UserListComponent } from "./userListComponent";
import { UserRentPostComponent } from "./userRentPostComponent";
import { ReportHistoryComponent } from "./reportHistoryComponent";
import { useCallback, useEffect, useState } from "react";
import { PageResponse } from "../../_types/page";
import { useDashBoardContext } from "@/app/admin/dashboard/_hooks/useDashboard";

const componentMap: {
    [key: string]: React.ComponentType<ContentComponentProps>;
} = {
    "suspended-user-list": SuspendedUserListComponent,
    "dashboard": DashBoardComponent,
    "user-list": UserListComponent,
    "post-management": UserRentPostComponent,
    "reports": ReportHistoryComponent,
};

export function ListComponentContainer() {
    const {
        activeItem,
        error,
        refreshData,
        responseData
    } = useDashBoardContext();

    const ContentComponent = componentMap[activeItem] ?? DashBoardComponent;

    const [data, setData] = useState<PageResponse<unknown>>(null as unknown as PageResponse<unknown>);

    const updateData = useCallback(() => {
        const pageData = responseData as PageResponse<unknown>;
        setData(pageData);
    }, [responseData])

    useEffect(() => {
        updateData();
    }, [updateData]);

    if (activeItem === 'dashboard') {
        return <ContentComponent data={data} onRefresh={refreshData} />;
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-8">
                <h3 className="text-lg font-semibold mb-2">오류 발생</h3>
                <p>서버와 통신하는데 실패하여 데이터를 가져올 수 없습니다.</p>
                <button
                    onClick={refreshData}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center text-gray-500 p-8">
                <h3 className="text-lg font-semibold mb-2">데이터 없음</h3>
                <p>표시할 데이터가 없습니다.</p>
                <button
                    onClick={refreshData}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    새로고침
                </button>
            </div>
        );
    }


    return (
        <ContentComponent
            data={data}
            onRefresh={refreshData}
        />
    )
}