package com.bookbook.domain.home.service;

import com.bookbook.domain.book.entity.Book;
import com.bookbook.domain.book.enums.BookStatus;
import com.bookbook.domain.book.repository.BookRepository;
import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {
    
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    
    /**
     * 메인페이지 데이터 조회
     * @param userId 로그인한 사용자 ID (null이면 비로그인)
     * @return 메인페이지 응답 데이터
     */
    public HomeResponseDto getHomeData(Long userId) {
        if (userId != null) {
            // 로그인한 사용자: 해당 지역 도서 조회
            return getRegionBasedHomeData(userId);
        } else {
            // 비로그인 사용자: 전체 도서 조회
            return getGeneralHomeData();
        }
    }
    
    /**
     * 로그인 사용자용: 지역 기반 메인페이지 데이터
     */
    private HomeResponseDto getRegionBasedHomeData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 주소에서 구 정보 추출 (예: "서울특별시 성북구 안암동" → "성북구")
        String region = extractRegionFromAddress(user.getAddress());
        
        // 해당 지역의 이미지 있는 최신 5개 도서 조회
        List<Book> books = bookRepository.findTop5ByRegionWithImage(region, BookStatus.AVAILABLE)
                .stream()
                .limit(5)
                .collect(Collectors.toList());
        
        // 도서 이미지 URL만 추출
        List<String> bookImages = books.stream()
                .map(Book::getBookImage)
                .collect(Collectors.toList());
        
        return HomeResponseDto.builder()
                .region(region)
                .bookImages(bookImages)
                .totalBooksInRegion(bookRepository.countByRegionAndStatus(region, BookStatus.AVAILABLE))
                .build();
    }
    
    /**
     * 비로그인 사용자용: 전체 기반 메인페이지 데이터
     */
    private HomeResponseDto getGeneralHomeData() {
        // 전체 도서 중 이미지 있는 최신 5개 조회
        List<Book> books = bookRepository.findTop5WithImage(BookStatus.AVAILABLE)
                .stream()
                .limit(5)
                .collect(Collectors.toList());
        
        // 도서 이미지 URL만 추출
        List<String> bookImages = books.stream()
                .map(Book::getBookImage)
                .collect(Collectors.toList());
        
        return HomeResponseDto.builder()
                .region("전체")
                .bookImages(bookImages)
                .totalBooksInRegion(bookRepository.countByStatus(BookStatus.AVAILABLE))
                .build();
    }
    
    /**
     * 주소에서 구 정보 추출
     * 예: "서울특별시 성북구 안암동 123-45" → "성북구"
     */
    private String extractRegionFromAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return "전체";
        }
        
        // 공백으로 분리하여 '구'로 끝나는 부분 찾기
        String[] parts = address.split("\\s+");
        for (String part : parts) {
            if (part.endsWith("구")) {
                return part;
            }
        }
        
        // 구를 찾지 못한 경우 전체로 처리
        return "전체";
    }
}
