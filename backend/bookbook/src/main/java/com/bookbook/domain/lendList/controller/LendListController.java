package com.bookbook.domain.lendList.controller;

import com.bookbook.domain.lendList.dto.LendListResponseDto;
import com.bookbook.domain.lendList.service.LendListService;
import com.bookbook.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/{userId}/lendlist")
@RequiredArgsConstructor
public class LendListController {
    
    private final LendListService lendListService;
    
    @GetMapping
    public ResponseEntity<RsData<Page<LendListResponseDto>>> getLendListByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<LendListResponseDto> lendList = lendListService.getLendListByUserId(userId, pageable);
        return ResponseEntity.ok(RsData.of("S-1", "사용자의 대여 게시물 목록 조회 성공", lendList));
    }
    
    @GetMapping("/all")
    public ResponseEntity<RsData<List<LendListResponseDto>>> getAllLendListByUserId(@PathVariable Long userId) {
        List<LendListResponseDto> lendList = lendListService.getAllLendListByUserId(userId);
        return ResponseEntity.ok(RsData.of("S-1", "사용자의 전체 대여 게시물 목록 조회 성공", lendList));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<RsData<Page<LendListResponseDto>>> getLendListByUserIdAndStatus(
            @PathVariable Long userId,
            @PathVariable String status,
            @PageableDefault(size = 10, sort = "createAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<LendListResponseDto> lendList = lendListService.getLendListByUserIdAndStatus(userId, status, pageable);
        return ResponseEntity.ok(RsData.of("S-1", "사용자의 상태별 대여 게시물 목록 조회 성공", lendList));
    }
}