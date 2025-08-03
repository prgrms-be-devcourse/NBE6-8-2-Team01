import { useState } from "react";
import ConfirmModal from "../../common/confirmModal";
import PostBasicInfo from "./postBasicInfo";
import { PostStatusInfo } from "./postStatusInfo";
import PostInfo from "./postInfo";
import { getRentStatus, RentPostDetailResponseDto, rentStatus } from "@/app/admin/dashboard/_types/rentPost";
import { authFetch } from "@/app/util/authFetch";
import { dummyFunction } from "@/app/admin/dashboard/_components/common/dummyFunction";

interface PostDetailModalProps {
  post: RentPostDetailResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onUserDetailClick: (userId: number) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onRefresh,
  onUserDetailClick,
}) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "updateStatus" | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const initialRentStatus = currentPost.rentStatus;
  const [rentStatusValue, setRentStatusValue] = useState<rentStatus>(initialRentStatus);
  const isSameStatus = initialRentStatus == rentStatusValue;

  const rentStatusButtonClassName = isSameStatus ?
      "px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      : "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"

  if (!isOpen || !currentPost) return null;

  const handleDeleteClick = () => {
    setConfirmAction("delete");
    setShowConfirmModal(true);
  };

  const handleStatusUpdate = (status: string) => {
    setNewStatus(status);
    setConfirmAction("updateStatus");
    setShowConfirmModal(true);
  };

  const handleUserDetailClick = () => {
    onUserDetailClick(currentPost.lenderUserId);
  }

  const handlePostChangeStatus = async () => {
    const body = {
      "status" : rentStatusValue
    }

    const response = await authFetch(`/api/v1/admin/rent/${currentPost.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      dummyFunction
    )

    const data = await response.json()
        .catch(error => {throw new error});

    if (!data.data) return;

    setCurrentPost(data.data);
  }

  const handlePostDelete =  async () => {
    await authFetch(`/api/v1/admin/rent/${currentPost.id}`, {method: "DELETE"}, dummyFunction)
        .then(data => {
            alert(`${currentPost.id} 번 글이 성공적으로 삭제되었습니다`);
            _onClose();
        }).catch(error => {
          throw error;
    })
  }

  const _onClose = () => {
    onClose();
    onRefresh?.();
  }

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === "delete") {
        await handlePostDelete();
      } else if (confirmAction === "updateStatus") {
        await handlePostChangeStatus();
      }

      resetModalState();

    } catch (error) {
      console.error("처리 중 오류 발생:", error);
      alert(`처리 중 오류가 발생했습니다. ${error.message}`);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setNewStatus("");
  };

  const resetModalState = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setNewStatus("");
  };

  const getConfirmMessage = (): string => {
    if (confirmAction === "delete") {
      return `정말로 ${currentPost.id}번 글을 삭제하시겠습니까?`;

    } else if (confirmAction === "updateStatus") {
      return `정말로 글 상태를 변경하시겠습니까?\n
      ${getRentStatus(initialRentStatus)} → ${getRentStatus(rentStatusValue)}`;
    }
    return "";
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 배경 오버레이 */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* 모달 컨텐츠 */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              글 상세 정보
            </h2>
            <button
              onClick={_onClose}
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
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <PostBasicInfo post={currentPost} />
            <PostStatusInfo
                post={currentPost}
                initialRentStatus={initialRentStatus}
                setRentStatusValue={setRentStatusValue}
            />
            <PostInfo post={currentPost} />
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0">
            {/* 작성자 정보 버튼 */}
            <button
              onClick={handleUserDetailClick}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              작성자 정보 보기
            </button>
            
            {/* 관리 버튼들 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={_onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => handleStatusUpdate("상태변경")}
                disabled={initialRentStatus == rentStatusValue}
                className={rentStatusButtonClassName}
              >
                상태 변경
              </button>
              <button
                onClick={() => {handleDeleteClick()}}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                글 삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <ConfirmModal
          message={getConfirmMessage()}
          confirmText={confirmAction === "delete" ? "삭제" : "변경"}
          cancelText="취소"
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </>
  );
};

export default PostDetailModal;
