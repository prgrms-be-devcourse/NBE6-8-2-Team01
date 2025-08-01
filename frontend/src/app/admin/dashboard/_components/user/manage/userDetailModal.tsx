import { useState } from "react";
import { UserDetailResponseDto } from "../../../_types/userResponseDto";
import { formatDate } from "../../common/dateFormatter";
import ConfirmModal from "../../common/confirmModal";
import UserBasicInfo from "./userBasicInfo";
import UserStatusInfo from "./userStatusInfo";
import UserJoinInfo from "./userJoinInfo";
import SuspendForm from "./suspendForm";
import apiClient from "@/app/bookbook/user/utils/apiClient";

interface UserDetailModalProps {
  user: UserDetailResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendPeriod, setSuspendPeriod] = useState<string>("");
  const [suspendReason, setSuspendReason] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "unsuspend" | null
  >(null);

  if (!isOpen || !user) return null;

  const handleSuspendClick = () => {
    if (user.baseResponseDto.userStatus === "SUSPENDED") {
      // 정지 해제
      setConfirmAction("unsuspend");
      setShowConfirmModal(true);
    } else {
      // 정지하기
      setShowSuspendForm(true);
    }
  };

  const handleSuspendFormSubmit = () => {
    if (!suspendPeriod || !suspendReason.trim()) {
      alert("정지 기간과 사유를 모두 입력해주세요.");
      return;
    }
    setConfirmAction("suspend");
    setShowConfirmModal(true);
  };

  const doRequest = async (url: string, requestInit?: RequestInit) => {
    try {
      await apiClient(url, {
        method: "PATCH",
        ...requestInit,
      });

    } catch (error) {
      console.error("API 요청 실패:", error);
      throw error;
    }
  };

  const suspendUser = async () => {
    try {
      const requestDto = {
        userId: user.baseResponseDto.id,
        reason: suspendReason,
        period: getPeriodDays(suspendPeriod),
      };

      await doRequest("/api/v1/admin/users/suspend", {
        body: JSON.stringify(requestDto),
      });

      alert(`${user.baseResponseDto.nickname}님이 정지되었습니다.`);
    } catch (error) {
      throw new Error(`정지 처리 중 오류가 발생했습니다.\n${error}`, );
    }
  };

  const resumeUser = async () => {
    try {
      const userId = user.baseResponseDto.id;

      await doRequest(
        `/api/v1/admin/users/${userId}/resume`,
        {
          body: null,
        }
      );

      alert(`${user.baseResponseDto.nickname}님의 정지가 해제되었습니다.`);
    } catch (error) {
      throw new Error(`정지 해제 처리 중 오류가 발생했습니다.\n${error}`, );
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === "suspend") {
        await suspendUser();
      } else if (confirmAction === "unsuspend") {
        await resumeUser();
      }

      resetModalState();
      onClose();
      // 성공적으로 정지/해제 처리 후 리스트 새로고침
      onRefresh?.();
    } catch (error) {
      // 에러 발생시 모달을 닫지 않고 사용자가 다시 시도할 수 있도록 함
      // toast.error(error as string);
      alert(`작업을 진행하는데 실패했습니다. ${error}`)
      console.error("처리 중 오류 발생:", error);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    if (confirmAction === "suspend") {
      setConfirmAction(null);
    } else {
      setConfirmAction(null);
    }
  };

  const resetModalState = () => {
    setShowConfirmModal(false);
    setShowSuspendForm(false);
    setSuspendPeriod("");
    setSuspendReason("");
    setConfirmAction(null);
  };

  const getPeriodDays = (period: string): number => {
    switch (period) {
      case "3일":
        return 3;
      case "7일":
        return 7;
      case "30일":
        return 30;
      case "영구 정지":
        return 73000; // 200년
      default:
        return 0;
    }
  };

  const getPeriodText = (period: string): string => {
    return period === "영구 정지" ? "영구 정지 (200년)" : period;
  };

  const getConfirmMessage = (): string => {
    if (confirmAction === "suspend") {
      return `정말로 ${
        user.baseResponseDto.nickname
      }님을 정지하시겠습니까?\n정지일 수: ${getPeriodText(suspendPeriod)}`;
    } else if (confirmAction === "unsuspend") {
      const resumeDate = user.resumedAt
        ? formatDate(user.resumedAt)
        : "즉시";
      return `정말로 ${user.baseResponseDto.nickname}님의 정지를 해제하시겠습니까?\n정지 해제일: ${resumeDate}`;
    }
    return "";
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 배경 오버레이 */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={showSuspendForm ? undefined : onClose}
        />

        {/* 모달 컨텐츠 */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {showSuspendForm ? "정지하기" : "멤버 상세 정보"}
            </h2>
            <button
              onClick={
                showSuspendForm ? () => setShowSuspendForm(false) : onClose
              }
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 본문 */}
          {showSuspendForm ? (
            <SuspendForm
              user={user}
              suspendPeriod={suspendPeriod}
              setSuspendPeriod={setSuspendPeriod}
              suspendReason={suspendReason}
              setSuspendReason={setSuspendReason}
              onSubmit={handleSuspendFormSubmit}
            />
          ) : (
            <div className="p-6 space-y-4">
              <UserBasicInfo user={user} />
              <UserStatusInfo user={user} />
              <UserJoinInfo user={user} />
            </div>
          )}

          {/* 푸터 */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t bg-gray-50">
            <button
              onClick={
                showSuspendForm ? () => setShowSuspendForm(false) : onClose
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              취소
            </button>
            {!showSuspendForm && (
              <button
                onClick={handleSuspendClick}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  user.baseResponseDto.userStatus === "SUSPENDED"
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                }`}
              >
                {user.baseResponseDto.userStatus === "SUSPENDED"
                  ? "정지 해제"
                  : "활동 정지"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <ConfirmModal
          message={getConfirmMessage()}
          confirmText={confirmAction === "suspend" ? "정지" : "해제"}
          cancelText="취소"
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </>
  );
};

export default UserDetailModal;
