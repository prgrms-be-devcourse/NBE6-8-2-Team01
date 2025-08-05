package com.bookbook.domain.rentList.dto;

import java.time.LocalDateTime;

public class RentApplicationResponseDto {
    public RentApplicationResponseDto(
            int id,
            String bookTitle,
            String nickname,
            LocalDateTime loanDate,
            String status,
            String message
    ) {

    }
}
