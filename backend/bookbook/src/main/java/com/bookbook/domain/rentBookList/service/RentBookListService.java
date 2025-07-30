package com.bookbook.domain.rentBookList.service;

import com.bookbook.domain.notification.enums.NotificationType;
import com.bookbook.domain.notification.service.NotificationService;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rentBookList.dto.RentBookListResponseDto;
import com.bookbook.domain.rentBookList.repository.RentBookListRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RentBookListService {

    private final RentBookListRepository rentBookListRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // 대여 가능한 책 목록 조회
    public Page<RentBookListResponseDto> getAvailableBooks(int page, int size, String region, String category, String search) {
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Rent> rentPage;
        
        // 필터링 조건이 있는지 확인
        boolean hasFilters = (region != null && !region.trim().isEmpty() && !"all".equals(region)) ||
                           (category != null && !category.trim().isEmpty() && !"all".equals(category)) ||
                           (search != null && !search.trim().isEmpty());
        
        if (hasFilters) {
            // 필터링 적용
            String regionFilter = (region != null && !"all".equals(region)) ? region : null;
            String categoryFilter = (category != null && !"all".equals(category)) ? category : null;
            String searchFilter = (search != null && !search.trim().isEmpty()) ? search : null;
            
            rentPage = rentBookListRepository.findAvailableBooks(regionFilter, categoryFilter, searchFilter, pageable);
        } else {
            // 전체 조회
            rentPage = rentBookListRepository.findAllAvailableBooks(pageable);
        }
        
        return rentPage.map(RentBookListResponseDto::new);
    }

    // 대여 신청
    @Transactional
    public void requestRent(Integer rentId, String message) {         // Long → Integer로 변경
        // 대여 글 조회
        Rent rent = rentBookListRepository.findById(rentId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 대여 글입니다. ID: " + rentId));

        // 책 소유자 조회
        User bookOwner = userRepository.findById(rent.getLenderUserId())
                .orElseThrow(() -> new RuntimeException("책 소유자를 찾을 수 없습니다. ID: " + rent.getLenderUserId()));

        // 신청자 조회 (현재는 임시로 admin 사용 - 실제로는 @AuthenticationPrincipal로 받아야 함)
        User requester = userRepository.findByUsername("admin")
                .orElseThrow(() -> new RuntimeException("신청자 정보를 찾을 수 없습니다."));

        // 알림 생성
        notificationService.createNotification(
                bookOwner,
                requester,
                NotificationType.RENT_REQUEST,
                message,
                rent.getBookTitle(),
                rent.getBookImage(),
                (long) rentId                                       // int → long 캐스팅
        );

        log.info("대여 신청 완료 - 대여글 ID: {}, 신청자: {}, 책 소유자: {}", 
                rentId, requester.getNickname(), bookOwner.getNickname());
    }

    // 지역 목록 조회
    public List<Map<String, String>> getRegions() {
        List<String> regions = rentBookListRepository.findDistinctRegions();
        
        return regions.stream()
                .map(region -> Map.of("id", region, "name", region))
                .collect(Collectors.toList());
    }

    // 카테고리 목록 조회
    public List<Map<String, String>> getCategories() {
        List<String> categories = rentBookListRepository.findDistinctCategories();
        
        return categories.stream()
                .map(category -> Map.of("id", category, "name", category))
                .collect(Collectors.toList());
    }
}
