package com.bookbook.domain.book.enums;

import lombok.Getter;

@Getter
public enum BookStatus {
    AVAILABLE("대여가능"),
    RENTED("대여중"),
    UNAVAILABLE("대여불가"),
    DELETED("삭제됨");
    
    private final String description;
    
    BookStatus(String description) {
        this.description = description;
    }
}
