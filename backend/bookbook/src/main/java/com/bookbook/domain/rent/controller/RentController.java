package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.service.RentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController // @Controller와 @ResponseBody를 합친 형태, RESTful 웹 서비스 컨트롤러
@RequestMapping("/bookbook/rent") // HTTP 요청의 특정 경로를 메서드나 클래스에 매핑
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 생성
public class RentController {
    private final RentService rentService;

    // Rent 페이지 등록 Post 요청
    @PostMapping("/create") // /rent 경로로 POST 요청을 처리
    @Operation(summary = "Rent 페이지 등록") // Swagger 에서 API 문서화에 사용되는 설명
    public void createRentPage(@RequestBody @Valid RentRequestDto dto){
        int id = 1; // 예시로 1을 사용, 실제로는 인증된 사용자 ID를 가져와야 함
        rentService.createRentPage(dto, id);
    }

    // Rent 페이지 조회 Get요청
    @GetMapping("/{id}") // /rent/{id} 경로로 GET 요청을 처리
    @Operation(summary = " Rent 페이지 단건 조회")
    public RentResponseDto getRentPage(@PathVariable int id){ // 경로 변수로 전달된 id를 사용
        return rentService.getRentPage(id);
    }


}