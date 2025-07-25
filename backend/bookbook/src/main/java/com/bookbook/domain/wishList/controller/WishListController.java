package com.bookbook.domain.wishList.controller;

import com.bookbook.domain.wishList.entity.WishList;
import com.bookbook.domain.wishList.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bookbook/wishList")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;
}
