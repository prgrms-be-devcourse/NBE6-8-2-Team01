package com.bookbook.domain.rent.dto;

import com.bookbook.domain.rent.entity.Rent;
import lombok.*;

import java.util.List;

// 대여 가능한 책 목록 조회 API 응답용 DTO
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentAvailableResponseDto {
    
    // 개별 책 정보 DTO
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookInfo {
        private Integer id;
        private String bookTitle;       // 책 제목
        private String author;          // 저자
        private String publisher;       // 출판사
        private String bookCondition;   // 책 상태 (상, 중, 하)
        private String bookImage;       // 책 이미지 URL
        private String address;         // 위치 정보
        private String category;        // 카테고리
        private String rentStatus;      // 대여 상태 (대여가능, 대여중)
        private Long lenderUserId;      // 책 소유자 ID
        private String title;           // 대여글 제목 (선택사항)
        private String contents;        // 대여 설명 (선택사항)
        private String createdDate;     // 생성일
        private String modifiedDate;    // 수정일
        
        // Rent 엔티티로부터 BookInfo 생성
        public static BookInfo from(Rent rent) {
            return BookInfo.builder()
                    .id(rent.getId())
                    .bookTitle(rent.getBookTitle())
                    .author(rent.getAuthor())
                    .publisher(rent.getPublisher())
                    .bookCondition(rent.getBookCondition())
                    .bookImage(rent.getBookImage())
                    .address(rent.getAddress())
                    .category(rent.getCategory())
                    .rentStatus(rent.getRentStatus().getDescription())
                    .lenderUserId(rent.getLenderUserId())
                    .title(rent.getTitle())
                    .contents(rent.getContents())
                    .createdDate(rent.getCreatedDate() != null ? rent.getCreatedDate().toString() : null)
                    .modifiedDate(rent.getModifiedDate() != null ? rent.getModifiedDate().toString() : null)
                    .build();
        }
    }
    
    // 페이지네이션 정보 DTO
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private int currentPage;     // 현재 페이지 번호
        private int totalPages;      // 전체 페이지 수
        private long totalElements;  // 전체 요소 수
        private int size;            // 페이지 크기
        
        public static PaginationInfo from(org.springframework.data.domain.Page<?> page) {
            return PaginationInfo.builder()
                    .currentPage(page.getNumber() + 1)  // Spring Data JPA는 0부터 시작하므로 +1
                    .totalPages(page.getTotalPages())
                    .totalElements(page.getTotalElements())
                    .size(page.getSize())
                    .build();
        }
    }
    
    // 실제 API 응답 데이터
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Data {
        private List<BookInfo> books;
        private PaginationInfo pagination;
    }
    
    private String resultCode;
    private String msg;
    private Data data;
    private boolean success;
    
    // 성공 응답 생성
    public static RentAvailableResponseDto success(List<BookInfo> books, PaginationInfo pagination) {
        return RentAvailableResponseDto.builder()
                .resultCode("200")
                .msg("대여 가능한 책 목록 조회 성공")
                .data(Data.builder()
                        .books(books)
                        .pagination(pagination)
                        .build())
                .success(true)
                .build();
    }
    
    // 빈 결과 응답 생성
    public static RentAvailableResponseDto empty() {
        return RentAvailableResponseDto.builder()
                .resultCode("200")
                .msg("검색 조건에 맞는 책이 없습니다")
                .data(Data.builder()
                        .books(List.of())
                        .pagination(PaginationInfo.builder()
                                .currentPage(1)
                                .totalPages(1)
                                .totalElements(0)
                                .size(12)
                                .build())
                        .build())
                .success(true)
                .build();
    }
}
