package com.bookbook.domain.rent.entity;

// 25.08.04 현준

public enum RentStatus {
    AVAILABLE("대여 가능"), // 대여 가능 상태
    LOANED("대여 중"), // 대여 중 상태
    FINISHED("대여 완료"), // 대여 불가 상태
    DELETED("삭제 됨"); // 삭제된 상태

    private final String enumDescription; // 각 상태에 대한 설명

    RentStatus(String description) {
        this.enumDescription = description;
    }

    public String getDescription() {
        return enumDescription;
    }
}