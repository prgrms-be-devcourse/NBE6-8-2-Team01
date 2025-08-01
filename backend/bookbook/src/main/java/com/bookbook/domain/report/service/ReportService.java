package com.bookbook.domain.report.service;

import com.bookbook.domain.report.dto.ReportRequestDto;
import com.bookbook.domain.report.entity.Report;
import com.bookbook.domain.report.repository.ReportRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public Report createReport(ReportRequestDto requestDto) {
        User reporterUser = userRepository.findById(requestDto.getReporterUserId())
                .orElseThrow(() -> new IllegalArgumentException("신고한 사용자를 찾을 수 없습니다."));

        User targetUser = userRepository.findById(requestDto.getTargetUserId())
                .orElseThrow(() -> new IllegalArgumentException("신고 대상 사용자를 찾을 수 없습니다."));

        Report report = new Report(
                reporterUser,
                targetUser,
                requestDto.getReason()
        );

        return reportRepository.save(report);
    }
}