package com.bookbook.domain.report.dto.response;


import com.bookbook.domain.report.entity.Report;
import com.bookbook.domain.report.enums.ReportStatus;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record ReportSimpleResponseDto(
        @NonNull Long id,
        @NonNull ReportStatus status,
        @NonNull Long reporterUserId,
        @NonNull Long targetUserId,
        @NonNull LocalDateTime createdDate,
        Long reviewerId
){
    public static ReportSimpleResponseDto from(Report report){
        Long reviewerID = report.getReviewer() == null
                ? null
                : report.getReviewer().getId();

        return ReportSimpleResponseDto.builder()
                .id(report.getId())
                .status(report.getStatus())
                .reporterUserId(report.getReporterUser().getId())
                .targetUserId(report.getTargetUser().getId())
                .createdDate(report.getCreatedDate())
                .reviewerId(reviewerID)
                .build();
    }
}
