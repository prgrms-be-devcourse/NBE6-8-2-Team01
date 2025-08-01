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
}
