package com.bookbook.domain.rentList.controller;

import com.bookbook.domain.rentList.dto.RentListCreateRequestDto;
import com.bookbook.domain.rentList.dto.RentListResponseDto;
import com.bookbook.domain.rentList.service.RentListService;
import com.bookbook.domain.review.dto.ReviewCreateRequestDto;
import com.bookbook.domain.review.dto.ReviewResponseDto;
import com.bookbook.domain.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 내가 빌린 도서 목록 관리 컨트롤러
 * 
 * 사용자가 대여한 도서 목록의 조회, 대여 신청 및 대여받은 사람이 대여자에게 리뷰를 작성하는 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v1/user/{borrowerUserId}/rentlist")
@RequiredArgsConstructor
public class RentListController {
    
    private final RentListService rentListService;
    private final ReviewService reviewService;
    
    /**
     * 내가 빌린 도서 목록 조회
     * 
     * @param borrowerUserId 대여받은 사용자 ID
     * @return 대여한 도서 목록
     */
    @GetMapping
    public ResponseEntity<List<RentListResponseDto>> getRentListByUserId(@PathVariable Long borrowerUserId) {
        List<RentListResponseDto> rentList = rentListService.getRentListByUserId(borrowerUserId);
        return ResponseEntity.ok(rentList);
    }
    
    /**
     * 도서 대여 신청 등록
     * 
     * 사용자가 원하는 도서에 대해 대여 신청을 등록합니다.
     * 반납일은 대여일로부터 자동으로 14일 후로 설정됩니다.
     * 
     * @param borrowerUserId 대여받을 사용자 ID
     * @param request 대여 신청 정보 (대여일, 게시글 ID)
     * @return 생성된 대여 기록 정보
     */
    @PostMapping
    public ResponseEntity<RentListResponseDto> createRentList(
            @PathVariable Long borrowerUserId,
            @RequestBody RentListCreateRequestDto request) {
        RentListResponseDto response = rentListService.createRentList(borrowerUserId, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 대여받은 사람이 대여자에게 리뷰 작성
     * 
     * 거래 완료 후 도서를 빌린 사람이 빌려준 사람을 평가하는 기능입니다.
     * 
     * @param borrowerUserId 대여받은 사람(리뷰 작성자) ID
     * @param rentId 대여 게시글 ID
     * @param request 리뷰 생성 요청 데이터 (평점 등)
     * @return 생성된 리뷰 정보
     */
    @PostMapping("/{rentId}/review")
    public ResponseEntity<ReviewResponseDto> createBorrowerReview(
            @PathVariable Long borrowerUserId,
            @PathVariable Integer rentId,
            @RequestBody ReviewCreateRequestDto request) {
        ReviewResponseDto review = reviewService.createBorrowerReview(borrowerUserId, rentId, request);
        return ResponseEntity.ok(review);
    }
}