import { useState } from "react";
import ConfirmModal from "../../common/confirmModal";
import ReportBasicInfo from "./reportBasicInfo";
import { ReportStatusInfo } from "./reportStatusInfo";
import ReportInfo from "./reportInfo";
import { ReportDetailResponseDto } from "@/app/admin/dashboard/_types/report";
import { toast } from "react-toastify";

interface ReportDetailModalProps {
  report: ReportDetailResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onUserDetailClick: (userId: number) => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onRefresh,
  onUserDetailClick,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isDone = report.status == "PROCESSED";

  const buttonClassName = isDone ?
      "px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      : "px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"

  if (!isOpen || !report) return null;

  const handleAsProcessed = async () => {
    const response = await fetch(`/api/v1/admin/reports/${report.id}/process`,
      {
        method: "PATCH",
        headers : {
          "Content-Type": "application/json",
        }
      })

    const data = await response.json().catch(error => {
      throw error;
    })

    if (!response.ok) {
      if (data.statusCode === 409) _onClose();
      throw data.msg;
    }

    toast.success(data.msg);
    _onClose();
  }

  const _onClose = () => {
    onClose();
    onRefresh?.();
  }

  const handleConfirmAction = async () => {
    try {
      await handleAsProcessed();
      resetModalState();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
  };

  const resetModalState = () => {
    setShowConfirmModal(false);
  };

  const getConfirmMessage = () : string => {
     return "정말로 처리를 진행하시겠습니까?\n" +
        "중간에 취소할 수 없습니다.";
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
              신고 상세 정보
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
            <ReportBasicInfo report={report} />
            <ReportInfo report={report} />
            <ReportStatusInfo report={report}/>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0">
            {/* 작성자 정보 버튼 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={_ => onUserDetailClick(report.reporterUserId)}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                신고자 정보
              </button>
              <button
                  onClick={_ => onUserDetailClick(report.targetUserId)}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                신고대상자 정보
              </button>
            </div>

            {/* 관리 버튼들 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={_onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                닫기
              </button>
              {!isDone && (
                <button
                  onClick={_ => setShowConfirmModal(true)}
                  disabled={isDone}
                  className={buttonClassName}
                >
                  완료 처리하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <ConfirmModal
          message={getConfirmMessage()}
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </>
  );
};

export default ReportDetailModal;
