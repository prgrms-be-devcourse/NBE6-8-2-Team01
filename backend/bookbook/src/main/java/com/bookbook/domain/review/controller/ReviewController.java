package com.bookbook.domain.review.controller;

import com.bookbook.domain.review.dto.ReviewCreateRequestDto;
import com.bookbook.domain.review.dto.ReviewResponseDto;
import com.bookbook.domain.review.service.ReviewService;
import com.bookbook.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 리뷰 관리 컨트롤러
 * 
 * 대여 거래 완료 후 사용자 간 상호 평가를 위한 리뷰 작성 기능을 제공합니다.
 * rentList와 lendList 컨트롤러의 리뷰 엔드포인트를 보완하는 역할을 합니다.
 */
@RestController
@RequestMapping("/api/v1/review")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    /**
     * 대여자가 대여받은 사람에게 리뷰 작성
     * 
     * 도서를 빌려준 사람이 빌려간 사람을 평가하는 기능입니다.
     * 
     * @param lenderId 대여자(리뷰 작성자) ID
     * @param rentId 대여 게시글 ID
     * @param request 리뷰 생성 요청 데이터 (평점)
     * @return 생성된 리뷰 정보
     */
    @PostMapping("/lender/{lenderId}/rent/{rentId}")
    public ResponseEntity<RsData<ReviewResponseDto>> createLenderReview(
            @PathVariable Long lenderId,
            @PathVariable Integer rentId,
            @RequestBody ReviewCreateRequestDto request) {
        ReviewResponseDto review = reviewService.createLenderReview(lenderId, rentId, request);
        return ResponseEntity.ok(RsData.of("200", "대여자 리뷰를 작성했습니다.", review));
    }
    
    /**
     * 대여받은 사람이 대여자에게 리뷰 작성
     * 
     * 도서를 빌린 사람이 빌려준 사람을 평가하는 기능입니다.
     * 
     * @param borrowerId 대여받은 사람(리뷰 작성자) ID
     * @param rentId 대여 게시글 ID
     * @param request 리뷰 생성 요청 데이터 (평점)
     * @return 생성된 리뷰 정보
     */
    @PostMapping("/borrower/{borrowerId}/rent/{rentId}")
    public ResponseEntity<RsData<ReviewResponseDto>> createBorrowerReview(
            @PathVariable Long borrowerId,
            @PathVariable Integer rentId,
            @RequestBody ReviewCreateRequestDto request) {
        ReviewResponseDto review = reviewService.createBorrowerReview(borrowerId, rentId, request);
        return ResponseEntity.ok(RsData.of("200", "대여받은 사람 리뷰를 작성했습니다.", review));
    }
}