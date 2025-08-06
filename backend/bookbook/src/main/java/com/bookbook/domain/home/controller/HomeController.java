package com.bookbook.domain.home.controller;

import com.bookbook.domain.home.dto.BookInfoDto;
import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.home.dto.RegionInfoDto;
import com.bookbook.domain.home.service.HomeService;
import com.bookbook.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookbook/home")
@Tag(name = "HomeController", description = "메인페이지 API 컨트롤러")
@Slf4j
public class HomeController {

    private final HomeService homeService;

    // 응답 코드 상수
    private static final String SUCCESS_HOME_FETCH = "200-1";
    private static final String SUCCESS_HOME_MSG = "메인페이지 데이터를 성공적으로 불러왔습니다.";
    private static final String SUCCESS_BOOKS_FETCH = "200-2";
    private static final String SUCCESS_BOOKS_MSG = "도서 정보를 성공적으로 불러왔습니다.";
    private static final String SUCCESS_REGIONS_FETCH = "200-3";
    private static final String SUCCESS_REGIONS_MSG = "지역 목록을 성공적으로 불러왔습니다.";

    @GetMapping
    @Operation(
            summary = "메인페이지 데이터 조회",
            description = "이미지가 포함된 최신 5개 도서를 조회합니다. 지역 파라미터로 특정 지역의 도서만 조회 가능합니다.",
            tags = { "Home", "MainPage" }
    )
    public RsData<HomeResponseDto> getHomeData(
            @RequestParam(value = "region", required = false) String region,
            HttpServletRequest request
    ) {
        log.debug("GET /api/v1/bookbook/home 요청 수신 - 지역: {}", region);

        HomeResponseDto homeData = homeService.getHomeData(region, request);

        return new RsData<>(
                SUCCESS_HOME_FETCH,
                homeData.getMessage() != null ? homeData.getMessage() : SUCCESS_HOME_MSG,
                homeData
        );
    }

    @GetMapping("/books-with-id")
    @Operation(
            summary = "도서 정보 조회 (ID 포함)",
            description = "클릭 가능한 도서들의 ID와 상세 정보를 포함하여 조회합니다. 지역 파라미터로 특정 지역의 도서만 조회 가능합니다.",
            tags = { "Home", "Books" }
    )
    public RsData<List<BookInfoDto>> getBooksWithId(
            @RequestParam(value = "region", required = false) String region
    ) {
        log.debug("GET /api/v1/bookbook/home/books-with-id 요청 수신 - 지역: {}", region);

        List<BookInfoDto> books = homeService.getBooksWithId(region);

        return new RsData<>(
                SUCCESS_BOOKS_FETCH,
                SUCCESS_BOOKS_MSG,
                books
        );
    }

    @GetMapping("/regions")
    @Operation(
            summary = "지역 목록 조회",
            description = "도서 등록이 가능한 지역 목록을 조회합니다.",
            tags = { "Home", "Regions" }
    )
    public RsData<List<RegionInfoDto>> getRegions() {
        log.debug("GET /api/v1/bookbook/home/regions 요청 수신");

        List<RegionInfoDto> regions = homeService.getRegions();

        return new RsData<>(
                SUCCESS_REGIONS_FETCH,
                SUCCESS_REGIONS_MSG,
                regions
        );
    }
}
