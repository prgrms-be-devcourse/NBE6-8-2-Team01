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

/**
 * 책 검색 및 이미지 업로드 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/bookbook")
@RequiredArgsConstructor
public class BookSearchController {

    private final BookSearchService bookSearchService;
    private final ImageUploadService imageUploadService;

    @GetMapping("/searchbook")
    @Operation(summary = "알라딘 API를 이용한 책 검색")
    public ResponseEntity<List<BookSearchResponseDto>> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int start
    ){
        try{
            List<BookSearchResponseDto> searchResults = bookSearchService.searchBooks(query, start);
            if(searchResults.isEmpty()){
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(searchResults);

        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/upload-image")
    @Operation(summary = "이미지 업로드")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if(file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 비어있습니다.");
        }

        try{
            String imageUrl = imageUploadService.uploadImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e){
            e.printStackTrace();
            return ResponseEntity.status(500).body("이미지 업로드 실패: " + e.getMessage());
        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(500).body("서버 오류: " + e.getMessage());
        }
    }
}