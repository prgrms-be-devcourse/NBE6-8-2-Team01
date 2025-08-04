package com.bookbook.domain.rentList.controller;

import com.bookbook.domain.rentList.dto.RentListCreateRequestDto;
import com.bookbook.domain.rentList.dto.RentListResponseDto;
import com.bookbook.domain.rentList.service.RentListService;
import com.bookbook.domain.review.dto.ReviewCreateRequestDto;
import com.bookbook.domain.review.dto.ReviewResponseDto;
import com.bookbook.domain.review.service.ReviewService;
import com.bookbook.global.rsdata.RsData;
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
     * 내가 빌린 도서 목록 조회 (검색 기능 포함)
     * 
     * @param borrowerUserId 대여받은 사용자 ID
     * @param search 검색어 (선택사항, 책 제목/저자/출판사/게시글 제목에서 검색)
     * @return 대여한 도서 목록
     */
    @GetMapping
    public ResponseEntity<RsData<List<RentListResponseDto>>> getRentListByUserId(
            @PathVariable Long borrowerUserId,
            @RequestParam(required = false) String search) {
        List<RentListResponseDto> rentList;
        if (search != null && !search.trim().isEmpty()) {
            rentList = rentListService.searchRentListByUserId(borrowerUserId, search);
        } else {
            rentList = rentListService.getRentListByUserId(borrowerUserId);
        }
        return ResponseEntity.ok(RsData.of("200", "대여 도서 목록을 조회했습니다.", rentList));
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
    public ResponseEntity<RsData<RentListResponseDto>> createRentList(
            @PathVariable Long borrowerUserId,
            @RequestBody RentListCreateRequestDto request) {
        RentListResponseDto response = rentListService.createRentList(borrowerUserId, request);
        return ResponseEntity.ok(RsData.of("200", "대여 신청을 등록했습니다.", response));
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
    public ResponseEntity<RsData<ReviewResponseDto>> createBorrowerReview(
            // @PathVariable - URL의 {borrowerUserId} 값 (리뷰 작성자 = 대여받은 사람)
            @PathVariable Long borrowerUserId,
            // @PathVariable - URL의 {rentId} 값 (어떤 대여 건에 대한 리뷰인지)
            @PathVariable Integer rentId,
            // @RequestBody - HTTP 요청 본문의 JSON 데이터를 객체로 변환
            // 클라이언트가 보낸 JSON 데이터가 ReviewCreateRequestDto로 변환됨
            @RequestBody ReviewCreateRequestDto request) {
        
        // 리뷰 서비스의 대여받은 사람 리뷰 생성 메서드 호출
        // 대여받은 사람(책을 빌린 사람)이 대여자(책을 빌려준 사람)를 평가
        ReviewResponseDto review = reviewService.createBorrowerReview(borrowerUserId, rentId, request);
        
        // 생성된 리뷰 정보와 함께 성공 응답 반환
        return ResponseEntity.ok(RsData.of("200", "리뷰를 작성했습니다.", review));
    }
}