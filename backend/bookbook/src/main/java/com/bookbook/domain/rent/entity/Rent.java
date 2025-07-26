package com.bookbook.domain.rent.entity;

import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor // 매개변수가 없는 기본 생성자를 제공하는 Lombok 어노테이션
public class Rent extends BaseEntity {
    private int lender_user_id; // 대여자 ID
    private String bookCondition; // 책 상태
    private String bookImage; // 책 이미지 URL
    private String address; // 사용자 주소
    private String contents; // 대여 내용
    private String rent_status; // 대여 상태 (예: 대여 가능, 대여 중, 거래 종료 등)

    private String title; // 책 제목
    private String author; // 책 저자
    private String publisher; // 책 출판사
}
