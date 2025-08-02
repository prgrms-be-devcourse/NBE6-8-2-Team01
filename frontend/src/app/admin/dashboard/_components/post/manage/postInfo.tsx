import { RentPostDetailResponseDto } from "../../../_types/rentPost";
import { formatDate } from "../../common/dateFormatter";

interface PostJoinInfoProps {
  post: RentPostDetailResponseDto;
}

const PostInfo: React.FC<PostJoinInfoProps> = ({ post }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">작성 정보</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            작성일시
          </label>
          <p className="text-gray-900">
            {formatDate(post.createdDate)}
          </p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            최종 수정일시
          </label>
          <p className="text-gray-900">
            {formatDate(post.modifiedDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostInfo;
