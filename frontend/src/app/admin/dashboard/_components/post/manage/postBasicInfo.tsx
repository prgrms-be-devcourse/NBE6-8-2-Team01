import { RentPostDetailResponseDto } from "../../../_types/rentPost";

interface PostBasicInfoProps {
  post: RentPostDetailResponseDto;
}

const PostBasicInfo: React.FC<PostBasicInfoProps> = ({ post }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">기본 정보</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            글 ID
          </label>
          <p className="text-gray-900">{post.id}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            작성자 ID
          </label>
          <p className="text-gray-900">{post.lenderUserId}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">카테고리</label>
          <p className="text-gray-900">{post.category}</p>
        </div>
        <div className="col-span-2 md:col-span-3">
          <label className="block font-medium text-gray-700 mb-1">도서명</label>
          <p className="text-gray-900 font-medium">
            {post.title}
          </p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">저자</label>
          <p className="text-gray-900">{post.author}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">출판사</label>
          <p className="text-gray-900">{post.publisher}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">대여 주소</label>
          <p className="text-gray-900">{post.address}</p>
        </div>
        <div className="col-span-2 md:col-span-3">
          <label className="block font-medium text-gray-700 mb-1">내용</label>
          <p className="text-gray-900 whitespace-pre-wrap break-words">{post.contents}</p>
        </div>
      </div>
    </div>
  );
};

export default PostBasicInfo;
