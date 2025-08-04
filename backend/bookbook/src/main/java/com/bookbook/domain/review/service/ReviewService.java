package com.bookbook.domain.review.service;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.rentList.entity.RentList;
import com.bookbook.domain.rentList.repository.RentListRepository;
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

/**
 * 양방향 리뷰 관리 서비스
 * 
 * 도서 대여 거래 완료 후 대여자와 대여받은 사람이 서로를 평가할 수 있는 
 * 양방향 리뷰 시스템의 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final RentRepository rentRepository;
    private final UserRepository userRepository;
    private final RentListRepository rentListRepository;
    
    /**
     * 대여자가 대여받은 사람에게 리뷰 작성
     * 
     * 도서를 빌려준 사람이 빌려간 사람을 평가하는 기능입니다.
     * 거래 완료 후에만 작성 가능하며, 중복 리뷰는 방지됩니다.
     * 
     * @param lenderId 대여자(리뷰 작성자) ID
     * @param rentId 대여 게시글 ID
     * @param request 리뷰 생성 요청 데이터 (평점)
     * @return 생성된 리뷰 정보
     * @throws IllegalArgumentException 게시글을 찾을 수 없거나 권한이 없는 경우
     * @throws IllegalStateException 거래가 완료되지 않았거나 이미 리뷰를 작성한 경우
     */
    @Transactional
    public ReviewResponseDto createLenderReview(Long lenderId, Integer rentId, ReviewCreateRequestDto request) {
        // 대여 게시글 조회
        Rent rent = rentRepository.findById(rentId)
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + rentId));
        
        // 본인이 작성한 글인지 확인
        if (!rent.getLenderUserId().equals(lenderId)) {
            throw new IllegalArgumentException("본인이 작성한 게시글에만 리뷰를 작성할 수 있습니다.");
        }

        // 공통 검증 로직 호출 - 중복 리뷰, 평점 유효성, 거래 완료 상태 확인
        validateReviewCreation(rent, lenderId, rentId, request.getRating());

        // 빌려간 사람 ID 조회
        RentList rentList = rentListRepository.findByRentId(rentId)
                .stream()
                .filter(rl -> rl.getRent().getRentStatus() == RentStatus.FINISHED)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("완료된 대여 기록을 찾을 수 없습니다."));
        
        // 빌려간 사람의 ID 추출
        Long borrowerId = rentList.getBorrowerUser().getId();
        
        // 리뷰 엔티티 생성 - 생성자를 통해 모든 정보 설정
        // "LENDER_TO_BORROWER": 대여자가 대여받은 사람을 평가하는 리뷰
        Review review = new Review(rentId, lenderId, borrowerId, request.getRating(), "LENDER_TO_BORROWER");
        //                         ↑       ↑         ↑           ↑                     ↑
        //                      대여글ID  작성자ID   대상자ID     평점                리뷰타입
        
        // 데이터베이스에 저장 - JPA가 INSERT 쿼리 실행
        Review savedReview = reviewRepository.save(review);
        
        // 대상자(대여받은 사람)의 평균 평점 업데이트
        updateUserRating(borrowerId);

        // 추가 정보 조회
        String lenderNickname = userRepository.findById(lenderId)
                .map(user -> user.getNickname())
                .orElse("알 수 없음");
        String borrowerNickname = userRepository.findById(borrowerId)
                .map(user -> user.getNickname())
                .orElse("알 수 없음");

        return ReviewResponseDto.from(savedReview, lenderNickname, borrowerNickname,
                rent.getBookTitle(), rent.getBookImage());
    }
    
    /**
     * 대여받은 사람이 대여자에게 리뷰 작성
     * 
     * 도서를 빌린 사람이 빌려준 사람을 평가하는 기능입니다.
     * 거래 완료 후에만 작성 가능하며, 중복 리뷰는 방지됩니다.
     * 
     * @param borrowerId 대여받은 사람(리뷰 작성자) ID
     * @param rentId 대여 게시글 ID
     * @param request 리뷰 생성 요청 데이터 (평점)
     * @return 생성된 리뷰 정보
     * @throws IllegalArgumentException 게시글을 찾을 수 없는 경우
     * @throws IllegalStateException 거래가 완료되지 않았거나 이미 리뷰를 작성한 경우
     */
    @Transactional
    public ReviewResponseDto createBorrowerReview(Long borrowerId, Integer rentId, ReviewCreateRequestDto request) {
        // 대여 게시글 조회
        Rent rent = rentRepository.findById(rentId)
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + rentId));

        // 공통 검증 로직 호출
        validateReviewCreation(rent, borrowerId, rentId, request.getRating());

        // 본인이 해당 도서를 대여했는지 확인
        boolean isBorrower = rentListRepository.findByRentId(rentId)
                .stream()
                .anyMatch(rl -> rl.getBorrowerUser().getId().equals(borrowerId));

        if (!isBorrower) {
            throw new IllegalArgumentException("해당 도서를 대여한 사용자만 리뷰를 작성할 수 있습니다.");
        }

        // 리뷰 생성 (빌려간 사람이 빌려준 사람을 평가)
        Review review = new Review(rentId, borrowerId, rent.getLenderUserId(), request.getRating(), "BORROWER_TO_LENDER");
        Review savedReview = reviewRepository.save(review);

        // 사용자 평점 업데이트
        updateUserRating(rent.getLenderUserId());

        // 추가 정보 조회
        String borrowerNickname = userRepository.findById(borrowerId)
                .map(user -> user.getNickname())
                .orElse("알 수 없음");
        String lenderNickname = userRepository.findById(rent.getLenderUserId())
                .map(user -> user.getNickname())
                .orElse("알 수 없음");

        return ReviewResponseDto.from(savedReview, borrowerNickname, lenderNickname,
                rent.getBookTitle(), rent.getBookImage());
    }

    /**
     * 리뷰 작성 공통 검증 로직
     *
     * @param rent 대여 게시글
     * @param reviewerId 리뷰 작성자 ID
     * @param rentId 대여 게시글 ID
     * @param rating 평점
     */
    private void validateReviewCreation(Rent rent, Long reviewerId, Integer rentId, Integer rating) {
        // 거래 완료 상태 확인 - FINISHED 상태일 때만 리뷰 작성 가능
        if (rent.getRentStatus() != RentStatus.FINISHED) {
            throw new IllegalStateException("거래가 완료된 경우에만 리뷰를 작성할 수 있습니다.");
        }
        
        // 중복 리뷰 방지 - 같은 사람이 같은 대여 건에 이미 리뷰 작성했는지 확인
        Optional<Review> existingReview = reviewRepository.findByRentIdAndReviewerId(rentId, reviewerId);
        // Optional.isPresent(): Optional에 값이 있으면 true (= 이미 리뷰 존재)
        if (existingReview.isPresent()) {
            throw new IllegalStateException("이미 리뷰를 작성하셨습니다.");
        }
        
        // 평점 유효성 검사 - 1~5점 범위 확인
        // 비즈니스 룰: 별점은 1점(최저) ~ 5점(최고) 사이만 허용
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("별점은 1점부터 5점까지 입력 가능합니다.");
        }
    }
    
    /**
     * 사용자 평점 업데이트
     * 
     * 리뷰 작성 후 해당 사용자의 평균 평점을 계산하여 사용자 정보를 업데이트합니다.
     * 
     * @param userId 평점을 업데이트할 사용자 ID
     */
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