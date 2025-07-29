package com.bookbook.domain.rentList.controller;

import com.bookbook.domain.rentList.dto.RentListCreateRequestDto;
import com.bookbook.domain.rentList.dto.RentListResponseDto;
import com.bookbook.domain.rentList.service.RentListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/{borrowerUserId}/rentlist")
@RequiredArgsConstructor
public class RentListController {
    
    private final RentListService rentListService;
    
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
}