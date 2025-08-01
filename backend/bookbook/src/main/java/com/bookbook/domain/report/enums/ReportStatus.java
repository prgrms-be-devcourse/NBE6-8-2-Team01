package com.bookbook.domain.report.enums;

public enum ReportStatus {
    PENDING,    // 처리 대기 중
    REVIEWED,   // 관리자가 검토 완료
    PROCESSED   // 처리 완료 (예: 사용자 정지, 경고 등)
}