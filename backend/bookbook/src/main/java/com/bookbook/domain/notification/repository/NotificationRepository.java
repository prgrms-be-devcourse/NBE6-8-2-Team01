package com.bookbook.domain.notification.repository;

import com.bookbook.domain.notification.entity.Notification;
import com.bookbook.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 사용자별 알림 조회 (최신순)
    List<Notification> findByReceiverOrderByCreateAtDesc(User receiver);

    // 사용자별 읽지 않은 알림 개수
    long countByReceiverAndIsReadFalse(User receiver);

    // 사용자별 읽지 않은 알림 조회
    List<Notification> findByReceiverAndIsReadFalseOrderByCreateAtDesc(User receiver);

    // 사용자의 모든 알림을 읽음 처리하는 쿼리
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.receiver = :receiver AND n.isRead = false")
    void markAllAsReadByReceiver(@Param("receiver") User receiver);
}
