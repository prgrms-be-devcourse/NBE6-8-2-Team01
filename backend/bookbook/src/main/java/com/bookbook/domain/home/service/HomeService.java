package com.bookbook.domain.home.service;

import com.bookbook.domain.home.dto.BookInfoDto;
import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.home.dto.RegionInfoDto;
import com.bookbook.domain.home.entity.Book;
import com.bookbook.domain.home.repository.BookRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
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
     * @param request HTTP 요청 (사용자 지역 감지용)
     */
    public HomeResponseDto getHomeData(String region, HttpServletRequest request) {
        List<Book> books;
        Long totalCount;
        String actualRegion;
        String userRegion = detectUserRegion(request);

        if (region != null && !region.trim().isEmpty() && !"전체".equals(region)) {
            // 특정 지역의 도서 조회 - 지역명을 단순화하여 검색
            String searchRegion = simplifyRegionName(region);
            log.debug("지역별 도서 조회: {} -> {}", region, searchRegion);
            books = bookRepository.findTop5WithImageByRegionOrderByIdDesc(searchRegion);
            totalCount = bookRepository.countBooksWithImageByRegion(searchRegion);
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
                .userRegion(userRegion)
                .build();
    }

    /**
     * ID가 포함된 도서 정보 조회 (클릭 가능한 도서들)
     * @param region 지역명 (선택적)
     */
    public List<BookInfoDto> getBooksWithId(String region) {
        List<Book> books;

        if (region != null && !region.trim().isEmpty() && !"전체".equals(region)) {
            // 특정 지역의 도서 조회 - 지역명을 단순화하여 검색
            String searchRegion = simplifyRegionName(region);
            books = bookRepository.findTop5WithImageByRegionOrderByIdDesc(searchRegion);
        } else {
            // 전체 지역의 도서 조회
            books = bookRepository.findTop5WithImageOrderByIdDesc();
        }

        return books.stream()
                .map(book -> BookInfoDto.builder()
                        .id(book.getId())
                        .imageUrl(book.getImage())
                        .title(book.getTitle() != null ? book.getTitle() : "도서 " + book.getId())
                        .bookTitle(book.getTitle() != null ? book.getTitle() : "도서 " + book.getId())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 지역 목록 조회
     */
    public List<RegionInfoDto> getRegions() {
        // 한국의 광역자치단체 목록 (기본값)
        List<RegionInfoDto> defaultRegions = Arrays.asList(
                RegionInfoDto.builder().name("서울특별시").code("seoul").build(),
                RegionInfoDto.builder().name("부산광역시").code("busan").build(),
                RegionInfoDto.builder().name("대구광역시").code("daegu").build(),
                RegionInfoDto.builder().name("인천광역시").code("incheon").build(),
                RegionInfoDto.builder().name("광주광역시").code("gwangju").build(),
                RegionInfoDto.builder().name("대전광역시").code("daejeon").build(),
                RegionInfoDto.builder().name("울산광역시").code("ulsan").build(),
                RegionInfoDto.builder().name("경기도").code("gyeonggi").build(),
                RegionInfoDto.builder().name("강원특별자치도").code("gangwon").build(),
                RegionInfoDto.builder().name("충청북도").code("chungbuk").build(),
                RegionInfoDto.builder().name("충청남도").code("chungnam").build(),
                RegionInfoDto.builder().name("전북특별자치도").code("jeonbuk").build(),
                RegionInfoDto.builder().name("전라남도").code("jeonnam").build(),
                RegionInfoDto.builder().name("경상북도").code("gyeongbuk").build(),
                RegionInfoDto.builder().name("경상남도").code("gyeongnam").build(),
                RegionInfoDto.builder().name("제주특별자치도").code("jeju").build()
        );

        try {
            // DB에서 실제 등록된 지역들을 조회
            List<String> dbRegions = bookRepository.findDistinctRegions();
            
            if (!dbRegions.isEmpty()) {
                // DB에 등록된 지역들을 기본 지역 목록과 매칭하여 반환
                return defaultRegions.stream()
                        .filter(defaultRegion -> dbRegions.contains(defaultRegion.getName()))
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("DB에서 지역 목록 조회 실패, 기본값 사용: {}", e.getMessage());
        }

        // DB 조회 실패시 기본 지역 목록 반환
        return defaultRegions;
    }

    /**
     * 사용자 지역 감지 (회원 주소 기반)
     * 로그인한 사용자의 주소 정보에서 광역자치단체명을 추출하여 반환
     */
    private String detectUserRegion(HttpServletRequest request) {
        try {
            // Spring Security를 통해 현재 로그인한 사용자 정보 조회
            String userAddress = getCurrentUserAddress();
            if (userAddress != null && !userAddress.trim().isEmpty()) {
                return extractRegionFromAddress(userAddress);
            }
        } catch (Exception e) {
            log.debug("사용자 지역 감지 실패: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * 현재 로그인한 사용자의 주소 정보 조회
     */
    private String getCurrentUserAddress() {
        try {
            // Spring Security Context에서 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser")) {
                
                // CustomOAuth2User에서 주소 정보 추출
                if (authentication.getPrincipal() instanceof OAuth2User) {
                    OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                    return (String) oauth2User.getAttribute("address");
                }
            }
        } catch (Exception e) {
            log.debug("사용자 주소 조회 실패: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * 주소에서 광역자치단체명 추출
     * 예: "서울특별시 종로구 청운동" -> "서울특별시"
     */
    private String extractRegionFromAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return null;
        }
        
        // 광역자치단체명 목록
        String[] regions = {
            "서울특별시", "부산광역시", "대구광역시", "인천광역시", 
            "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
            "경기도", "강원특별자치도", "충청북도", "충청남도", 
            "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
        };
        
        // 주소에서 광역자치단체명 찾기
        for (String region : regions) {
            if (address.contains(region)) {
                return region;
            }
        }
        
        // 구 버전 명칭도 확인 (하위 호환성)
        if (address.contains("강원도")) return "강원특별자치도";
        if (address.contains("전라북도")) return "전북특별자치도";
        
        return null;
    }

    /**
     * 지역명을 검색하기 쉽게 단순화
     * 예: "서울특별시" -> "서울", "경기도" -> "경기"
     */
    private String simplifyRegionName(String region) {
        if (region == null || region.trim().isEmpty()) {
            return region;
        }
        
        // 특별시, 광역시, 도 등을 제거하여 핵심 지역명만 추출
        String simplified = region
                .replace("특별시", "")
                .replace("광역시", "")
                .replace("특별자치도", "")
                .replace("자치도", "")
                .replace("도", "");
        
        return simplified.trim();
    }
}
