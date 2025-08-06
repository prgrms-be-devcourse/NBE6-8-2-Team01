import { formatDate } from "../../common/dateFormatter";
import { ReportDetailResponseDto } from "@/app/admin/dashboard/_types/report";

interface ReportInfoProps {
  report: ReportDetailResponseDto;
}

const ReportInfo: React.FC<ReportInfoProps> = ({ report }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">신고 정보</h3>
      <div className="col-span-2 md:col-span-3 py-1">
        <label className="block font-medium text-gray-700 mb-1">신고 내용</label>
        <p className="text-gray-900 whitespace-pre-wrap break-words text-xm py-2">{report.reason}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            신고일시
          </label>
          <p className="text-gray-900">
            {formatDate(report.createdDate)}
          </p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            최종 수정일시
          </label>
          <p className="text-gray-900">
            {formatDate(report.modifiedDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportInfo;
