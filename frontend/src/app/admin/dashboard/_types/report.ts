export type ReportStatus = "PENDING" | "REVIEWED" | "PROCESSED";

export const getReportStatus = (status: ReportStatus) => {
  switch (status) {
    case "PENDING": return "대기 중"
    case "REVIEWED": return "검토 중"
    case "PROCESSED": return "처리 완료"
  }
}

export interface ReportSimpleResponseDto {
  id: number;
  status: ReportStatus;
  reporterUserId: number;
  targetUserId: number;
  createdDate: string;
}

export interface ReportDetailResponseDto {
  id: number;
  status: ReportStatus;
  reporterUserId: number;
  targetUserId: number;
  closerId: number | null;
  reason: string;
  createdDate: string;
  modifiedDate: string;
  reviewedDate: string;
}