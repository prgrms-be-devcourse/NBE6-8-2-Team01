export interface RentedBook {
  id: number;
  loanDate: string;
  returnDate: string;
  borrowerUserId: number;
  rentId: number;
  createdDate: string;
  modifiedDate: string;
  
  // 추가 정보 (Rent 정보에서 가져옴)
  title: string;
  bookTitle: string;
  author: string;
  publisher: string;
  category: string;
  bookCondition: string;
  bookImage: string;
  address: string;
  contents: string;
  lenderUserId: number;
  lenderNickname?: string;
  
  // 리뷰 관련
  hasReview?: boolean;
  rentStatus?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}