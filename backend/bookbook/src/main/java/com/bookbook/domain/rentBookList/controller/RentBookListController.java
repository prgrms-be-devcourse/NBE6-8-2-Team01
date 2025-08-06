package com.bookbook.domain.rentBookList.controller;

import com.bookbook.domain.rentBookList.dto.RentBookListResponseDto;
import com.bookbook.domain.rentBookList.dto.RentRequestDto;
import com.bookbook.domain.rentBookList.service.RentBookListService;
import com.bookbook.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookbook/rent")
@Tag(name = "RentBookListController", description = "책 빌리러가기 API 컨트롤러")
@Slf4j
public class RentBookListController {

    private final RentBookListService rentBookListService;

    @GetMapping("/available")
    @Operation(summary = "대여 가능한 책 목록 조회", description = "필터링과 페이징을 지원하는 대여 가능한 책 목록을 조회합니다.")
    public RsData<Map<String, Object>> getAvailableBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        log.debug("대여 가능한 책 목록 조회 - page: {}, size: {}, region: {}, category: {}, search: {}", 
                page, size, region, category, search);

        Page<RentBookListResponseDto> bookPage = rentBookListService.getAvailableBooks(
                page - 1, size, region, category, search);

        Map<String, Object> response = Map.of(
                "books", bookPage.getContent(),
                "pagination", Map.of(
                        "currentPage", page,
                        "totalPages", bookPage.getTotalPages(),
                        "totalElements", bookPage.getTotalElements(),
                        "size", size
                )
        );

        return new RsData<>("200-1", "대여 가능한 책 목록을 조회했습니다.", response);
    }

    @GetMapping("/{rentId}")
    @Operation(summary = "책 상세 정보 조회", description = "특정 책의 상세 정보를 조회합니다.")
    public RsData<RentBookListResponseDto> getBookDetail(
            @PathVariable Integer rentId
    ) {
        log.debug("책 상세 정보 조회 - rentId: {}", rentId);

        RentBookListResponseDto bookDetail = rentBookListService.getBookDetail(rentId);

        return new RsData<>("200-3", "책 상세 정보를 조회했습니다.", bookDetail);
    }

    @PostMapping("/{rentId}/request")
    @Operation(summary = "대여 신청", description = "특정 책에 대해 대여 신청을 합니다.")
    public RsData<Void> requestRent(
            @PathVariable Integer rentId,          // Long → Integer로 변경
            @RequestBody RentRequestDto requestDto
    ) {
        log.debug("대여 신청 - rentId: {}, message: {}", rentId, requestDto.getMessage());

        rentBookListService.requestRent(rentId, requestDto.getMessage());

        return RsData.of("200-1", "대여 신청이 완료되었습니다.");
    }

    @GetMapping("/regions")
    @Operation(summary = "지역 목록 조회", description = "등록된 책들의 지역 목록을 조회합니다.")
    public RsData<List<Map<String, String>>> getRegions() {
        log.debug("지역 목록 조회");

        List<Map<String, String>> regions = rentBookListService.getRegions();

        return new RsData<>("200-1", "지역 목록을 조회했습니다.", regions);
    }

    @GetMapping("/categories")
    @Operation(summary = "카테고리 목록 조회", description = "등록된 책들의 카테고리 목록을 조회합니다.")
    public RsData<List<Map<String, String>>> getCategories() {
        log.debug("카테고리 목록 조회");

        List<Map<String, String>> categories = rentBookListService.getCategories();

        return new RsData<>("200-1", "카테고리 목록을 조회했습니다.", categories);
    }
}
