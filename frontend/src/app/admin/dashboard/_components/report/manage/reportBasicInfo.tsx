import { ReportDetailResponseDto } from "@/app/admin/dashboard/_types/report";

interface ReportBasicInfoProps {
  report: ReportDetailResponseDto;
}

const ReportBasicInfo: React.FC<ReportBasicInfoProps> = ({ report }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">기본 정보</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            신고 ID
          </label>
          <p className="text-gray-900">{report.id}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            신고자 ID
          </label>
          <p className="text-gray-900">{report.reporterUserId}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            신고대상자 ID
          </label>
          <p className="text-gray-900">{report.targetUserId}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportBasicInfo;
