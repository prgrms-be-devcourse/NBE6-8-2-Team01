package com.bookbook.domain.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequestDto {

    @NotNull(message = "신고한 사용자의 ID는 필수입니다.")
    private Long reporterUserId;

    @NotNull(message = "신고 대상 사용자의 ID는 필수입니다.")
    private Long targetUserId;

    @NotBlank(message = "신고 사유는 비워둘 수 없습니다.")
    private String reason;
}