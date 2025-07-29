package com.bookbook.domain.lendList.service;

import com.bookbook.domain.lendList.dto.LendListResponseDto;
import com.bookbook.domain.lendList.repository.LendListRepository;
import com.bookbook.domain.rent.entity.Rent;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LendListService {
    
    private final LendListRepository lendListRepository;
    
    public Page<LendListResponseDto> getLendListByUserId(Long userId, Pageable pageable) {
        Page<Rent> rentPage = lendListRepository.findByLenderUserId(userId, pageable);
        return rentPage.map(LendListResponseDto::from);
    }
    
    public List<LendListResponseDto> getAllLendListByUserId(Long userId) {
        List<Rent> rentList = lendListRepository.findByLenderUserId(userId);
        return rentList.stream()
                .map(LendListResponseDto::from)
                .collect(Collectors.toList());
    }
    
    public Page<LendListResponseDto> getLendListByUserIdAndStatus(Long userId, String status, Pageable pageable) {
        Page<Rent> rentPage = lendListRepository.findByLenderUserIdAndRentStatus(userId, status, pageable);
        return rentPage.map(LendListResponseDto::from);
    }
}