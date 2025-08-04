package com.bookbook.domain.report.service;

import com.bookbook.domain.report.dto.response.ReportDetailResponseDto;
import com.bookbook.domain.report.dto.response.ReportSimpleResponseDto;
import com.bookbook.domain.report.entity.Report;
import com.bookbook.domain.report.enums.ReportStatus;
import com.bookbook.domain.report.repository.ReportRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createReport(Long reporterUserId, Long targetUserId, String reason) {
        if (reporterUserId.equals(targetUserId)) {
            throw new ServiceException("400-REPORT-SELF", "자기 자신을 신고할 수 없습니다.");
        }

        User reporterUser = userRepository.findById(reporterUserId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "신고한 사용자를 찾을 수 없습니다."));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "신고 대상 사용자를 찾을 수 없습니다."));

        Report report = new Report(
                reporterUser,
                targetUser,
                reason
        );

        reportRepository.save(report);
    }

    public Page<ReportSimpleResponseDto> getReportPage(
            Pageable pageable,
            List<ReportStatus> status,
            Long targetUserId
    ) {
        return reportRepository
                .findFilteredReportHistory(pageable, status, targetUserId)
                .map(ReportSimpleResponseDto::from);
    }

    @Transactional
    public ReportDetailResponseDto getReportDetail(Long reportId) {
        Report report = findReportById(reportId);

        report.markAsReviewed();

        return ReportDetailResponseDto.from(report);
    }

    @Transactional
    public void markReportAsProcessed(Long reportId, Long userId) {
        Report report = findReportById(reportId);

        ReportStatus status = report.getStatus();

        if (status == ReportStatus.PENDING) {
            throw new ServiceException("422-1", "해당 신고를 먼저 확인해야 합니다.");
        }

        if (status == ReportStatus.PROCESSED) {
            throw new ServiceException("409-1", "해당 신고는 이미 처리가 완료되었습니다.");
        }

        User closerAdmin = findAdminById(userId);
        // 신고 이슈를 닫은 사람을 표기할 수 있도록
        report.markAsProcessed(closerAdmin);
    }

    private User findAdminById(Long adminId) {
        return userRepository.findById(adminId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 어드민 유저입니다."));
    }

    private Report findReportById(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 신고입니다."));
    }
}