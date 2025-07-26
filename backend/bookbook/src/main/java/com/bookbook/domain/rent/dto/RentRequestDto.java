package com.bookbook.domain.rent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RentRequestDto(
        @NotBlank(message = "책 상태를 입력해주세요.")
        String bookCondition,
        @NotBlank(message = "책 이미지 URL을 입력해주세요.")
        String bookImage,
        @NotBlank(message = "주소를 입력해주세요.")
        String address,
        @Size(max = 500, message = "내용은 500자를 초과할 수 없습니다.")
        @NotBlank(message = "내용을 입력해주세요.")
        String contents,
        @NotBlank(message = "대여 상태를 입력해주세요.")
        String rentStatus, // Enum으로 관리(Available, Loaned, Finished)

        @NotBlank(message = "책 제목을 입력해주세요.")
        String title,
        @NotBlank(message = "책 저자를 입력해주세요.")
        String author,
        @NotBlank(message = "책 출판사를 입력해주세요.")
        String publisher
) {
}