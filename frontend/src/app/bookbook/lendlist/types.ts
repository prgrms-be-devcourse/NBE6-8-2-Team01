export interface MyBook {
  id: number;
  lenderUserId: number;
  borrowerUserId?: number;
  borrowerNickname?: string;
  title: string;
  bookTitle: string;
  author: string;
  publisher: string;
  category: string;
  bookCondition: string;
  bookImage: string;
  address: string;
  contents: string;
  rentStatus: string;
  returnDate?: string;
  createdDate: string;
  modifiedDate: string;
  hasReview?: boolean; // 리뷰 작성 여부
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}