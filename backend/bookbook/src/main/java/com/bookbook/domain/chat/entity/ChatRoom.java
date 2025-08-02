package com.bookbook.domain.chat.entity;

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
@Table(name = "chat_room")
public class ChatRoom extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(unique = true, nullable = false)
    private String roomId; // UUID 형태의 채팅방 고유 ID
    
    @Column(nullable = false)
    private Integer rentId; // 대여 게시글 ID
    
    @Column(nullable = false)
    private Integer lenderId; // 빌려주는 사람 ID
    
    @Column(nullable = false)
    private Integer borrowerId; // 빌리는 사람 ID
    
    @Column(nullable = false)
    private boolean isActive = true; // 채팅방 활성화 상태
    
    private LocalDateTime lastMessageTime; // 마지막 메시지 시간
    
    private String lastMessage; // 마지막 메시지 내용
    
    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();
    
    // 채팅방이 특정 사용자에게 속하는지 확인
    public boolean belongsToUser(Integer userId) {
        return lenderId.equals(userId) || borrowerId.equals(userId);
    }
    
    // 상대방 ID 가져오기
    public Integer getOtherUserId(Integer currentUserId) {
        return lenderId.equals(currentUserId) ? borrowerId : lenderId;
    }
    
    // 마지막 메시지 업데이트
    public void updateLastMessage(String message, LocalDateTime messageTime) {
        this.lastMessage = message;
        this.lastMessageTime = messageTime;
    }
}
