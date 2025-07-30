package com.bookbook.domain.rent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 책 검색 결과를 화면에  위한 Dto
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookSearchResponseDto {
    private String bookTitle;       // 책 제목 (Aladin API 'title' 매핑)
    private String author;          // 저자 (Aladin API 'author' 매핑)
    private String publisher;       // 출판사 (Aladin API 'publisher' 매핑)
    private String pubDate;         // 출판 날짜 (Aladin API 'pubDate' 매핑)
    private String category;        // 카테고리 (Aladin API 'categoryName' 파싱)
    private String bookDescription; // 책 설명 (Aladin API 'description' 매핑)
    private String coverImageUrl;   // 책 표지 이미지 URL (Aladin API 'cover' 매핑)
}