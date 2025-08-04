package com.bookbook.domain.review.entity;

import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Review extends BaseEntity {

    @Column(name = "rent_id", nullable = false)
    private Integer rentId;
    
    // 리뷰 작성자 ID - 리뷰를 쓴 사람
    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;
    
    // 리뷰 대상자 ID - 리뷰를 받은 사람
    @Column(name = "reviewee_id", nullable = false)
    private Long revieweeId;
    
    // 평점 - 1~5점 사이의 정수값
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    // 리뷰 타입 - 어떤 방향의 리뷰인지 구분
    // "LENDER_TO_BORROWER": 대여자 → 대여받은 사람
    // "BORROWER_TO_LENDER": 대여받은 사람 → 대여자
    @Column(name = "review_type", nullable = false)
    private String reviewType;
    
    // 모든 필드를 받는 생성자 - 객체 생성시 모든 값을 한번에 설정
    // 주로 서비스에서 새로운 리뷰를 생성할 때 사용
    public Review(Integer rentId, Long reviewerId, Long revieweeId, Integer rating, String reviewType) {
        this.rentId = rentId;           // 대여 게시글 ID 설정
        this.reviewerId = reviewerId;   // 작성자 ID 설정
        this.revieweeId = revieweeId;   // 대상자 ID 설정
        this.rating = rating;           // 평점 설정
        this.reviewType = reviewType;   // 리뷰 타입 설정
    }
}