import { ContentComponentProps } from "./baseContentComponentProps";
import { SuspendedUserListComponent } from "./suspendedUserListComponent";
import { DashBoardComponent } from "./dashBoardComponent";
import { UserListComponent } from "./userListComponent";
import { UserRentPostComponent } from "./userRentPostComponent";
import { ReportHistoryComponent } from "./reportHistoryComponent";
import { useEffect, useState } from "react";
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

/*
* 리스트를 사용하는 모든 컴포넌트를 위한 컨테이너 컴포넌트
*
* 사이드바의 activeItem에 따라 컴포넌트를 선택하여 사용됨
*/
export function ListComponentContainer() {
    const {
        activeItem,
        error,
        refreshData,
        responseData,
    } = useDashBoardContext();

    const ContentComponent = componentMap[activeItem] ?? DashBoardComponent;

    const [data, setData] = useState<PageResponse<unknown>>(null as unknown as PageResponse<unknown>);

    useEffect(() => {
        const pageData = responseData as PageResponse<unknown>;
        setData(pageData);
    }, [responseData]);

    if (activeItem === 'dashboard') {
        return <ContentComponent data={data} onRefresh={refreshData}/>;
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

    if (data?.data)  {
        return <ContentComponent data={data} onRefresh={refreshData}/>
    }

    return null;
}