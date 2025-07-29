package com.bookbook.domain.lendList.service;

import com.bookbook.domain.lendList.dto.LendListResponseDto;
import com.bookbook.domain.lendList.repository.LendListRepository;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LendListService {
    
    private final LendListRepository lendListRepository;
    private final RentRepository rentRepository;
    
    public Page<LendListResponseDto> getLendListByUserId(Long userId, Pageable pageable) {
        Page<Rent> rentPage = lendListRepository.findByLenderUserId(userId, pageable);
        return rentPage.map(LendListResponseDto::from);
    }
    
    @Transactional
    public void deleteLendList(Long userId, Integer rentId) {
        // 대여 게시글 조회
        Rent rent = rentRepository.findById(rentId)
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + rentId));
        
        // 작성자인지 확인
        if (!rent.getLender_user_id().equals(userId)) {
            throw new IllegalArgumentException("본인이 작성한 게시글만 삭제할 수 있습니다.");
        }
        
        // 현재 대출 중인지 확인
        if ("Loaned".equals(rent.getRent_status())) {
            throw new IllegalStateException("현재 대출 중인 도서는 삭제할 수 없습니다.");
        }
        
        // 삭제 실행
        rentRepository.delete(rent);
    }
}