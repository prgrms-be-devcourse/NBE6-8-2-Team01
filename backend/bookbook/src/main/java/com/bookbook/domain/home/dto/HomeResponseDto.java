package com.bookbook.domain.home.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 메인페이지 응답 DTO
 */
@Getter
@Builder
public class HomeResponseDto {
    
    /**
     * 지역 정보 (현재는 "전체"로 고정)
     */
    private String region;
    
    /**
     * 도서 이미지 URL 목록 (최대 5개)
     */
    private List<String> bookImages;
    
    /**
     * 이미지가 있는 전체 도서 개수
     */
    private Long totalBooksInRegion;
    
    /**
     * 사용자 지역 (IP 기반 또는 세션 기반)
     */
    private String userRegion;
    
    /**
     * 응답 메시지 (지역에 따라 동적 생성)
     */
    public String getMessage() {
        if ("전체".equals(region)) {
            return "최근 등록된 도서";
        } else {
            return region + "의 최근 등록된 도서";
        }
    }
}
