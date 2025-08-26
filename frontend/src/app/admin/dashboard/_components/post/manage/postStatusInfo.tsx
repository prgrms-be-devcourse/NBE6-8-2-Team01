import {
  RentPostDetailResponseDto,
  getRentStatus,
  RentStatus,
} from "../../../_types/rentPost";

interface PostStatusInfoProps {
  initialRentStatus: RentStatus
  setRentStatusValue: (value: RentStatus) => void;
  post: RentPostDetailResponseDto;
}

export function PostStatusInfo({ initialRentStatus, setRentStatusValue, post } : PostStatusInfoProps){
  const isDeleted = initialRentStatus === "DELETED";

  const getStatusColor = (status: RentStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-600 bg-green-50";
      case "LOANED":
        return "text-yellow-600 bg-yellow-50";
      case "FINISHED":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">상태 정보</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              대여 상태:
              <span className={`px-1 ${getStatusColor(initialRentStatus)}`}>{getRentStatus(initialRentStatus)}</span>
            </label>
            {!isDeleted && (
                <select
                    defaultValue=""
                    onChange={(e) => setRentStatusValue(e.target.value as RentStatus)}
                    className="p-3 border border-gray-300 rounded-md bg-white text-gray-900 appearance-none cursor-pointer"
                    disabled={isDeleted}
                >
                  <option value="" disabled>변경할 상태 선택</option>
                  <option value="AVAILABLE">대여 가능</option>
                  <option value="LOANED">대여 중</option>
                  <option value="FINISHED">대여 종료</option>
                </select>
            )}
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">도서 상태</label>
            <p className="text-gray-900 text-sm">
              {post.bookCondition}
            </p>
          </div>
        </div>
      </div>
  );
}