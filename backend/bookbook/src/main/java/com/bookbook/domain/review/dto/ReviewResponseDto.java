package com.bookbook.domain.review.dto;

import com.bookbook.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    
    private int id;
    private Integer rentId;
    private Long reviewerId;
    private Long revieweeId;
    private String reviewerNickname;
    private String revieweeNickname;
    private String bookTitle;
    private String bookImage;
    private Integer rating;
    private String reviewType;
    private LocalDateTime createdDate;


    public static ReviewResponseDto from(Review review, String reviewerNickname, String revieweeNickname,
                                         String bookTitle, String bookImage) {
        return new ReviewResponseDto(
                review.getId(),
                review.getRentId(),
                review.getReviewerId(),
                review.getRevieweeId(),
                reviewerNickname,
                revieweeNickname,
                bookTitle,
                bookImage,
                review.getRating(),
                review.getReviewType(),
                review.getCreatedDate()
        );
    }
}