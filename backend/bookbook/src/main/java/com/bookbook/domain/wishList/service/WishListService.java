package com.bookbook.domain.wishList.service;

import com.bookbook.domain.wishList.repository.WishListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WishListService {

    private final WishListRepository wishListRepository;
}
