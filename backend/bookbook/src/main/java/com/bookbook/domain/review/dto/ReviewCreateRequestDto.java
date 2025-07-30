package com.bookbook.domain.review.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewCreateRequestDto {
    
    private Integer rating;
    
    public ReviewCreateRequestDto(Integer rating) {
        this.rating = rating;
    }
}