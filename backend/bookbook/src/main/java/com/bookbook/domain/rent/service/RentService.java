package com.bookbook.domain.rent.service;

import com.bookbook.domain.notification.enums.NotificationType;
import com.bookbook.domain.notification.service.NotificationService;
import com.bookbook.domain.rent.dto.RentAvailableResponseDto;
import com.bookbook.domain.rent.dto.RentDetailResponseDto;
import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.user.dto.ChangeRentStatusRequestDto;
import com.bookbook.domain.user.dto.RentSimpleResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.exception.ServiceException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// 25.08.01 현준
@Service
@RequiredArgsConstructor
public class RentService {
    private final RentRepository rentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Rent 페이지 등록 Post 요청
    // /bookbook/rent/create
    @Transactional
    public void createRentPage(RentRequestDto dto, Long userId) {
        // 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new ServiceException("401", "로그인을 해 주세요."));

        // Rent 엔티티 생성 (Builder 패턴 활용)
        Rent rent = Rent.builder()
                // 글 관련 정보
                .lenderUserId(userId)
                .title(dto.title())
                .bookCondition(dto.bookCondition())
                .bookImage(dto.bookImage())
                .address(dto.address())
                .contents(dto.contents())
                .rentStatus(dto.rentStatus())

                // 책 관련 정보
                .bookTitle(dto.bookTitle())
                .author(dto.author())
                .publisher(dto.publisher())
                .category(dto.category())
                .description(dto.description())
                .build();

        // Rent 테이블에 추가
        Rent savedRent = rentRepository.save(rent);

        // 글 등록 알림 생성을 별도 트랜잭션으로 처리
        createNotificationSafely(user, dto, savedRent);
    }

