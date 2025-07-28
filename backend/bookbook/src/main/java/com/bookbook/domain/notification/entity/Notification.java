package com.bookbook.domain.notification.entity;

import com.bookbook.domain.notification.enums.NotificationType;
import com.bookbook.domain.user.entity.User;
import com.bookbook.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Notification extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver; // 알림을 받는 사용자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender; // 알림을 발생시킨 사용자 (요청자)

    @Enumerated(EnumType.STRING)
    private NotificationType type; // 알림 타입

    private String title; // "도서 대여 요청이 도착했어요!"

    private String message; // "대여 부탁드립니다!"

    private String bookTitle; // 관련 도서 제목

    private String bookImageUrl; // 도서 이미지 URL

    private Long relatedId; // 관련 데이터 ID (rent_id, wishlist_id 등)

    @Builder.Default
    private Boolean isRead = false; // 읽음 여부

    @CreatedDate
    private LocalDateTime createAt;

    @LastModifiedDate
    private LocalDateTime updateAt;

    // 읽음 처리 - 예외 없이 자연스럽게 처리
    public void markAsRead() {
        this.isRead = true;
    }

    // 알림 생성 시 기본값 설정
    public static Notification createNotification(User receiver, User sender, NotificationType type, 
                                                String message, String bookTitle, String bookImageUrl, Long relatedId) {
        if (receiver == null) {
            throw new RuntimeException("알림을 받을 사용자가 필요합니다.");
        }
        if (type == null) {
            throw new RuntimeException("알림 타입이 필요합니다.");
        }
        
        return Notification.builder()
                .receiver(receiver)
                .sender(sender)
                .type(type)
                .title(type.getDefaultTitle())
                .message(message)
                .bookTitle(bookTitle)
                .bookImageUrl(bookImageUrl)
                .relatedId(relatedId)
                .isRead(false)
                .build();
    }
}
