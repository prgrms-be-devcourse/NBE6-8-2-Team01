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
        Long closerId,
        @NonNull String reason,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull LocalDateTime reviewedDate
){
    public static ReportDetailResponseDto from(Report report){
        Long closerId = report.getCloser() == null
                ? null
                : report.getCloser().getId();

        return ReportDetailResponseDto.builder()
                .id(report.getId())
                .status(report.getStatus())
                .reporterUserId(report.getReporterUser().getId())
                .targetUserId(report.getTargetUser().getId())
                .closerId(closerId)
                .reason(report.getReason())
                .createdDate(report.getCreatedDate())
                .modifiedDate(report.getModifiedDate())
                .reviewedDate(report.getReviewedDate())
                .build();
    }


}
