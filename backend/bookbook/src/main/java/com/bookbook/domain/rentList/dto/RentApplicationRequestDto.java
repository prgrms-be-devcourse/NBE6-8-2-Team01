package com.bookbook.domain.rentList.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class RentApplicationRequestDto {
    private LocalDateTime loanDate; // 신청자가 원하는 대여 시작일
    private Integer rentId; // 대여 글 ID
    private Long borrowerUserId; // 대여 신청을 한 사용자 ID
    private String message; // 대여 신청 메시지
}