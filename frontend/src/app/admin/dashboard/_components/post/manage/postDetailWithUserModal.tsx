import { useState } from "react";
import PostDetailModal from "./postDetailModal";
import UserDetailModal from "../../user/manage/userDetailModal";
import { RentPostDetailResponseDto } from "@/app/admin/dashboard/_types/rentPost";
import { UserDetailResponseDto } from "@/app/admin/dashboard/_types/userResponseDto";
import { authFetch } from "@/app/util/authFetch";

interface PostDetailWithUserModalProps {
  post: RentPostDetailResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const PostDetailWithUserModal: React.FC<PostDetailWithUserModalProps> = ({
   post,
   isOpen,
   onClose,
   onRefresh,
 }) => {
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [userDetail, setUserDetail] = useState<UserDetailResponseDto>(
      null as unknown as UserDetailResponseDto
  );

  const handleUserDetailClick = async (userId: number) => {
    try {
      const response = await authFetch(`/api/v1/admin/users/${post.lenderUserId}`)
      await response.json().then((data) => {
        console.log(data);
        setUserDetail(data.data as UserDetailResponseDto);
        setUserDetailOpen(true);
      });

      console.log("Fetching user detail for ID:", userId);

    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      alert("사용자 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleUserDetailClose = () => {
    setUserDetailOpen(false);
    setUserDetail(null as unknown as UserDetailResponseDto);
  };

  return (
      <>
        <PostDetailModal
            post={post}
            isOpen={isOpen || !userDetailOpen}
            onClose={onClose}
            onRefresh={onRefresh}
            onUserDetailClick={handleUserDetailClick}
        />

        {userDetail && (
            <UserDetailModal
                user={userDetail}
                isOpen={userDetailOpen}
                onClose={handleUserDetailClose}
            />
        )}
      </>
  );
};

export default PostDetailWithUserModal;
