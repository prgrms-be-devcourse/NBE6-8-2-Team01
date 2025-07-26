package com.bookbook.domain.wishList.service;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.wishList.dto.WishListResponseDto;
import com.bookbook.domain.wishList.repository.WishListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishListService {

    private final WishListRepository wishListRepository;

    public List<WishListResponseDto> getWishListByUserId(Long userId) {
        return wishListRepository.findByUserIdOrderByCreateDateDesc(userId)
                .stream()
                .map(WishListResponseDto::from)
                .toList();
    }
}
