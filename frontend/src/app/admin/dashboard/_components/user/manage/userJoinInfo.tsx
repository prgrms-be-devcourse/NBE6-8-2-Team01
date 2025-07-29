import { UserDetailResponseDto } from "../../../_types/userResponseDto";
import { formatDate } from "../../common/dateFormatter";

interface UserJoinInfoProps {
  user: UserDetailResponseDto;
}

const UserJoinInfo: React.FC<UserJoinInfoProps> = ({ user }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">가입 정보</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            가입일시
          </label>
          <p className="text-gray-900">
            {formatDate(user.baseResponseDto.createdAt)}
          </p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            최종 수정일시
          </label>
          <p className="text-gray-900">
            {formatDate(user.baseResponseDto.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserJoinInfo;
