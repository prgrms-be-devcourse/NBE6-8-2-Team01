package com.bookbook.domain.notification.controller;

import com.bookbook.domain.notification.dto.NotificationResponseDto;
import com.bookbook.domain.notification.service.NotificationService;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.service.UserService;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookbook/user/notifications")
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @Transactional(readOnly = true)
    @GetMapping
    @Operation(summary = "사용자 알림 조회", description = "현재 로그인한 사용자의 모든 알림을 최신순으로 조회합니다.")
    public RsData<List<NotificationResponseDto>> getNotifications(
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        // 로그인하지 않은 경우
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            log.warn("인증되지 않은 사용자가 알림 조회를 시도했습니다.");
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        log.debug("사용자 알림 조회 요청: 사용자 ID = {}, 사용자명 = {}",
                customOAuth2User.getUserId(), customOAuth2User.getUsername());

        // CustomOAuth2User에서 실제 User 엔티티를 조회
        User user = userService.findById(customOAuth2User.getUserId());
        if (user == null) {
            log.error("사용자 ID {}에 해당하는 사용자를 찾을 수 없습니다.", customOAuth2User.getUserId());
            return new RsData<>("404-1", "사용자 정보를 찾을 수 없습니다.", null);
        }

        List<NotificationResponseDto> notifications = notificationService.getNotificationsByUser(user);
        return new RsData<>("200-1", "알림 목록을 조회했습니다.", notifications);
    }

    @Transactional(readOnly = true)
    @GetMapping("/unread-count")
    @Operation(summary = "읽지 않은 알림 개수", description = "현재 사용자의 읽지 않은 알림 개수를 조회합니다.")
    public RsData<Long> getUnreadCount(
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        User user = userService.findById(customOAuth2User.getUserId());
        if (user == null) {
            return new RsData<>("404-1", "사용자 정보를 찾을 수 없습니다.", null);
        }

        long count = notificationService.getUnreadCount(user);
        return new RsData<>("200-1", "읽지 않은 알림 개수를 조회했습니다.", count);
    }

    @Transactional
    @PatchMapping("/{id}/read")
    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 상태로 변경합니다.")
    public RsData<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        User user = userService.findById(customOAuth2User.getUserId());
        if (user == null) {
            return new RsData<>("404-1", "사용자 정보를 찾을 수 없습니다.", null);
        }

        try {
            notificationService.markAsRead(id, user);
            return RsData.of("200-1", "알림을 읽음 처리했습니다.");
        } catch (RuntimeException e) {
            log.error("알림 읽음 처리 실패: {}", e.getMessage());
            return RsData.of("400-1", e.getMessage());
        }
    }

    @Transactional
    @PatchMapping("/read-all")
    @Operation(summary = "모든 알림 읽음 처리", description = "사용자의 모든 알림을 읽음 상태로 변경합니다.")
    public RsData<Void> markAllAsRead(
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        User user = userService.findById(customOAuth2User.getUserId());
        if (user == null) {
            return new RsData<>("404-1", "사용자 정보를 찾을 수 없습니다.", null);
        }

        notificationService.markAllAsRead(user);
        return RsData.of("200-1", "모든 알림을 읽음 처리했습니다.");
    }

    @Transactional
    @DeleteMapping("/{id}")
    @Operation(summary = "알림 삭제", description = "특정 알림을 삭제합니다.")
    public RsData<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        User user = userService.findById(customOAuth2User.getUserId());
        if (user == null) {
            return new RsData<>("404-1", "사용자 정보를 찾을 수 없습니다.", null);
        }

        try {
            notificationService.deleteNotification(id, user);
            return RsData.of("200-1", "알림을 삭제했습니다.");
        } catch (RuntimeException e) {
            log.error("알림 삭제 실패: {}", e.getMessage());
            return RsData.of("400-1", e.getMessage());
        }
    }
}
