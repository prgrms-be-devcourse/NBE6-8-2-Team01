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
    
    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;
    
    @Column(name = "reviewee_id", nullable = false)
    private Long revieweeId;
    
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    @Column(name = "review_type", nullable = false)
    private String reviewType;
    
    public Review(Integer rentId, Long reviewerId, Long revieweeId, Integer rating, String reviewType) {
        this.rentId = rentId;
        this.reviewerId = reviewerId;
        this.revieweeId = revieweeId;
        this.rating = rating;
        this.reviewType = reviewType;
    }
}