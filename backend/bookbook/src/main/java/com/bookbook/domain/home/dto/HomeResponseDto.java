package com.bookbook.domain.home.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class HomeResponseDto {
    
    /**
     * 지역 정보 (예: "성북구", "전체")
     */
    private String region;
    
    /**
     * 도서 이미지 URL 목록 (최대 5개)
     */
    private List<String> bookImages;
    
    /**
     * 해당 지역의 총 도서 개수
     */
    private Long totalBooksInRegion;
    
    /**
     * 메시지 생성 (예: "성북구에 최근 등록된 도서", "최근 등록된 도서")
     */
    public String getMessage() {
        if ("전체".equals(region)) {
            return "최근 등록된 도서";
        } else {
            return region + "에 최근 등록된 도서";
        }
    }
}
