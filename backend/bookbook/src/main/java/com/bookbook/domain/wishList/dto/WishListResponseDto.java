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
        LocalDateTime createDate
) {
    public static WishListResponseDto from(WishList wishList) {
        return new WishListResponseDto(
                wishList.getId(),
                wishList.getRent().getId(),
                wishList.getRent().getTitle(),
                wishList.getRent().getBookTitle(),
                wishList.getRent().getAuthor(),
                wishList.getRent().getPublisher(),
                wishList.getRent().getBookCondition(),
                wishList.getRent().getRent_status(),
                wishList.getRent().getBookImage(),
                wishList.getCreateDate()
        );
    }
}
