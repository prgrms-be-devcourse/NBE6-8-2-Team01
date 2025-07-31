package com.bookbook.domain.lendList.dto;

import com.bookbook.domain.rent.entity.Rent;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LendListResponseDto {
    
    private Integer id;
    private Long lenderUserId;
    private String title;
    private String bookTitle;
    private String author;
    private String publisher;
    private String bookCondition;
    private String bookImage;
    private String rentStatus;
    private String borrowerNickname;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    public static LendListResponseDto from(Rent rent, String borrowerNickname) {
        return LendListResponseDto.builder()
                .id(rent.getId())
                .lenderUserId(rent.getLenderUserId())
                .title(rent.getTitle())
                .bookTitle(rent.getBookTitle())
                .author(rent.getAuthor())
                .publisher(rent.getPublisher())
                .bookCondition(rent.getBookCondition())
                .bookImage(rent.getBookImage())
                .rentStatus(rent.getRentStatus().name())
                .borrowerNickname(borrowerNickname)
                .createdDate(rent.getCreatedDate())
                .modifiedDate(rent.getModifiedDate())
                .build();
    }
}