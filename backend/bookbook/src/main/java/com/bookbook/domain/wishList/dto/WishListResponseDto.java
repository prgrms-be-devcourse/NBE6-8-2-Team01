package com.bookbook.domain.wishList.dto;

import com.bookbook.domain.wishList.entity.WishList;

import java.time.LocalDateTime;

public record WishListResponseDto(
        Long id,
        Integer rentId,
        String title,
        String bookTitle,
        String author,
        String publisher,
        String bookCondition,
        String rentStatus,
        String bookImage,
        String address,
        String lenderNickname,
        LocalDateTime createDate
) {
    public static WishListResponseDto from(WishList wishList, String lenderNickname) {
        return new WishListResponseDto(
                wishList.getId(),
                wishList.getRent().getId(),
                wishList.getRent().getTitle(),
                wishList.getRent().getBookTitle(),
                wishList.getRent().getAuthor(),
                wishList.getRent().getPublisher(),
                wishList.getRent().getBookCondition(),
                wishList.getRent().getRentStatus().name(),
                wishList.getRent().getBookImage(),
                wishList.getRent().getAddress(),
                lenderNickname,
                wishList.getCreateDate()
        );
    }
}