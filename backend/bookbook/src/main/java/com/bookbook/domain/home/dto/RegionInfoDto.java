package com.bookbook.domain.home.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 지역 정보 DTO
 */
@Getter
@Builder
public class RegionInfoDto {
    
    /**
     * 지역명
     */
    private String name;
    
    /**
     * 지역 코드
     */
    private String code;
}
