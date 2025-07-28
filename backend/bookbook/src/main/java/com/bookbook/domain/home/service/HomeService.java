package com.bookbook.domain.home.service;

import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.home.entity.Book;
import com.bookbook.domain.home.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 메인페이지 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private final BookRepository bookRepository;

    /**
     * 메인페이지 데이터 조회 - 최신 5개 글의 이미지만
     */
    public HomeResponseDto getHomeData() {
        // 이미지가 있는 최신 5개 글 조회 (id 기준 최신순)
        List<Book> books = bookRepository.findTop5WithImageOrderByIdDesc();

        // 이미지 URL만 추출
        List<String> bookImages = books.stream()
                .map(Book::getImage)
                .collect(Collectors.toList());

        return HomeResponseDto.builder()
                .region("전체")
                .bookImages(bookImages)
                .totalBooksInRegion(bookRepository.countBooksWithImage())
                .build();
    }
}