    // 별도 트랜잭션으로 알림 생성 (실패해도 글 등록에 영향 없음)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotificationSafely(User user, RentRequestDto dto, Rent savedRent) {
        try {
            // 글을 등록한 사용자 본인에게만 확인용 알림 보내기
            notificationService.createNotification(
                    user, // receiver (글을 등록한 사용자 본인)
                    user, // sender (글을 등록한 사용자 본인) - 닉네임 표시용
                    NotificationType.POST_CREATED, // POST_CREATED 타입 사용
                    "도서 대여글이 성공적으로 등록되었습니다!",
                    dto.bookTitle(),
                    dto.bookImage(),
                    (long) savedRent.getId()
            );
        } catch (Exception e) {
            // 알림 생성 실패 시 로그만 남기고 계속 진행
            System.err.println("❌ 알림 생성 실패 (하지만 글 등록은 성공): " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Rent 페이지 조회 Get 요청
    // /bookbook/rent/{id}
    @Transactional(readOnly = true) // 조회 기능이므로 readOnly=true 설정
    public RentResponseDto getRentPage(int id) {

        // 글 ID로 대여글 정보 조회
        Rent rent = rentRepository.findById(id)
                .orElseThrow(()-> new ServiceException("404-2", "해당 대여글을 찾을 수 없습니다."));

        // ID로 대여자 정보 조회
        User rentUser = userRepository.findById(rent.getLenderUserId())
                .orElseThrow(() -> new ServiceException("404-3", "해당 대여자를 찾을 수 없습니다."));

        // 대여자가 작성한 글 갯수 조회
        // 새로운 RentRepository 메소드 추가
        int lenderPostCount = rentRepository.countByLenderUserId(rentUser.getId());

        return new RentResponseDto(
                // 글 관련 정보
                rent.getId(),
                rent.getLenderUserId(),
                rent.getTitle(),
                rent.getBookCondition(),
                rent.getBookImage(),
                rent.getAddress(),
                rent.getContents(),
                rent.getRentStatus(),

                // 책 관련 정보
                rent.getBookTitle(),
                rent.getAuthor(),
                rent.getPublisher(),
                rent.getCategory(),
                rent.getDescription(),
                rent.getCreatedDate(),
                rent.getModifiedDate(),

                // 글쓴이 정보
                rentUser.getNickname(),
                rentUser.getRating(),
                lenderPostCount
        );
    }

    // Rent 페이지 수정 Put 요청
    // /bookbook/rent/edit/{id}
    @Transactional
    public void editRentPage(int id, @Valid RentRequestDto dto, Long userId) {
        // 글 ID로 대여글 정보 조회
        Rent rent = rentRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404-2", "해당 대여글을 찾을 수 없습니다."));

        // 글 작성자와 현재 로그인한 사용자가 일치하는지 확인
        if (!rent.getLenderUserId().equals(userId)) {
            throw new ServiceException("403", "해당 대여글을 수정할 권한이 없습니다.");
        }

        // Rent 엔티티 업데이트
        // 글 관련 정보
        rent.setTitle(dto.title());
        rent.setBookCondition(dto.bookCondition());
        rent.setBookImage(dto.bookImage());
        rent.setAddress(dto.address());
        rent.setContents(dto.contents());
        rent.setRentStatus(dto.rentStatus());

        // 책 관련 정보
        rent.setBookTitle(dto.bookTitle());
        rent.setAuthor(dto.author());
        rent.setPublisher(dto.publisher());
        rent.setCategory(dto.category());
        rent.setDescription(dto.description());

        // Rent 테이블에 업데이트
        rentRepository.save(rent);
    }

    // 대여 가능한 책 목록 조회 (필터링 및 페이지네이션 지원)
    @Transactional(readOnly = true)
    public RentAvailableResponseDto getAvailableBooks(String region, String category, String search, int page, int size) {
        // 페이지네이션 설정 (최신순 정렬)
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        
        Page<Rent> rentPage;
        
        // 필터 조건에 따른 쿼리 실행
        boolean hasRegion = region != null && !region.equals("all") && !region.trim().isEmpty();
        boolean hasCategory = category != null && !category.equals("all") && !category.trim().isEmpty();
        boolean hasSearch = search != null && !search.trim().isEmpty();
        
        if (hasRegion && hasCategory && hasSearch) {
            // 모든 필터 적용
            rentPage = rentRepository.findByRentStatusAndAddressAndCategoryAndSearchKeyword(
                    RentStatus.AVAILABLE, region.trim(), category.trim(), search.trim(), pageable);
        } else if (hasRegion && hasCategory) {
            // 지역 + 카테고리 필터
            rentPage = rentRepository.findByRentStatusAndAddressContainingAndCategoryContaining(
                    RentStatus.AVAILABLE, region.trim(), category.trim(), pageable);
        } else if (hasRegion && hasSearch) {
            // 지역 + 검색어 필터
            rentPage = rentRepository.findByRentStatusAndAddressAndSearchKeyword(
                    RentStatus.AVAILABLE, region.trim(), search.trim(), pageable);
        } else if (hasCategory && hasSearch) {
            // 카테고리 + 검색어 필터
            rentPage = rentRepository.findByRentStatusAndCategoryAndSearchKeyword(
                    RentStatus.AVAILABLE, category.trim(), search.trim(), pageable);
        } else if (hasRegion) {
            // 지역 필터만
            rentPage = rentRepository.findByRentStatusAndAddressContaining(
                    RentStatus.AVAILABLE, region.trim(), pageable);
        } else if (hasCategory) {
            // 카테고리 필터만
            rentPage = rentRepository.findByRentStatusAndCategoryContaining(
                    RentStatus.AVAILABLE, category.trim(), pageable);
        } else if (hasSearch) {
            // 검색어 필터만
            rentPage = rentRepository.findByRentStatusAndSearchKeyword(
                    RentStatus.AVAILABLE, search.trim(), pageable);
        } else {
            // 필터 없음 (대여 가능한 모든 책)
            rentPage = rentRepository.findByRentStatus(RentStatus.AVAILABLE, pageable);
        }
        
        // 결과가 없는 경우
        if (rentPage.isEmpty()) {
            return RentAvailableResponseDto.empty();
        }
        
        // Rent 엔티티를 BookInfo DTO로 변환 (사용자 닉네임 포함)
        List<RentAvailableResponseDto.BookInfo> books = rentPage.getContent()
                .stream()
                .map(rent -> {
                    // 사용자 닉네임 조회
                    String lenderNickname = userRepository.findById(rent.getLenderUserId())
                            .map(User::getNickname)
                            .orElse("알 수 없음");
                    
                    return RentAvailableResponseDto.BookInfo.from(rent, lenderNickname);
                })
                .collect(Collectors.toList());
        
        // 페이지네이션 정보 생성
        RentAvailableResponseDto.PaginationInfo pagination = 
                RentAvailableResponseDto.PaginationInfo.from(rentPage);
        
        return RentAvailableResponseDto.success(books, pagination);
    }

    @Transactional(readOnly = true)
    public Page<RentSimpleResponseDto> getRentsPage(
            Pageable pageable, List<String> status, String nickname
    ) {
        return rentRepository.findFilteredRentHistory(pageable, status, nickname)
                .map(RentSimpleResponseDto::from);
    }

    @Transactional
    public RentDetailResponseDto modifyRentPageStatus(Integer id, ChangeRentStatusRequestDto requestDto) {
        Rent rent = rentRepository.findById(id)
                .orElseThrow(()-> new ServiceException("404-2", "해당 대여글을 찾을 수 없습니다."));

        rent.setRentStatus(requestDto.status());
        return RentDetailResponseDto.from(rent);
    }

    @Transactional
    public void removeRentPage(Integer id) {
        try {
            rentRepository.deleteById(id);
        } catch (RuntimeException e) {
            throw new ServiceException("404-1", "해당 글은 존재하지 않습니다.");
        }
    }
}
