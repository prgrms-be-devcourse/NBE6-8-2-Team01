package com.bookbook.domain.notification.enums;

import lombok.Getter;

@Getter
public enum NotificationType {
    RENT_REQUEST("📘 도서 대여 요청이 도착했어요!"),
    WISHLIST_AVAILABLE("📕 찜한 도서가 대여 가능해졌습니다"),
    RETURN_REMINDER("📙 도서 반납일이 다가옵니다"),
    POST_CREATED("✅ 글이 등록되었습니다");

    private final String defaultTitle;

    NotificationType(String defaultTitle) {
        this.defaultTitle = defaultTitle;
    }
}