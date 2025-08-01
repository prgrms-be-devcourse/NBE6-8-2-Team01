package com.bookbook.domain.review.repository;

import com.bookbook.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    Optional<Review> findByRentIdAndReviewerId(Integer rentId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.revieweeId = :revieweeId")
    Optional<Double> findAverageRatingByRevieweeId(@Param("revieweeId") Long revieweeId);
    
    // 특정 사용자에 대한 리뷰 개수 조회
    long countByRevieweeId(Long revieweeId);
}