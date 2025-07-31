package com.bookbook.domain.rent.dto;

import com.bookbook.domain.rent.entity.RentStatus;

import java.time.LocalDateTime;

public record RentResponseDto(
        Long lenderUserId,
        String bookCondition,
        String bookImage,
        String address,
        String contents,
        RentStatus rentStatus,

        String title,
        String author,
        String publisher,
        LocalDateTime createdDate,
        LocalDateTime modifiedDate
) {
}