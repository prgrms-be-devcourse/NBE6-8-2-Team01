export type RentStatus = "AVAILABLE" | "LOANED" | "FINISHED" | "DELETED" | "UNKNOWN";
// export type rentStatus = "대여 가능" | "대여 중" | "대여 완료";

export const getRentStatus = (status: RentStatus): string => {
  const map: Record<RentStatus, string> = {
    AVAILABLE: "대여 가능",
    LOANED: "대여 중",
    FINISHED: "대여 종료",
    DELETED : "삭제됨",
    UNKNOWN : "알 수 없음"
  };
  return map[status];
}

export interface RentPostDetailResponseDto {
  id: number;
  lenderUserId: number;
  bookCondition: string;
  bookImage: string;
  address: string;
  contents: string;
  rentStatus : RentStatus;
  name: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  createdDate: string;
  modifiedDate: string;
}

export interface RentPostSimpleResponseDto {
  id: number;
  lenderUserId: number;
  status: RentStatus;
  bookCondition: string;
  bookTitle: string;
  author: string;
  publisher: string;
  createdDate: string;
  modifiedDate: string;
}