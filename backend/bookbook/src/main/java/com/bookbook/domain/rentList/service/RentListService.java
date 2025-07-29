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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RentListService {
    
    private final RentListRepository rentListRepository;
    private final UserRepository userRepository;
    private final RentRepository rentRepository;
    
    
    public List<RentListResponseDto> getRentListByUserId(Long borrowerUserId) {
        return rentListRepository.findByBorrowerUserId(borrowerUserId).stream()
                .map(RentListResponseDto::from)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public RentListResponseDto createRentList(Long borrowerUserId, RentListCreateRequestDto request) {
        // User 엔티티 조회; 로그인하지 않은 사용자, 정지된 사용자 등
        User borrowerUser = userRepository.findById(borrowerUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + borrowerUserId));
        
        // Rent 엔티티 조회
        Rent rent = rentRepository.findById(request.getRentId())
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + request.getRentId()));
        
        RentList rentList = new RentList();
        rentList.setLoanDate(request.getLoanDate());
        // returnDate는 loanDate로부터 14일 후로 자동 계산
        rentList.setReturnDate(request.getLoanDate().plusDays(14));
        // 연관관계 설정
        rentList.setBorrowerUser(borrowerUser);
        rentList.setRent(rent);
        
        RentList savedRentList = rentListRepository.save(rentList);
        return RentListResponseDto.from(savedRentList);
    }
}