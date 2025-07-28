package com.bookbook.domain.home.controller;

import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.home.service.HomeService;
import com.bookbook.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    @Operation(
            summary = "메인페이지 데이터 조회",
            description = "이미지가 포함된 최신 5개 도서를 조회합니다.",
            tags = { "Home", "MainPage" }
    )
    public RsData<HomeResponseDto> getHomeData() {
        log.debug("GET /api/v1/bookbook/home 요청 수신 - 메인페이지 데이터 조회 시작");

        HomeResponseDto homeData = homeService.getHomeData();

        return new RsData<>(
                SUCCESS_HOME_FETCH,
                homeData.getMessage() != null ? homeData.getMessage() : SUCCESS_HOME_MSG,
                homeData
        );
    }
}
