package com.bookbook.domain.rentList.service;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.rentList.dto.RentListCreateRequestDto;
import com.bookbook.domain.rentList.dto.RentListResponseDto;
import com.bookbook.domain.rentList.entity.RentList;
import com.bookbook.domain.rentList.repository.RentListRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 내가 빌린 도서 목록 관리 서비스
 * 
 * 사용자의 도서 대여 신청, 대여 목록 조회 등의 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RentListService {
    
    private final RentListRepository rentListRepository;
    private final UserRepository userRepository;
    private final RentRepository rentRepository;
    
    /**
     * 사용자가 대여한 도서 목록 조회
     * 
     * @param borrowerUserId 대여받은 사용자 ID
     * @return 대여한 도서 목록
     */
    public List<RentListResponseDto> getRentListByUserId(Long borrowerUserId) {
        return rentListRepository.findByBorrowerUserId(borrowerUserId).stream()
                .map(rentList -> {
                    String lenderNickname = userRepository.findById(rentList.getRent().getLenderUserId())
                            .map(user -> user.getNickname())
                            .orElse("알 수 없음");
                    return RentListResponseDto.from(rentList, lenderNickname);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자가 대여한 도서 목록 검색
     * 
     * @param borrowerUserId 대여받은 사용자 ID
     * @param searchKeyword 검색어 (책 제목, 저자, 출판사, 게시글 제목에서 검색)
     * @return 검색된 대여한 도서 목록
     */
    public List<RentListResponseDto> searchRentListByUserId(Long borrowerUserId, String searchKeyword) {
        List<RentList> rentLists = rentListRepository.findByBorrowerUserId(borrowerUserId);
        
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            return rentLists.stream()
                    .map(rentList -> {
                        String lenderNickname = userRepository.findById(rentList.getRent().getLenderUserId())
                                .map(user -> user.getNickname())
                                .orElse("알 수 없음");
                        return RentListResponseDto.from(rentList, lenderNickname);
                    })
                    .collect(Collectors.toList());
        }
        
        String searchLower = searchKeyword.toLowerCase().trim();
        
        return rentLists.stream()
                .filter(rentList -> {
                    Rent rent = rentList.getRent();
                    return rent.getBookTitle().toLowerCase().contains(searchLower) ||
                           rent.getAuthor().toLowerCase().contains(searchLower) ||
                           rent.getPublisher().toLowerCase().contains(searchLower) ||
                           rent.getTitle().toLowerCase().contains(searchLower);
                })
                .map(rentList -> {
                    String lenderNickname = userRepository.findById(rentList.getRent().getLenderUserId())
                            .map(user -> user.getNickname())
                            .orElse("알 수 없음");
                    return RentListResponseDto.from(rentList, lenderNickname);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 도서 대여 신청 등록
     * 
     * 사용자가 원하는 도서에 대해 대여 신청을 등록합니다.
     * 반납일은 대여일로부터 자동으로 14일 후로 설정됩니다.
     * 
     * @param borrowerUserId 대여받을 사용자 ID
     * @param request 대여 신청 정보
     * @return 생성된 대여 기록 정보
     * @throws IllegalArgumentException 사용자나 게시글을 찾을 수 없는 경우
     */
    @Transactional
    public void createRentList(Long borrowerUserId, RentListCreateRequestDto request) {
        // User 엔티티 조회; 로그인하지 않은 사용자, 정지된 사용자 등
        User borrowerUser = userRepository.findById(borrowerUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + borrowerUserId));
        
        // Rent 엔티티 조회
        Rent rent = rentRepository.findById(request.getRentId())
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + request.getRentId()));
        
        // 새로운 대여 기록 객체 생성
        RentList rentList = new RentList();
        
        // 대여일 설정 - 요청에서 받은 날짜 (사용자가 언제부터 빌릴지 지정)
        rentList.setLoanDate(request.getLoanDate());
        
        // 반납일 자동 계산 - 대여일로부터 14일 후
        // plusDays(14): LocalDateTime에 14일을 더하는 메서드
        rentList.setReturnDate(request.getLoanDate().plusDays(14));
        // 연관관계 설정
        rentList.setBorrowerUser(borrowerUser);
        rentList.setRent(rent);

        RentList savedRentList = rentListRepository.save(rentList);
    }
}