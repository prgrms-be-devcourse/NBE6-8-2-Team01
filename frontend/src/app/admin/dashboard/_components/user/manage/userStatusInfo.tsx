import {
  UserDetailResponseDto,
  getUserStatus,
  userStatus,
} from "../../../_types/userResponseDto";
import { formatDate } from "../../common/dateFormatter";

interface UserStatusInfoProps {
  user: UserDetailResponseDto;
}

const UserStatusInfo: React.FC<UserStatusInfoProps> = ({ user }) => {
  const getStatusColor = (status: userStatus) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-50";
      case "SUSPENDED":
        return "text-red-600 bg-red-50";
      case "INACTIVE":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">상태 정보</h3>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            현재 상태
          </label>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              user.baseResponseDto.userStatus
            )}`}
          >
            {getUserStatus(user.baseResponseDto.userStatus)}
          </span>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">평점</label>
          <div className="flex items-center space-x-1">
            <span
              className={`text-sm font-semibold ${getRatingColor(
                user.baseResponseDto.rating
              )}`}
            >
              {user.baseResponseDto.rating.toFixed(1)}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3 h-3 ${
                    star <= user.baseResponseDto.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            정지 횟수
          </label>
          <span
            className={`text-sm font-semibold ${
              user.suspendCount > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {user.suspendCount}회
          </span>
        </div>
      </div>

      {/* 정지 상태일 때만 표시되는 정지 정보 */}
      {user.baseResponseDto.userStatus === "SUSPENDED" && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block font-medium text-red-700 mb-1">
                정지일시
              </label>
              <p className="text-red-900">
                {user.suspendedAt
                  ? formatDate(user.suspendedAt)
                  : "정보 없음"}
              </p>
            </div>
            <div>
              <label className="block font-medium text-red-700 mb-1">
                정지 해제 예정일
              </label>
              <p className="text-red-900">
                {user.resumedAt ? formatDate(user.resumedAt) : "영구 정지"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatusInfo;
