package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.dto.BookSearchResponseDto;
import com.bookbook.domain.rent.service.BookSearchService;
import com.bookbook.domain.rent.service.ImageUploadService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 실제 파일 업로드 시에는 파일 크기 제한, 파일 타입 검증(이미지 파일만 허용), 악성 코드 검사 등 추가적인 보안 조치
@RestController
@RequestMapping("/api/v1/bookbook")
@RequiredArgsConstructor
public class BookSearchController {

    private final BookSearchService bookSearchService;

    @GetMapping("/searchbook")
    @Operation(summary = "알라딘 API를 이용한 책 검색")
    public ResponseEntity<List<BookSearchResponseDto>> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int start
    ){
        try{
            List<BookSearchResponseDto> searchResults = bookSearchService.searchBooks(query, start); // 서비스 호출 변경
            if(searchResults.isEmpty()){
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(searchResults);

        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}
