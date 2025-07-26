package com.bookbook.domain.wishList.controller;

import com.bookbook.domain.wishList.dto.WishListResponseDto;
import com.bookbook.domain.wishList.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookbook/wishList")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;

    @GetMapping
    public ResponseEntity<List<WishListResponseDto>> getWishList(
            @RequestParam Long userId
    ) {
        List<WishListResponseDto> wishList = wishListService.getWishListByUserId(userId);
        return ResponseEntity.ok(wishList);
    }
}
