import { useState } from "react";
import { PostDetailModal } from "./postDetailModal";
import UserDetailModal from "../../user/manage/userDetailModal";
import { RentPostDetailResponseDto } from "@/app/admin/dashboard/_types/rentPost";
import { UserDetailResponseDto } from "@/app/admin/dashboard/_types/userResponseDto";
import fetchUserInfoFromAdmin from "@/app/admin/dashboard/_components/common/fetchUserInfo";
import { toast } from "react-toastify";

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

  const handleUserDetailClick = async () => {

    try {
      const userInfo = await fetchUserInfoFromAdmin(post.lenderUserId);
      setUserDetail(userInfo as UserDetailResponseDto);
      setUserDetailOpen(true);
    } catch (error) {
      toast.error(error as string);
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
