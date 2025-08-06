package com.bookbook.domain.lendList.controller;

import com.bookbook.domain.lendList.dto.LendListResponseDto;
import com.bookbook.domain.lendList.service.LendListService;
import com.bookbook.domain.review.dto.ReviewCreateRequestDto;
import com.bookbook.domain.review.dto.ReviewResponseDto;
import com.bookbook.domain.review.service.ReviewService;
import com.bookbook.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 내가 등록한 도서 목록 관리 컨트롤러
 * 
 * 사용자가 등록한 도서 게시글의 조회, 삭제 및 대여자가 대여받은 사람에게 리뷰를 작성하는 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v1/user/{userId}/lendlist")
@RequiredArgsConstructor
public class LendListController {
    
    private final LendListService lendListService;
    private final ReviewService reviewService;
    
    /**
     * 내가 등록한 도서 목록 조회 (검색 기능 포함)
     * 
     * @param userId 사용자 ID
     * @param search 검색어 (선택사항, 책 제목/저자/출판사/게시글 제목에서 검색)
     * @param pageable 페이징 정보 (기본: 10개씩, 생성일 역순)
     * @return 등록한 도서 게시글 목록
     */
    @GetMapping
    public ResponseEntity<RsData<Page<LendListResponseDto>>> getLendListByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<LendListResponseDto> lendList;
        if (search != null && !search.trim().isEmpty()) {
            lendList = lendListService.getLendListByUserIdAndSearch(userId, search, pageable);
        } else {
            lendList = lendListService.getLendListByUserId(userId, pageable);
        }
        return ResponseEntity.ok(RsData.of("200", "등록한 도서 목록을 조회했습니다.", lendList));
    }
    
    /**
     * 내가 등록한 도서 게시글 삭제
     * 
     * @param userId 사용자 ID (작성자 확인용)
     * @param rentId 삭제할 도서 게시글 ID
     * @return 204 No Content
     */
    @DeleteMapping("/{rentId}")
    public ResponseEntity<RsData<Void>> deleteLendList(
            @PathVariable Long userId,
            @PathVariable Integer rentId) {
        lendListService.deleteLendList(userId, rentId);
        return ResponseEntity.ok(RsData.of("200", "도서 게시글을 삭제했습니다."));
    }
    
    /**
     * 대여자가 대여받은 사람에게 리뷰 작성
     * 
     * 거래 완료 후 도서를 빌려준 사람이 빌려간 사람을 평가하는 기능입니다.
     * 
     * @param userId 대여자(리뷰 작성자) ID
     * @param rentId 대여 게시글 ID
     * @param request 리뷰 생성 요청 데이터 (평점 등)
     * @return 생성된 리뷰 정보
     */
    @PostMapping("/{rentId}/review")
    public ResponseEntity<RsData<ReviewResponseDto>> createLenderReview(
            // @PathVariable - URL의 {userId} 값 (리뷰 작성자 = 대여자)
            @PathVariable Long userId,
            // @PathVariable - URL의 {rentId} 값 (어떤 대여 건에 대한 리뷰인지)
            @PathVariable Integer rentId,
            // @RequestBody - HTTP 요청 본문의 JSON 데이터를 객체로 변환
            // 클라이언트가 보낸 JSON 데이터가 ReviewCreateRequestDto로 변환됨
            @RequestBody ReviewCreateRequestDto request) {
        
        // 리뷰 서비스의 대여자 리뷰 생성 메서드 호출
        // 대여자(책을 빌려준 사람)가 대여받은 사람(책을 빌린 사람)을 평가
        ReviewResponseDto review = reviewService.createLenderReview(userId, rentId, request);
        
        // 생성된 리뷰 정보와 함께 성공 응답 반환
        return ResponseEntity.ok(RsData.of("200", "리뷰를 작성했습니다.", review));
    }
}