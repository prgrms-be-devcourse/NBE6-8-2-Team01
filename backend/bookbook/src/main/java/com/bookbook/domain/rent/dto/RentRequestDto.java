package com.bookbook.domain.rent.dto;

import com.bookbook.domain.rent.entity.RentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// 25.07.31 현준
// 대여글 등록 시 필요한 정보를 담는 DTO(Data Transfer Object)
public record RentRequestDto(
        @NotBlank(message = "대여글 제목을 입력해주세요.")
        String title,

        @NotBlank(message = "책 상태를 입력해주세요.")
        String bookCondition,

        @NotBlank(message = "책 이미지 URL을 입력해주세요.")
        String bookImage,

        @NotBlank(message = "주소를 입력해주세요.")
        String address,

        @Size(max = 500, message = "내용은 500자를 초과할 수 없습니다.")
        @NotBlank(message = "내용을 입력해주세요.")
        String contents,

        @NotNull(message = "대여 상태를 입력해주세요.")
        RentStatus rentStatus, // Enum으로 관리(Available, Loaned, Finished)

        @NotBlank(message = "책 제목을 입력해주세요.")
        String bookTitle,

        @NotBlank(message = "책 저자를 입력해주세요.")
        String author,

        @NotBlank(message = "책 출판사를 입력해주세요.")
        String publisher,

        @NotBlank(message = "카테고리를 입력해주세요.")
        String category,

        @Size(max = 500, message = "내용은 500자를 초과할 수 없습니다.")
        @NotBlank(message = "책 설명을 입력해주세요.")
        String description
) {
}