import { useState } from "react";
import ReportDetailModal from "./reportDetailModal";
import UserDetailModal from "../../user/manage/userDetailModal";
import { UserDetailResponseDto } from "@/app/admin/dashboard/_types/userResponseDto";
import { ReportDetailResponseDto } from "@/app/admin/dashboard/_types/report";

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

  const handleUserDetailClick = (userId: number) => {
    console.log("Fetching user detail for ID:", userId);

    fetch(`/api/v1/admin/users/${userId}`)
      .then(response => response.json())
      .then((data) => {
        console.log(data);
        setUserDetail(data.data as UserDetailResponseDto);
        setUserDetailOpen(true);
      })
      .catch(error => {
        console.error("사용자 정보 조회 실패:", error);
        alert("사용자 정보를 불러오는데 실패했습니다.");
      }
    )
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
