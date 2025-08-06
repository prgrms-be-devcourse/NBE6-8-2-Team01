package com.bookbook.domain.home.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 도서 정보 DTO (ID 포함)
 */
@Getter
@Builder
public class BookInfoDto {
    
    /**
     * 도서 ID
     */
    private Long id;
    
    /**
     * 도서 이미지 URL
     */
    private String imageUrl;
    
    /**
     * 도서 제목
     */
    private String title;
    
    /**
     * 도서 제목 (중복이지만 프론트엔드 호환성을 위해 추가)
     */
    private String bookTitle;
}
