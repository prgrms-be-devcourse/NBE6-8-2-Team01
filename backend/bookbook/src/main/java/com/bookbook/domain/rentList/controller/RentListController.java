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

@RestController
@RequestMapping("/api/v1/user/{borrowerUserId}/rentlist")
@RequiredArgsConstructor
public class RentListController {
    
    private final RentListService rentListService;
    private final ReviewService reviewService;
    
    @GetMapping
    public ResponseEntity<List<RentListResponseDto>> getRentListByUserId(@PathVariable Long borrowerUserId) {
        List<RentListResponseDto> rentList = rentListService.getRentListByUserId(borrowerUserId);
        return ResponseEntity.ok(rentList);
    }
    
    @PostMapping
    public ResponseEntity<RentListResponseDto> createRentList(
            @PathVariable Long borrowerUserId,
            @RequestBody RentListCreateRequestDto request) {
        RentListResponseDto response = rentListService.createRentList(borrowerUserId, request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{rentId}/review")
    public ResponseEntity<ReviewResponseDto> createBorrowerReview(
            @PathVariable Long borrowerUserId,
            @PathVariable Integer rentId,
            @RequestBody ReviewCreateRequestDto request) {
        ReviewResponseDto review = reviewService.createBorrowerReview(borrowerUserId, rentId, request);
        return ResponseEntity.ok(review);
    }
}