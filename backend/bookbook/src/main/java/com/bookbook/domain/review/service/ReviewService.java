package com.bookbook.domain.review.service;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.review.dto.ReviewCreateRequestDto;
import com.bookbook.domain.review.dto.ReviewResponseDto;
import com.bookbook.domain.review.entity.Review;
import com.bookbook.domain.review.repository.ReviewRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final RentRepository rentRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ReviewResponseDto createLenderReview(Long lenderId, Integer rentId, ReviewCreateRequestDto request) {
        // 대여 게시글 조회
        Rent rent = rentRepository.findById(rentId)
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + rentId));
        
        // 본인이 작성한 글인지 확인
        if (!rent.getLenderUserId().equals(lenderId)) {
            throw new IllegalArgumentException("본인이 작성한 게시글에만 리뷰를 작성할 수 있습니다.");
        }
        
        // 거래가 완료된 상태인지 확인
        if (!"Finished".equals(rent.getRentStatus())) {
            throw new IllegalStateException("거래가 완료된 경우에만 리뷰를 작성할 수 있습니다.");
        }
        
        // 이미 리뷰를 작성했는지 확인
        Optional<Review> existingReview = reviewRepository.findByRentIdAndReviewerId(rentId, lenderId);
        if (existingReview.isPresent()) {
            throw new IllegalStateException("이미 리뷰를 작성하셨습니다.");
        }
        
        // 별점 유효성 검사
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1점부터 5점까지 입력 가능합니다.");
        }
        
        // 빌려간 사람 ID 조회 (임시로 빈 값 처리 - 실제로는 대여 기록에서 조회 필요)
        Long borrowerId = 1L; // TODO: 실제 borrower ID 조회 로직 구현
        
        // 리뷰 생성
        Review review = new Review(rentId, lenderId, borrowerId, request.getRating(), "LENDER_TO_BORROWER");
        Review savedReview = reviewRepository.save(review);
        
        // 사용자 평점 업데이트
        updateUserRating(borrowerId);
        
        return ReviewResponseDto.from(savedReview);
    }
    
    @Transactional
    public ReviewResponseDto createBorrowerReview(Long borrowerId, Integer rentId, ReviewCreateRequestDto request) {
        // 대여 게시글 조회
        Rent rent = rentRepository.findById(rentId)
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + rentId));
        
        // 거래가 완료된 상태인지 확인
        if (!"Finished".equals(rent.getRentStatus())) {
            throw new IllegalStateException("거래가 완료된 경우에만 리뷰를 작성할 수 있습니다.");
        }
        
        // 이미 리뷰를 작성했는지 확인
        Optional<Review> existingReview = reviewRepository.findByRentIdAndReviewerId(rentId, borrowerId);
        if (existingReview.isPresent()) {
            throw new IllegalStateException("이미 리뷰를 작성하셨습니다.");
        }
        
        // 별점 유효성 검사
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1점부터 5점까지 입력 가능합니다.");
        }
        
        // 리뷰 생성 (빌려간 사람이 빌려준 사람을 평가)
        Review review = new Review(rentId, borrowerId, rent.getLenderUserId(), request.getRating(), "BORROWER_TO_LENDER");
        Review savedReview = reviewRepository.save(review);
        
        // 사용자 평점 업데이트
        updateUserRating(rent.getLenderUserId());
        
        return ReviewResponseDto.from(savedReview);
    }
    
    private void updateUserRating(Long userId) {
        Optional<Double> averageRating = reviewRepository.findAverageRatingByRevieweeId(userId);
        if (averageRating.isPresent()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + userId));
            user.changeRating(averageRating.get().floatValue());
            userRepository.save(user);
        }
    }
}