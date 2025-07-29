package com.bookbook.domain.home.service;

import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.home.entity.Book;
import com.bookbook.domain.home.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class HomeService {

    private final BookRepository bookRepository;

    /**
     * 메인페이지 데이터 조회 - 지역별 최신 5개 도서 이미지
     * @param region 지역명 (선택적, 예: "관악구", "종로구")
     */
    public HomeResponseDto getHomeData(String region) {
        List<Book> books;
        Long totalCount;
        String actualRegion;

        if (region != null && !region.trim().isEmpty()) {
            // 특정 지역의 도서 조회 (향후 구현)
            log.debug("지역별 도서 조회: {}", region);
            // TODO: 지역별 도서 조회 로직 구현 예정
            books = bookRepository.findTop5WithImageOrderByIdDesc();
            totalCount = bookRepository.countBooksWithImage();
            actualRegion = region;
        } else {
            // 전체 지역의 도서 조회
            books = bookRepository.findTop5WithImageOrderByIdDesc();
            totalCount = bookRepository.countBooksWithImage();
            actualRegion = "전체";
        }

        // 이미지 URL만 추출
        List<String> bookImages = books.stream()
                .map(Book::getImage)
                .collect(Collectors.toList());

        return HomeResponseDto.builder()
                .region(actualRegion)
                .bookImages(bookImages)
                .totalBooksInRegion(totalCount)
                .build();
    }
}
