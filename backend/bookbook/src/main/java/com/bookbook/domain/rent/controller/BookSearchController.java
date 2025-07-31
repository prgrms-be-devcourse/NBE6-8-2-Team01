package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.dto.BookSearchResponseDto;
import com.bookbook.domain.rent.service.BookSearchService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 책 검색 및 이미지 업로드 API 컨트롤러
 */
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


}