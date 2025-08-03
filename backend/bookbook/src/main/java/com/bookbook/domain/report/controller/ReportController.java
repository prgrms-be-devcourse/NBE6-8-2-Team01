package com.bookbook.domain.report.controller;

import com.bookbook.domain.report.dto.request.ReportRequestDto;
import com.bookbook.domain.report.service.ReportService;
import com.bookbook.global.exception.ServiceException;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/bookbook/reports")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<RsData<Void>> reportUser(
            @Valid @RequestBody ReportRequestDto requestDto,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null || customOAuth2User.getUserId() == -1L) {
            throw new ServiceException("401-AUTH-INVALID", "로그인 정보가 유효하지 않습니다.");
        }
        Long reporterUserId = customOAuth2User.getUserId();

        reportService.createReport(reporterUserId, requestDto.getTargetUserId(), requestDto.getReason());

        RsData<Void> rsData = RsData.of("200-OK", "신고가 성공적으로 접수되었습니다.");
        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }
}