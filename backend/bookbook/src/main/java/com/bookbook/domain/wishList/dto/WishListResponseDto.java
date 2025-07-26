package com.bookbook.domain.wishList.dto;

import com.bookbook.domain.wishList.entity.WishList;

import java.time.LocalDateTime;

public record WishListResponseDto(
        Long id,
        // TODO: Rent 엔티티 구현 후 주석 해제
        // Long rentId,
        // String bookTitle,
        // String bookAuthor,
        // String bookPublisher,
        // String bookCondition,
        // String rentStatus,
        // Long lenderUserId,
        LocalDateTime createDate
) {
    public static WishListResponseDto from(WishList wishList) {
        // TODO: Rent 엔티티 구현 후 수정
        return new WishListResponseDto(
                wishList.getId(),
                // wishList.getRent().getId(),
                // wishList.getRent().getTitle(),
                // wishList.getRent().getAuthor(),
                // wishList.getRent().getPublisher(),
                // wishList.getRent().getBookCondition(),
                // wishList.getRent().getBookStatus(),
                // wishList.getRent().getUser().getId(),
                wishList.getCreateDate()
        );
    }
}
