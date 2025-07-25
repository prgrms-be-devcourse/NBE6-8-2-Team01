package com.bookbook.domain.wishList.dto;

import com.bookbook.domain.wishList.entity.WishList;

import java.time.LocalDateTime;

public record WishListResponseDto(
        Long id,
        Long rentId,
        String bookTitle,
        String bookAuthor,
        String bookCondition,
        String bookStatus,
        LocalDateTime createDate
) {
    public static WishListResponseDto from(WishList wishList) {
        return new WishListResponseDto(
                wishList.getId(),
                wishList.getRent().getId(),
                wishList.getRent().getBookTitle(),
                wishList.getRent().getBookAuthor(),
                wishList.getRent().getUser().getName(),
                wishList.getCreateDate()
        );
    }
}
