package com.bookbook.domain.notification.service;

import com.bookbook.domain.notification.dto.NotificationResponseDto;
import com.bookbook.domain.notification.entity.Notification;
import com.bookbook.domain.notification.enums.NotificationType;
import com.bookbook.domain.notification.repository.NotificationRepository;
import com.bookbook.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // 사용자별 알림 조회
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getNotificationsByUser(User user) {
        List<Notification> notifications = notificationRepository.findByReceiverOrderByCreateAtDesc(user);

        return notifications.stream()
                .map(NotificationResponseDto::from)
                .toList();
    }

    // 읽지 않은 알림 개수
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByReceiverAndIsReadFalse(user);
    }

    // 특정 알림 읽음 처리
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 알림입니다. ID: " + notificationId));

        // 본인의 알림인지 확인
        if (!notification.getReceiver().equals(user)) {
            throw new RuntimeException("다른 사용자의 알림에 접근할 수 없습니다.");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    // 모든 알림 읽음 처리
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByReceiver(user);
    }

    // 새 알림 생성 (다른 서비스에서 호출용)
    @Transactional
    public Notification createNotification(User receiver, User sender, NotificationType type,
                                           String message, String bookTitle, String bookImageUrl, Long relatedId) {
        Notification notification = Notification.createNotification(
                receiver, sender, type, message, bookTitle, bookImageUrl, relatedId
        );

        return notificationRepository.save(notification);
    }

    // 알림 삭제
    @Transactional
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 알림입니다. ID: " + notificationId));

        // 본인의 알림인지 확인
        if (!notification.getReceiver().equals(user)) {
            throw new RuntimeException("다른 사용자의 알림을 삭제할 수 없습니다.");
        }

        notificationRepository.delete(notification);
    }

    // 개발용 테스트 데이터 생성
    @Transactional
    public void createTestData(User receiver, User sender) {
        // 기존 알림이 있으면 스킵
        if (notificationRepository.countByReceiverAndIsReadFalse(receiver) > 0) {
            return;
        }
        
        // 1. 읽지 않은 대여 요청 알림
        Notification rentRequest1 = Notification.createNotification(
                receiver, sender, NotificationType.RENT_REQUEST,
                "안녕하세요! 이 책 대여 가능한가요? 깨끗하게 보고 반납하겠습니다.",
                "Clean Code",
                "https://image.yes24.com/goods/11681152/XL",
                1L
        );
        
        Notification rentRequest2 = Notification.createNotification(
                receiver, sender, NotificationType.RENT_REQUEST,
                "이 책 꼭 읽어보고 싶어요. 일주일 정도 빌려주실 수 있나요?",
                "Spring Boot 마스터하기",
                "https://image.yes24.com/goods/76110622/XL",
                2L
        );
        
        // 2. 읽은 위시리스트 알림
        Notification wishlistNotification = Notification.createNotification(
                receiver, null, NotificationType.WISHLIST_AVAILABLE,
                "찜하신 도서가 대여 가능해졌습니다!",
                "리팩토링 2판",
                "https://image.yes24.com/goods/89649360/XL",
                3L
        );
        wishlistNotification.markAsRead(); // 읽음 처리
        
        // 3. 반납 알림
        Notification returnReminder = Notification.createNotification(
                receiver, null, NotificationType.RETURN_REMINDER,
                "대여하신 도서의 반납일이 내일입니다.",
                "자바의 정석",
                "https://image.yes24.com/goods/24259565/XL",
                4L
        );
        
        notificationRepository.save(rentRequest1);
        notificationRepository.save(rentRequest2);
        notificationRepository.save(wishlistNotification);
        notificationRepository.save(returnReminder);
    }
}