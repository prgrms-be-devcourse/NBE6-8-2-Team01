package com.bookbook.domain.report.controller;

import com.bookbook.domain.report.dto.response.ReportDetailResponseDto;
import com.bookbook.domain.report.dto.response.ReportSimpleResponseDto;
import com.bookbook.domain.report.enums.ReportStatus;
import com.bookbook.domain.report.service.ReportService;
import com.bookbook.domain.user.dto.response.PageResponse;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
public class ReportAdminController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<RsData<PageResponse<ReportSimpleResponseDto>>> getReportPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) List<ReportStatus> status,
            @RequestParam(required = false) Long targetUserId
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<ReportSimpleResponseDto> reportHistoryPage = reportService.getReportPage(pageable, status, targetUserId);
        PageResponse<ReportSimpleResponseDto> response = PageResponse.from(reportHistoryPage, page, size);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%d개의 신고글을 발견했습니다.".formatted(reportHistoryPage.getTotalElements()),
                        response
                )
        );
    }

    @GetMapping("/{reportId}/review")
    public ResponseEntity<RsData<ReportDetailResponseDto>> getReportDetail(@PathVariable Long reportId) {
        ReportDetailResponseDto reportDetail = reportService.getReportDetail(reportId);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%d번 신고글 조회 완료".formatted(reportDetail.id()),
                        reportDetail
                )
        );
    }

    @PatchMapping("/{reportId}/process")
    public ResponseEntity<RsData<Void>> processReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal CustomOAuth2User adminUser
    ) {
        reportService.markReportAsProcessed(reportId, adminUser.getUserId());

        return ResponseEntity.ok(RsData.of("200-1", "%d번 글이 정상적으로 처리되었습니다.".formatted(reportId)));
    }
}
