// 25.08.03 현준
package com.bookbook.domain.rent.dto;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import lombok.Builder;

import java.time.LocalDateTime;

// 대여 글 단건 조회를 위한 DTO
@Builder
public record RentResponseDto(
        int id, // 글 ID
        Long lenderUserId, // 대여자 ID
        String title, // 글 제목
        String bookCondition, // 책 상태
        String bookImage, // 글쓴이가 올린 책 이미지 URL
        String address, // 사용자 주소
        String contents, // 대여 내용
        RentStatus rentStatus,

        String bookTitle, // 책 제목
        String author,
        String publisher,
        String category, // 책 카테고리
        String description, // 책 설명
        LocalDateTime createdDate,
        LocalDateTime modifiedDate,

        // 글쓴이 조회를 위해 필드 추가
        String nickname, // 글쓴이 닉네임
        Float rating, // 글쓴이 평점
        int lenderPostCount // 글쓴이 대여글 작성 수

) {
    public static RentResponseDto from(Rent rent) {
        return RentResponseDto.builder()
                .id(rent.getId())
                .lenderUserId(rent.getLenderUserId())
                .title(rent.getTitle())
                .bookCondition(rent.getBookCondition())
                .bookImage(rent.getBookImage())
                .address(rent.getAddress())
                .contents(rent.getContents())
                .rentStatus(rent.getRentStatus())
                .bookTitle(rent.getBookTitle())
                .author(rent.getAuthor())
                .publisher(rent.getPublisher())
                .category(rent.getCategory())
                .description(rent.getDescription())
                .createdDate(rent.getCreatedDate())
                .modifiedDate(rent.getModifiedDate())
                .build();
    }
}