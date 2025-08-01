package com.bookbook.domain.rent.service;

import com.bookbook.domain.rent.dto.RentAvailableResponseDto;
import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.hibernate.boot.model.naming.IllegalIdentifierException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// 25.07.31 현준
@Service
@RequiredArgsConstructor
public class RentService {
    private final RentRepository rentRepository;

    // Rent 페이지 등록 Post 요청
    // http://localhost:3000/bookbook/rent/create
    @Transactional
    public void createRentPage(RentRequestDto dto, long userId) {
//         유저 정보 조회(추후 인증 기능 추가 필요)
//         User user = userRepository.findById(userId)
//                 .orElseThrow(()-> new ServiceException("", "로그인을 해 주세요."));

        // Rent 엔티티 생성 (Builder 패턴 활용)
        Rent rent = Rent.builder()
                .lenderUserId(userId)
                .title(dto.title())
                .bookCondition(dto.bookCondition())
                .bookImage(dto.bookImage())
                .address(dto.address())
                .contents(dto.contents())
                .rentStatus(dto.rentStatus())
                .bookTitle(dto.bookTitle())
                .author(dto.author())
                .publisher(dto.publisher())
                .category(dto.category())
                .description(dto.description())
                .build();

        // Rent 테이블에 추가
        rentRepository.save(rent);
    }

    @Transactional(readOnly = true) // 조회 기능이므로 readOnly=true 설정
    public RentResponseDto getRentPage(int id) {

        Rent rent = rentRepository.findById(id)
                .orElseThrow(()-> new ServiceException("404-2", "해당 대여글을 찾을 수 없습니다."));

        return new RentResponseDto(
                rent.getLenderUserId(),
                rent.getBookCondition(),
                rent.getBookImage(),
                rent.getAddress(),
                rent.getContents(),
                rent.getRentStatus(),
                rent.getTitle(),
                rent.getAuthor(),
                rent.getPublisher(),
                rent.getCreatedDate(),
                rent.getModifiedDate()
        );
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
        
        // Rent 엔티티를 BookInfo DTO로 변환
        List<RentAvailableResponseDto.BookInfo> books = rentPage.getContent()
                .stream()
                .map(RentAvailableResponseDto.BookInfo::from)
                .collect(Collectors.toList());
        
        // 페이지네이션 정보 생성
        RentAvailableResponseDto.PaginationInfo pagination = 
                RentAvailableResponseDto.PaginationInfo.from(rentPage);
        
        return RentAvailableResponseDto.success(books, pagination);
    }
}
