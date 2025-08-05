package com.bookbook.domain.rentList.controller;

import com.bookbook.domain.rentList.dto.RentApplicationRequestDto;
import com.bookbook.domain.rentList.dto.RentApplicationResponseDto;
import com.bookbook.domain.rentList.service.RentApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 대여 신청 및 수락을 처리하는 컨트롤러
// 25.08.05 현준
@RestController
@RequestMapping("/api/v1/rent/applications")
@RequiredArgsConstructor
public class RentApplicationController {
    private final RentApplicationService rentApplicationService;

    // 도서 대여 신청 등록 (사용자가 글쓴이에게 신청)
    // /api/v1/rent/applications
    @PostMapping
    @Operation(summary = "도서 대여 신청 등록")
    public ResponseEntity<?> applyRentApplication(@RequestBody RentApplicationRequestDto request)
    {
        rentApplicationService.createRentApplication(request);
        return ResponseEntity.ok().body("대여 신청 완료");
    }

    // 자신의 게시글에 대한 대여 신청 목록 조회
    // /api/v1/rent/applications/lender/{lenderUserId}
    @GetMapping("/lender/{lenderUserId}")
    @Operation(summary = "대여 신청 목록 조회")
    public ResponseEntity<List<RentApplicationResponseDto>> getRentRequest(@PathVariable Long lenderUserId)
    {
        List<RentApplicationResponseDto> rendApplications = rentApplicationService.getRentApplications(lenderUserId);
        return ResponseEntity.ok(rendApplications);
    }

//    // /api/v1/rent/applications/lender/{lenderUserId}/accept
//    @PostMapping("/lender/{lenderUserId}/accept")
//    @Operation(summary = "대여 신청 수락")
//    public void createRentList(
//            @PathVariable Long borrowerUserId,
//            @RequestBody RentListCreateRequestDto request
//    ) {
//        rentApplicationService.createRentList(borrowerUserId, request);
//    }
}