import { useEffect } from "react";
import { MenuItem } from "../../_types/menuItem";
import { menuItems } from "../sidebar/consts";

import { SuspendedUserListComponent } from "./suspendedUserListComponent";
import { DashBoardComponent } from "./dashBoardComponent";
import { UserListComponent } from "./userListComponent";
import { UserRentPostComponent } from "./userRentPostComponent";
import { ReportHistoryComponent } from "./reportHistoryComponent";
import { BaseContentComponentProps } from "./baseContentComponentProps";

interface MainContentProps {
  activeItem: string;
  responseData: unknown | null;
  currentItem: MenuItem | null;
  setCurrentItem: (item: MenuItem | null) => void;
  loading: boolean;
  onRefresh?: () => void;
}

// 메뉴 ID와 렌더링할 컴포넌트를 매핑
const componentMap: {
  [key: string]: React.ComponentType<BaseContentComponentProps>;
} = {
  "suspended-user-list": SuspendedUserListComponent,
  "dashboard": DashBoardComponent,
  "user-list": UserListComponent,
  "post-management": UserRentPostComponent,
  "reports": ReportHistoryComponent,
};

export function MainContent(props: MainContentProps) {
  const {
    activeItem,
    responseData,
    currentItem,
    setCurrentItem,
    loading,
    onRefresh,
  } = props;

  useEffect(() => {
    const findMenuItem = (items: MenuItem[], id: string): MenuItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findMenuItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findMenuItem(menuItems, activeItem);
    setCurrentItem(item);
  }, [activeItem, setCurrentItem]);

  const ContentComponent = componentMap[activeItem] ?? null;

  return (
    <div className="flex-1 bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentItem?.label || ""}
          </h2>
        </div>
      </header>

      <main className="p-5">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {loading && <p>정보를 가져오는 중입니다.</p>}
          {!loading && ContentComponent && (
            <ContentComponent
              responseData={responseData}
              onRefresh={onRefresh}
            />
          )}
        </div>
      </main>
    </div>
  );
}
