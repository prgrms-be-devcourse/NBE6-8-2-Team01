package com.bookbook.domain.report.service;

import com.bookbook.domain.report.dto.response.ReportDetailResponseDto;
import com.bookbook.domain.report.dto.response.ReportSimpleResponseDto;
import com.bookbook.domain.report.entity.Report;
import com.bookbook.domain.report.enums.ReportStatus;
import com.bookbook.domain.report.repository.ReportRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.user.service.UserService;
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
    private final UserService userService;

    /**
     * 신고글을 생성합니다.
     *
     * @param reporterUserId 페이지 기본 정보
     * @param targetUserId 대여 글 상태의 리스트
     * @param reason 신고 대상자 ID
     * @throws ServiceException
     * <p>(400) 신고자 본인을 신고하려고 할 때
     * <p>(404) 신고와 관련한 유저를 찾지 못했을 때
     */
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

    /**
     * 대여 글을 페이지로 가져옵니다.
     *
     * @param pageable 페이지 기본 정보
     * @param status 대여 글 상태의 리스트
     * @param targetUserId 신고 대상자 ID
     * @return 생성된 신고 글 페이지 정보
     */
    @Transactional(readOnly = true)
    public Page<ReportSimpleResponseDto> getReportPage(
            Pageable pageable,
            List<ReportStatus> status,
            Long targetUserId
    ) {
        return reportRepository
                .findFilteredReportHistory(pageable, status, targetUserId)
                .map(ReportSimpleResponseDto::from);
    }

    /**
     * 신고 글 하나의 상세 정보를 가져옵니다.
     * <p>관리자가 최초로 상세 정보를 요청하면 자동으로 검토 중 상태로 변경됩니다
     *
     * @param reportId 신고 글 ID
     * @return 단일 신고 글 상세 정보
     * @throws ServiceException (404) 신고 글이 존재하지 않은 경우
     */
    @Transactional
    public ReportDetailResponseDto getReportDetail(long reportId) {
        Report report = findReportById(reportId);

        if (report.getStatus() ==  ReportStatus.PENDING) {
            report.markAsReviewed();
        }

        return ReportDetailResponseDto.from(report);
    }

    /**
     * 신고 글 하나를 처리 완료 상태로 변경합니다.
     *
     * @param reportId 신고 글 ID
     * @param userId 처리 완료를 진행한 자의 ID
     * @throws ServiceException
     * <p>(409) 처리가 완료된 신고를 다시 처리하고자 할 때
     * <p>(422) 대기 중인 신고를 처리 완료 상태로 바꾸고자 할 때
     */
    @Transactional
    public void markReportAsProcessed(long reportId, long userId) {
        Report report = findReportById(reportId);

        ReportStatus status = report.getStatus();

        if (status == ReportStatus.PENDING) {
            throw new ServiceException("422-1", "해당 신고를 먼저 확인해야 합니다.");
        }

        if (status == ReportStatus.PROCESSED) {
            throw new ServiceException("409-1", "해당 신고는 이미 처리가 완료되었습니다.");
        }

        User closerAdmin = userService.getByIdOrThrow(userId);
        // 신고 이슈를 닫은 사람을 표기할 수 있도록
        report.markAsProcessed(closerAdmin);
    }

    /**
     * 신고 글 하나를 리포지토리에서 검색합니다.
     *
     * @param reportId 신고 글 ID
     * @throws ServiceException (404) 신고 글이 존재하지 않은 경우
     */
    @Transactional(readOnly = true)
    public Report findReportById(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 신고입니다."));
    }
}