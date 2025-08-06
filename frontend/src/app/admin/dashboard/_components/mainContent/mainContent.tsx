import { useDashBoardContext } from "@/app/admin/dashboard/_hooks/useDashboard";
import { ListComponentContainer } from "@/app/admin/dashboard/_components/mainContent/listComponentContainer";

/*
* 메인 컨텐츠 영역
*/
export function MainContent() {
  const { currentItem, loading } = useDashBoardContext();

  return (
    <div className="flex-1 bg-gray-50 h-screen overflow-y-auto">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentItem?.label || ""}
          </h2>
        </div>
      </header>

      <main className="p-5">
        <div className="bg-white rounded-lg shadow-sm p-8">
            {loading ? (
                <div className="text-center text-gray-500 p-8">
                    <h3 className="text-lg font-semibold mb-2">로딩 중</h3>
                    <p>데이터를 불러오는 중입니다...</p>
                </div>
            ): <ListComponentContainer /> }
        </div>
      </main>
    </div>
  );
}
