package com.bookbook.domain.report.dto.response;


import com.bookbook.domain.report.entity.Report;
import com.bookbook.domain.report.enums.ReportStatus;
import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDateTime;

@Builder
public record ReportDetailResponseDto(
        @NonNull Long id,
        @NonNull ReportStatus status,
        @NonNull Long reporterUserId,
        @NonNull Long targetUserId,
        @NonNull Long reviewerId,
        @NonNull String reason,
        @NonNull LocalDateTime reportedDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull LocalDateTime reviewedDate
){
    public static ReportDetailResponseDto from(Report report){
        return ReportDetailResponseDto.builder()
                .id(report.getId())
                .status(report.getStatus())
                .reporterUserId(report.getReporterUser().getId())
                .targetUserId(report.getTargetUser().getId())
                .reviewerId(report.getReviewer().getId())
                .reason(report.getReason())
                .reportedDate(report.getCreatedDate())
                .modifiedDate(report.getModifiedDate())
                .reviewedDate(report.getReviewedDate())
                .build();
    }


}
