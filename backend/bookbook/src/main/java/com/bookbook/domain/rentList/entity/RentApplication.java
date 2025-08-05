package com.bookbook.domain.rentList.entity;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.user.entity.User;
import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.*;

import java.time.LocalDateTime;

// 대여 신청을 저장하는 DB 테이블
// 25.08.05 현준
@Entity
@Getter
@Setter
@NoArgsConstructor
@Builder // 빌더 패턴을 사용하여 객체 생성
@AllArgsConstructor // 빌더 패턴을 위한 생성자
public class RentApplication extends BaseEntity {
    private LocalDateTime loanDate; // 대여 시작일

    @ManyToOne
    private User borrowerUser; // 대여 신청을 한 사용자

    @ManyToOne
    private Rent rentPost; // 대여 신청 대상 게시글

    private String status; // 대여 신청 상태 (예: "대기중, PENDING", "승인, ACCEPTED", "거절 REJECTED")

    @Column(columnDefinition = "TEXT") // 긴 텍스트를 저장하기 위해 TEXT 타입으로 설정
    private String message; // 대여 신청 메시지
}