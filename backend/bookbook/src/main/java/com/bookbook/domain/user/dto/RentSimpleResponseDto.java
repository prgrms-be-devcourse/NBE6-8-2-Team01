package com.bookbook.domain.user.dto;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record RentSimpleResponseDto(
        @NonNull Integer id,
        @NonNull Long lenderUserId,
        @NonNull RentStatus status,
        @NonNull String bookCondition,
        @NonNull String bookTitle,
        @NonNull String author,
        @NonNull String publisher,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate
){
    public static RentSimpleResponseDto from(Rent rent) {
        return RentSimpleResponseDto.builder()
                .id(rent.getId())
                .lenderUserId(rent.getLenderUserId())
                .status(rent.getRentStatus().name()) // enum을 String으로 변환
                .bookCondition(rent.getBookCondition())
                .bookTitle(rent.getBookTitle())
                .author(rent.getAuthor())
                .publisher(rent.getPublisher())
                .createdDate(rent.getCreatedDate())
                .modifiedDate(rent.getModifiedDate())
                .build();
    }
}
