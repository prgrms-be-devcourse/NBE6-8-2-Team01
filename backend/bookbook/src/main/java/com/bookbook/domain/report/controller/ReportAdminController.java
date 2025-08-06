package com.bookbook.domain.report.controller;

import com.bookbook.domain.report.dto.response.ReportDetailResponseDto;
import com.bookbook.domain.report.dto.response.ReportSimpleResponseDto;
import com.bookbook.domain.report.enums.ReportStatus;
import com.bookbook.domain.report.service.ReportService;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import com.bookbook.global.util.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
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
@Tag(name = "ReportAdminController", description = "어드민 전용 신고 관리 컨트롤러")
public class ReportAdminController {

    @Lazy
    private final ReportService reportService;

    /**
     * 신고 글 목록을 가져옵니다.
     *
     * <p>페이지 번호와 사이즈의 조합, 그리고 신고 처리 상태와
     * 신고 대상자 ID를 기반으로 필터링된 페이지를 가져올 수 있습니다.
     *
     * @param page 페이지 번호
     * @param size 페이지 당 항목 수
     * @param status 신고처리 상태
     * @param targetUserId 신고 대상자 ID
     * @return 생성된 신고 글 페이지 정보
     */
    @GetMapping
    @Operation(summary = "신고 목록 조회")
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

    /**
     * 신고 글 하나의 상세 정보를 가져옵니다.
     *
     * @param reportId 신고 글 ID
     * @return 단일 신고 글 상세 정보
     */
    @GetMapping("/{reportId}/review")
    @Operation(summary = "단일 신고 상세 조회")
    public ResponseEntity<RsData<ReportDetailResponseDto>> getReportDetail(@PathVariable long reportId) {
        ReportDetailResponseDto reportDetail = reportService.getReportDetail(reportId);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%d번 신고글 조회 완료".formatted(reportDetail.id()),
                        reportDetail
                )
        );
    }

    /**
     * 신고 글 하나를 처리 완료 상태로 변경합니다.
     *
     * @param reportId 신고 글 ID
     */
    @PatchMapping("/{reportId}/process")
    @Operation(summary = "단일 신고 처리 완료")
    public ResponseEntity<RsData<Void>> processReport(
            @PathVariable long reportId,
            @AuthenticationPrincipal CustomOAuth2User adminUser
    ) {
        reportService.markReportAsProcessed(reportId, adminUser.getUserId());

        return ResponseEntity.ok(RsData.of("200-1", "%d번 신고가 정상적으로 처리되었습니다.".formatted(reportId)));
    }
}
