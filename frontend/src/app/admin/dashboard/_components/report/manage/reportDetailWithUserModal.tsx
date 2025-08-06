import { useState } from "react";
import ReportDetailModal from "./reportDetailModal";
import UserDetailModal from "../../user/manage/userDetailModal";
import { UserDetailResponseDto } from "@/app/admin/dashboard/_types/userResponseDto";
import { ReportDetailResponseDto } from "@/app/admin/dashboard/_types/report";
import fetchUserInfoFromAdmin from "@/app/admin/dashboard/_components/common/fetchUserInfo";
import { toast } from "react-toastify";

interface ReportDetailWithUserModalProps {
  report: ReportDetailResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const ReportDetailWithUserModal: React.FC<ReportDetailWithUserModalProps> = ({
   report,
   isOpen,
   onClose,
   onRefresh,
 }) => {
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [userDetail, setUserDetail] = useState<UserDetailResponseDto>(
      null as unknown as UserDetailResponseDto
  );

  const handleUserDetailClick = async (userId : number) => {
    try {
      const userInfo = await fetchUserInfoFromAdmin(userId);
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
      <ReportDetailModal
        report={report}
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

export default ReportDetailWithUserModal;
