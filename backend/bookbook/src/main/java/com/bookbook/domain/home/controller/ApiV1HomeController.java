package com.bookbook.domain.home.controller;

import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.home.service.HomeService;
import com.bookbook.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/home")
@Tag(name = "ApiV1HomeController", description = "메인페이지 API 컨트롤러")
@Slf4j
public class ApiV1HomeController {
    
    private final HomeService homeService;
    
    @GetMapping
    @Operation(
        summary = "메인페이지 데이터 조회", 
        description = "전체 도서에서 이미지가 있는 최신 5개 도서를 조회합니다.\n" +
                     "이미지가 없는 도서는 제외됩니다."
    )
    public RsData<HomeResponseDto> getHomeData() {
        log.debug("메인페이지 데이터 요청 - 비로그인 사용자");
        
        // 비로그인 사용자는 항상 null로 처리 (전체 도서 조회)
        HomeResponseDto homeData = homeService.getHomeData(null);
        
        return new RsData<>(
                "200-1",
                homeData.getMessage(),
                homeData
        );
    }
    
    @GetMapping("/test")
    @Operation(
        summary = "테스트용 특정 지역 데이터 조회", 
        description = "개발/테스트용으로 특정 사용자 ID를 지정하여 지역별 도서를 확인할 수 있습니다."
    )
    public RsData<HomeResponseDto> getHomeDataForTest(
            @Parameter(description = "테스트용 사용자 ID (1=성북구, 2=강남구, 3=마포구)", example = "1")
            @RequestParam(required = false) Long userId
    ) {
        log.debug("테스트 모드 메인페이지 데이터 요청 - 사용자 ID: {}", userId);
        
        HomeResponseDto homeData = homeService.getHomeData(userId);
        
        return new RsData<>(
                "200-1",
                homeData.getMessage() + " (테스트 모드)",
                homeData
        );
    }
}
