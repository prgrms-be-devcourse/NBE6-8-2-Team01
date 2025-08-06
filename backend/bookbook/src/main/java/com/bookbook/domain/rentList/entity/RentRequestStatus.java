package com.bookbook.domain.rentList.entity;

/**
 * 대여 신청 상태
 */
public enum RentRequestStatus {
    PENDING("대기 중"),      // 신청 후 대기 상태
    APPROVED("수락됨"),     // 수락된 상태 (실제 대여 시작)
    REJECTED("거절됨"),     // 거절된 상태
    FINISHED("반납완료");   // 반납 완료 상태

    private final String description;

    RentRequestStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
