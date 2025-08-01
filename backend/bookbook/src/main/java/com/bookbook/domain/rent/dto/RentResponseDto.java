package com.bookbook.domain.rent.dto;

import com.bookbook.domain.rent.entity.RentStatus;

import java.time.LocalDateTime;

// 대여 글 단건 조회를 위한 DTO
public record RentResponseDto(
        int id,
        Long lenderUserId,
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
        LocalDateTime modifiedDate
) {
}