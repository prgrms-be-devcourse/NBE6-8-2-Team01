package com.bookbook.domain.lendList.service;

import com.bookbook.domain.lendList.dto.LendListResponseDto;
import com.bookbook.domain.lendList.repository.LendListRepository;
import com.bookbook.domain.rent.entity.Rent;
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
    
    public Page<LendListResponseDto> getLendListByUserId(Long userId, Pageable pageable) {
        Page<Rent> rentPage = lendListRepository.findByLenderUserId(userId, pageable);
        return rentPage.map(LendListResponseDto::from);
    }
}