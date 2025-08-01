package com.bookbook.domain.lendList.service;

import com.bookbook.domain.lendList.dto.LendListResponseDto;
import com.bookbook.domain.lendList.repository.LendListRepository;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.rentList.repository.RentListRepository;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 내가 등록한 도서 목록 관리 서비스
 * 
 * 사용자가 등록한 도서 게시글의 조회, 삭제 등의 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LendListService {
    
    private final LendListRepository lendListRepository;
    private final RentRepository rentRepository;
    private final RentListRepository rentListRepository;
    private final UserRepository userRepository;

    /**
     * 사용자가 등록한 도서 목록을 페이징하여 조회
     * 
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 등록한 도서 게시글 페이지
     */
    public Page<LendListResponseDto> getLendListByUserId(Long userId, Pageable pageable) {
        Page<Rent> rentPage = lendListRepository.findByLenderUserId(userId, pageable);
        return rentPage.map(rent -> {
            String borrowerNickname = null;
            if (rent.getRentStatus() == RentStatus.LOANED || rent.getRentStatus() == RentStatus.FINISHED) {
                borrowerNickname = rentListRepository.findByRentId(rent.getId())
                        .stream()
                        .findFirst()
                        .flatMap(rentList -> userRepository.findById(rentList.getBorrowerUser().getId()))
                        .map(user -> user.getNickname())
                        .orElse(null);
            }
            return LendListResponseDto.from(rent, borrowerNickname);
        });
    }
    
    /**
     * 사용자가 등록한 도서 목록을 검색어로 필터링하여 조회
     * 
     * @param userId 사용자 ID
     * @param searchKeyword 검색어 (책 제목, 저자, 출판사, 게시글 제목에서 검색)
     * @param pageable 페이징 정보
     * @return 검색된 등록한 도서 게시글 페이지
     */
    public Page<LendListResponseDto> getLendListByUserIdAndSearch(Long userId, String searchKeyword, Pageable pageable) {
        Page<Rent> rentPage;
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            rentPage = lendListRepository.findByLenderUserId(userId, pageable);
        } else {
            rentPage = lendListRepository.findByLenderUserIdAndSearchKeyword(userId, searchKeyword.trim(), pageable);
        }
        
        return rentPage.map(rent -> {
            String borrowerNickname = null;
            if (rent.getRentStatus() == RentStatus.LOANED || rent.getRentStatus() == RentStatus.FINISHED) {
                borrowerNickname = rentListRepository.findByRentId(rent.getId())
                        .stream()
                        .findFirst()
                        .flatMap(rentList -> userRepository.findById(rentList.getBorrowerUser().getId()))
                        .map(user -> user.getNickname())
                        .orElse(null);
            }
            return LendListResponseDto.from(rent, borrowerNickname);
        });
    }
    
    /**
     * 내가 등록한 도서 게시글 삭제
     * 
     * 본인이 작성한 게시글만 삭제 가능하며, 현재 대출 중인 도서는 삭제할 수 없습니다.
     * 
     * @param userId 사용자 ID (작성자 확인용)
     * @param rentId 삭제할 도서 게시글 ID
     * @throws IllegalArgumentException 게시글을 찾을 수 없거나 작성자가 아닌 경우
     * @throws IllegalStateException 현재 대출 중인 도서인 경우
     */
    @Transactional
    public void deleteLendList(Long userId, Integer rentId) {
        // 대여 게시글 조회
        Rent rent = rentRepository.findById(rentId)
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + rentId));
        
        // 작성자인지 확인
        if (!rent.getLenderUserId().equals(userId)) {
            throw new IllegalArgumentException("본인이 작성한 게시글만 삭제할 수 있습니다.");
        }
        
        // 현재 대출 중인지 확인
        if (rent.getRentStatus() == RentStatus.LOANED) {
            throw new IllegalStateException("현재 대출 중인 도서는 삭제할 수 없습니다.");
        }
        
        // 삭제 실행
        rentRepository.delete(rent);
    }
}