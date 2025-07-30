package com.bookbook.domain.lendList.controller;

import com.bookbook.domain.lendList.dto.LendListResponseDto;
import com.bookbook.domain.lendList.service.LendListService;
import com.bookbook.domain.review.dto.ReviewCreateRequestDto;
import com.bookbook.domain.review.dto.ReviewResponseDto;
import com.bookbook.domain.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/user/{userId}/lendlist")
@RequiredArgsConstructor
public class LendListController {
    
    private final LendListService lendListService;
    private final ReviewService reviewService;
    
    @GetMapping
    public ResponseEntity<Page<LendListResponseDto>> getLendListByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<LendListResponseDto> lendList = lendListService.getLendListByUserId(userId, pageable);
        return ResponseEntity.ok(lendList);
    }
    
    @DeleteMapping("/{rentId}")
    public ResponseEntity<Void> deleteLendList(
            @PathVariable Long userId,
            @PathVariable Integer rentId) {
        lendListService.deleteLendList(userId, rentId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{rentId}/review")
    public ResponseEntity<ReviewResponseDto> createLenderReview(
            @PathVariable Long userId,
            @PathVariable Integer rentId,
            @RequestBody ReviewCreateRequestDto request) {
        ReviewResponseDto review = reviewService.createLenderReview(userId, rentId, request);
        return ResponseEntity.ok(review);
    }
}