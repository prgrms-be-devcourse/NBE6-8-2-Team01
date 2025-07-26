package com.bookbook.domain.rent.dto;

import java.time.LocalDateTime;

public record RentRequestDto(
        int lender_user_id,
        String bookCondition,
        String bookImage,
        String address,
        String contents,
        String rent_status,

        String title,
        String author,
        String publisher,
        LocalDateTime createdDate,
        LocalDateTime modifiedDate
) {
}