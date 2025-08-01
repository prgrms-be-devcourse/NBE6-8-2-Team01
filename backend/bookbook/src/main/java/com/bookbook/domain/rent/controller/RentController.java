package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.service.RentService;
import com.bookbook.global.security.CustomOAuth2User;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// 25.08.01 수정 현준
@RestController // @Controller와 @ResponseBody를 합친 형태, RESTful 웹 서비스 컨트롤러
@RequestMapping({"/bookbook/rent", "/api/v1/bookbook/rent"}) // 기존 경로와 API 경로 모두 지원
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 생성
@CrossOrigin(origins = "http://localhost:3000") // 프론트엔드 CORS 허용
public class RentController {
    private final RentService rentService;

    // Rent 페이지 등록 Post 요청
    @PostMapping("/create") // /rent 경로로 POST 요청을 처리
    @Operation(summary = "Rent 페이지 등록") // Swagger 에서 API 문서화에 사용되는 설명
    public void createRentPage(
            @RequestBody @Valid RentRequestDto dto,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ){
        // 실제 로그인한 사용자 ID 사용
        Long userId = customOAuth2User.getUserId();
        rentService.createRentPage(dto, userId);
    }

    // Rent 페이지 조회 Get요청
    @GetMapping("/{id}") // /rent/{id} 경로로 GET 요청을 처리
    @Operation(summary = " Rent 페이지 단건 조회")
    public RentResponseDto getRentPage(@PathVariable int id){ // 경로 변수로 전달된 id를 사용
        return rentService.getRentPage(id);
    }
}