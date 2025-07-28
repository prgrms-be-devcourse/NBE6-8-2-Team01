package com.bookbook.domain.home.controller;

import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.home.service.HomeService;
import com.bookbook.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 메인페이지 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bookbook")
@Tag(name = "HomeController", description = "메인페이지 API 컨트롤러")
@Slf4j
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/home")
    @Operation(
            summary = "메인페이지 데이터 조회",
            description = "이미지가 있는 최신 5개 도서를 조회합니다."
    )
    public RsData<HomeResponseDto> getHomeData() {
        log.debug("메인페이지 데이터 요청");

        HomeResponseDto homeData = homeService.getHomeData();

        return RsData.of(
                "200-1",
                homeData.getMessage(),
                homeData
        );
    }
}
