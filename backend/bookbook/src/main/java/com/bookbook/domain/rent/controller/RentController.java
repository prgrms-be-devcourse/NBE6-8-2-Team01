package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.service.RentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController // @Controller와 @ResponseBody를 합친 형태, RESTful 웹 서비스 컨트롤러
@RequestMapping// HTTP 요청의 특정 경로를 메서드나 클래스에 매핑
@RequiredArgsConstructor // final이나 @NonNull 필드에 대한 생성자를 자동으로 생성
public class RentController {
    private final RentService rentService;

    // Rent 페이지 등록 Post 요청
    @PostMapping("/create")
    @Transactional
    @Operation(summary = "Rent 페이지 등록") // Swagger에서 API 문서화에 사용되는 설명
    public void createRentPage(@RequestBody RentRequestDto dto){
        int id = 1; // 예시로 1을 사용, 실제로는 인증된 사용자 ID를 가져와야 함
        rentService.createRentPage(dto, id);
    }

    // Rent 페이지 조회 Get요청
    @GetMapping
    @Transactional
    @Operation(summary = " Rent 페이지 단건 조회")
    public RentResponseDto getRentPage(){
        int id = 1; // 예시로 1을 사용, 실제로는 인증된 사용자 ID를 가져와야 함
        return rentService.getRentPage(id);
    }
}
