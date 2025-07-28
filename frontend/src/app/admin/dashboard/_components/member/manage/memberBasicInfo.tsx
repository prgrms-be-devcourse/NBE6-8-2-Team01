import { UserDetailResponseDto } from "../../../_types/userResponseDto";

interface MemberBasicInfoProps {
  member: UserDetailResponseDto;
}

const MemberBasicInfo: React.FC<MemberBasicInfoProps> = ({ member }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">기본 정보</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            멤버 ID
          </label>
          <p className="text-gray-900">{member.baseResponseDto.id}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            사용자명
          </label>
          <p className="text-gray-900">{member.baseResponseDto.username}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">닉네임</label>
          <p className="text-gray-900 font-medium">
            {member.baseResponseDto.nickname}
          </p>
        </div>
        <div className="col-span-2 md:col-span-3">
          <label className="block font-medium text-gray-700 mb-1">이메일</label>
          <p className="text-gray-900">{member.baseResponseDto.email}</p>
        </div>
        <div className="col-span-2 md:col-span-3">
          <label className="block font-medium text-gray-700 mb-1">주소</label>
          <p className="text-gray-900">{member.address}</p>
        </div>
      </div>
    </div>
  );
};

export default MemberBasicInfo;
