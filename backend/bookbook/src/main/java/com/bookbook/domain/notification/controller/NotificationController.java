package com.bookbook.domain.notification.controller;

import com.bookbook.domain.notification.dto.NotificationResponseDto;
import com.bookbook.domain.notification.enums.NotificationType;
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
    @GetMapping(produces = "application/json")
    @Operation(summary = "사용자 알림 조회", description = "현재 로그인한 사용자의 모든 알림을 최신순으로 조회합니다.")
    public RsData<List<NotificationResponseDto>> getNotifications(
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        log.info("===== 알림 조회 API 호출됨 =====");

        // 로그인하지 않은 경우
        if (customOAuth2User == null) {
            log.warn("customOAuth2User가 null입니다.");
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        if (customOAuth2User.getUserId() == null) {
            log.warn("customOAuth2User.getUserId()가 null입니다.");
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        log.info("사용자 알림 조회 요청: 사용자 ID = {}, 사용자명 = {}",
                customOAuth2User.getUserId(), customOAuth2User.getUsername());

        try {
            // CustomOAuth2User에서 실제 User 엔티티를 조회
            User user = userService.findById(customOAuth2User.getUserId());
            if (user == null) {
                log.error("사용자 ID {}에 해당하는 사용자를 찾을 수 없습니다.", customOAuth2User.getUserId());
                return new RsData<>("404-1", "사용자 정보를 찾을 수 없습니다.", null);
            }

            log.info("사용자 조회 성공: {}", user.getNickname());

            List<NotificationResponseDto> notifications = notificationService.getNotificationsByUser(user);
            log.info("알림 조회 성공: {} 개의 알림 반환", notifications.size());

            RsData<List<NotificationResponseDto>> response = new RsData<>("200-1", "알림 목록을 조회했습니다.", notifications);
            log.info("응답 데이터 생성 완료: resultCode={}, dataSize={}", response.getResultCode(), notifications.size());

            return response;
        } catch (Exception e) {
            log.error("알림 조회 중 오류 발생: {}", e.getMessage(), e);
            return new RsData<>("500-1", "알림 조회 중 오류가 발생했습니다.", null);
        }
    }

    @Transactional(readOnly = true)
    @GetMapping(value = "/unread-count", produces = "application/json")
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
    @PatchMapping(value = "/{id}/read", produces = "application/json")
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
    @PatchMapping(value = "/read-all", produces = "application/json")
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
    @DeleteMapping(value = "/{id}", produces = "application/json")
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

    // 개발용 간단한 테스트 API
    @GetMapping(value = "/test", produces = "application/json")
    @Operation(summary = "[테스트용] 연결 테스트", description = "API 연결 테스트용")
    public RsData<String> testConnection() {
        log.info("테스트 API 호출됨");
        return RsData.of("200-1", "연결 성공", "Hello from backend!");
    }

    // 개발용 스키마 업데이트 API
    @PostMapping(value = "/update-schema", produces = "application/json")
    @Operation(summary = "[테스트용] 스키마 업데이트", description = "NotificationType에 POST_CREATED 추가")
    public RsData<String> updateSchema() {
        log.info("스키마 업데이트 API 호출됨");
        try {
            // 실제로는 @Sql 또는 Flyway를 사용해야 하지만, 개발용으로 간단히 처리
            return RsData.of("200-1", "스키마 업데이트가 필요합니다. H2 콘솔에서 수동으로 실행해주세요.",
                    "ALTER TABLE notification DROP CONSTRAINT IF EXISTS notification_type_check; " +
                            "ALTER TABLE notification ADD CONSTRAINT notification_type_check CHECK (type IN ('RENT_REQUEST', 'RETURN_REMINDER', 'WISHLIST_AVAILABLE', 'POST_CREATED'));");
        } catch (Exception e) {
            log.error("스키마 업데이트 실패: {}", e.getMessage());
            return RsData.of("500-1", "스키마 업데이트 실패: " + e.getMessage());
        }
    }

    // 개발용 알림 강제 생성 API
    @PostMapping(value = "/create-test-notification", produces = "application/json")
    @Operation(summary = "[테스트용] 테스트 알림 생성", description = "현재 로그인한 사용자에게 테스트 알림 생성")
    public RsData<String> createTestNotification(
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
            notificationService.createNotification(
                    user,
                    null,
                    NotificationType.RENT_REQUEST,
                    "테스트 알림입니다 - 글 등록 성공!",
                    "테스트 도서",
                    "https://image.yes24.com/goods/11681152/XL",
                    999L
            );
            log.info("테스트 알림 생성 성공 - 사용자 ID: {}", user.getId());
            return RsData.of("200-1", "테스트 알림이 생성되었습니다.");
        } catch (Exception e) {
            log.error("테스트 알림 생성 실패: {}", e.getMessage());
            return RsData.of("500-1", "테스트 알림 생성 실패: " + e.getMessage());
        }
    }
    
    /**
     * 대여 신청에 대한 상세 정보 조회
     * 
     * @param id 알림 ID
     * @param customOAuth2User 현재 로그인한 사용자
     * @return 대여 신청 상세 정보
     */
    @GetMapping("/{id}/rent-request-detail")
    @Operation(summary = "대여 신청 상세 정보 조회", description = "알림의 대여 신청에 대한 상세 정보를 조회합니다.")
    public RsData<Object> getRentRequestDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        log.info("===== 대여 신청 상세 정보 조회 API 호출 - 알림 ID: {} =====", id);
        
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            log.warn("인증되지 않은 사용자의 접근 시도");
            return new RsData<>("401-1", "로그인 후 사용해주세요.", null);
        }

        User user = userService.findById(customOAuth2User.getUserId());
        if (user == null) {
            log.error("사용자 ID {}에 해당하는 사용자를 찾을 수 없습니다.", customOAuth2User.getUserId());
            return new RsData<>("404-1", "사용자 정보를 찾을 수 없습니다.", null);
        }

        try {
            Object detail = notificationService.getRentRequestDetail(id, user);
            log.info("대여 신청 상세 정보 조회 성공 - 알림 ID: {}, 응답 데이터: {}", id, detail);
            return RsData.of("200-1", "대여 신청 상세 정보를 조회했습니다.", detail);
        } catch (RuntimeException e) {
            log.error("대여 신청 상세 정보 조회 실패 - 알림 ID: {}, 오류: {}", id, e.getMessage(), e);
            return RsData.of("400-1", e.getMessage(), null);
        }
    }
}
