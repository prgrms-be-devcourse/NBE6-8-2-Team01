package com.bookbook.domain.chat.entity;

import com.bookbook.domain.chat.enums.MessageType;
import com.bookbook.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chat_message")
public class ChatMessage extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private String roomId; // 채팅방 ID
    
    @Column(nullable = false)
    private Integer senderId; // 보낸 사람 ID
    
    @Column(columnDefinition = "TEXT")
    private String content; // 메시지 내용
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType = MessageType.TEXT; // 메시지 타입
    
    @Column(nullable = false)
    private boolean isRead = false; // 읽음 여부
    
    private LocalDateTime readTime; // 읽은 시간
    
    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();
    
    // 메시지 읽음 처리
    public void markAsRead() {
        this.isRead = true;
        this.readTime = LocalDateTime.now();
    }
    
    // 내가 보낸 메시지인지 확인
    public boolean isSentBy(Integer userId) {
        return senderId.equals(userId);
    }
}
