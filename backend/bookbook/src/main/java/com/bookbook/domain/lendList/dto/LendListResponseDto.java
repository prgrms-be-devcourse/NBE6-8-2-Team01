package com.bookbook.domain.lendList.dto;

import com.bookbook.domain.rent.entity.Rent;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LendListResponseDto {
    
    private Long id;
    private Long lenderUserId;
    private String title;
    private String bookTitle;
    private String author;
    private String publisher;
    private String category;
    private String bookCondition;
    private String bookImage;
    private String address;
    private String contents;
    private String rentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static LendListResponseDto from(Rent rent) {
        return LendListResponseDto.builder()
                .id(rent.getId())
                .lenderUserId(rent.getLender_user_id())
                .title(rent.getTitle())
                .bookTitle(rent.getBookTitle())
                .author(rent.getAuthor())
                .publisher(rent.getPublisher())
                .category(rent.getCategory())
                .bookCondition(rent.getBookCondition())
                .bookImage(rent.getBookImage())
                .address(rent.getAddress())
                .contents(rent.getContents())
                .rentStatus(rent.getRent_status())
                .createdAt(rent.getCreateAt())
                .updatedAt(rent.getUpdateAt())
                .build();
    }
}