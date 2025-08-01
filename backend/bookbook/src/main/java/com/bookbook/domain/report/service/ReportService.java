package com.bookbook.domain.report.service;

import com.bookbook.domain.report.entity.Report;
import com.bookbook.domain.report.repository.ReportRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}