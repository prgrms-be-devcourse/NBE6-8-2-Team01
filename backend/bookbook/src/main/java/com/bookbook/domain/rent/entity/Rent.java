package com.bookbook.domain.rent.entity;
import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.*;

// 25.07.31 현준
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rent extends BaseEntity {

    // 글 관련한 속성
    private Long lenderUserId; // 대여자 ID
    private String title; // 글 제목
    private String bookCondition; // 책 상태
    private String bookImage; // 글쓴이가 올린 책 이미지 URL
    private String address; // 사용자 주소
    private String contents; // 대여 내용
    private String rentStatus; // 대여 상태(Available, Loaned, Finished)

    // 알라딘 API로 받아온 책 관련 속성
    private String bookTitle; // 책 제목
    private String author; // 책 저자
    private String publisher; // 책 출판사
    private String category; // 책 카테고리
    private String description; // 책 설명
}