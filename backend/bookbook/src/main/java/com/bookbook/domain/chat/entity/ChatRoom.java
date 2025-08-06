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
    
    // isActive 필드의 getter/setter 명시적 정의
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    // 나간 사용자들을 표시 (JSON 형태로 저장: {"userId1": "timestamp", "userId2": "timestamp"})
    @Column(columnDefinition = "TEXT")
    private String leftUserIds;
    
    // 사용자별 나간 시간 기록 (userId:timestamp,userId:timestamp 형식)
    @Column(columnDefinition = "TEXT")
    private String userLeftTimes;
    
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
    
    // 사용자가 채팅방을 나간 것으로 표시
    public void markUserAsLeft(Integer userId) {
        LocalDateTime leftTime = LocalDateTime.now();
        
        // leftUserIds 업데이트
        if (leftUserIds == null || leftUserIds.isEmpty()) {
            leftUserIds = userId.toString();
        } else if (!leftUserIds.contains(userId.toString())) {
            leftUserIds += "," + userId;
        }
        
        // 나간 시간 기록
        String timeRecord = userId + ":" + leftTime.toString();
        if (userLeftTimes == null || userLeftTimes.isEmpty()) {
            userLeftTimes = timeRecord;
        } else {
            // 기존 기록 제거 후 새로 추가
            userLeftTimes = removeUserLeftTime(userId) + "," + timeRecord;
            userLeftTimes = userLeftTimes.replaceAll("^,|,$", ""); // 앞뒤 쉼표 제거
        }
    }
    
    // 사용자가 나간 상태인지 확인
    public boolean hasUserLeft(Integer userId) {
        if (leftUserIds == null || leftUserIds.isEmpty()) {
            return false;
        }
        
        String userIdStr = userId.toString();
        String[] leftIds = leftUserIds.split(",");
        
        for (String leftId : leftIds) {
            if (leftId.trim().equals(userIdStr)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 사용자가 나간 시간 가져오기
    public LocalDateTime getUserLeftTime(Integer userId) {
        if (userLeftTimes == null || userLeftTimes.isEmpty()) {
            return null;
        }
        
        String[] records = userLeftTimes.split(",");
        for (String record : records) {
            String[] parts = record.split(":");
            if (parts.length >= 2 && parts[0].equals(userId.toString())) {
                try {
                    // userId:yyyy-MM-ddTHH:mm:ss.nnnnnnnnn 형식에서 시간 부분 추출
                    String timeStr = record.substring(parts[0].length() + 1);
                    return LocalDateTime.parse(timeStr);
                } catch (Exception e) {
                    return null;
                }
            }
        }
        return null;
    }
    
    // 특정 사용자의 나간 시간 기록 제거
    private String removeUserLeftTime(Integer userId) {
        if (userLeftTimes == null || userLeftTimes.isEmpty()) {
            return "";
        }
        
        String[] records = userLeftTimes.split(",");
        StringBuilder result = new StringBuilder();
        
        for (String record : records) {
            if (!record.startsWith(userId + ":")) {
                if (result.length() > 0) {
                    result.append(",");
                }
                result.append(record);
            }
        }
        
        return result.toString();
    }
    
    // 사용자가 채팅방에 다시 들어올 때 나간 상태 해제
    public void rejoinUser(Integer userId) {
        if (hasUserLeft(userId)) {
            String userIdStr = userId.toString();
            String[] leftIds = leftUserIds.split(",");
            StringBuilder newLeftIds = new StringBuilder();
            
            for (String leftId : leftIds) {
                if (!leftId.trim().equals(userIdStr)) {
                    if (newLeftIds.length() > 0) {
                        newLeftIds.append(",");
                    }
                    newLeftIds.append(leftId.trim());
                }
            }
            
            leftUserIds = newLeftIds.length() > 0 ? newLeftIds.toString() : null;
            
            // 나간 시간 기록도 제거
            userLeftTimes = removeUserLeftTime(userId);
            if (userLeftTimes.isEmpty()) {
                userLeftTimes = null;
            }
        }
    }
    
    // 채팅방의 모든 사용자 나간 상태를 안전하게 초기화 (재활성화)
    public void resetUserLeftStatus() {
        this.leftUserIds = null;
        this.userLeftTimes = null;
        this.isActive = true; // setIsActive 대신 직접 필드 설정
    }
    
    // 채팅방이 완전히 비어있는지 확인 (모든 사용자가 나갔는지)
    public boolean isEmpty() {
        return hasUserLeft(lenderId) && hasUserLeft(borrowerId);
    }
    
    // 채팅방에 활성 사용자가 있는지 확인
    public boolean hasActiveUsers() {
        return !hasUserLeft(lenderId) || !hasUserLeft(borrowerId);
    }
}
