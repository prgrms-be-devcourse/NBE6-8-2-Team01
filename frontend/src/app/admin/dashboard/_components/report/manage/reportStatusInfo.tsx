import { getReportStatus, ReportDetailResponseDto, ReportStatus } from "@/app/admin/dashboard/_types/report";
import { formatDate } from "@/app/admin/dashboard/_components/common/dateFormatter";

interface PostStatusInfoProps {
  report: ReportDetailResponseDto;
}

export function ReportStatusInfo({ report } : PostStatusInfoProps){
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return "text-green-600 bg-green-50";
      case "REVIEWED":
        return "text-yellow-600 bg-yellow-50";
      case "PROCESSED":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">상태 정보</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              처리 상태
            </label>
            <span className={`px-1 ${getStatusColor(report.status)}`}>
              {getReportStatus(report.status)}
            </span>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">처리자 ID</label>
            <p className="text-gray-900 text-sm">
              {report.closerId ?? "정보 없음"}
            </p>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">확인 날짜</label>
            <p className="text-gray-900 text-sm">
              {formatDate(report.reviewedDate)}
            </p>
          </div>
        </div>
      </div>
  );
}