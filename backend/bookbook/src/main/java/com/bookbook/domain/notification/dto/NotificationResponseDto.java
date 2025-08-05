package com.bookbook.domain.notification.dto;

import com.bookbook.domain.notification.entity.Notification;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
public class NotificationResponseDto {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("time")
    private String time;
    
    @JsonProperty("read")
    private boolean read;
    
    @JsonProperty("bookTitle")
    private String bookTitle;
    
    @JsonProperty("detailMessage")
    private String detailMessage;
    
    @JsonProperty("imageUrl")
    private String imageUrl;
    
    @JsonProperty("requester")
    private String requester;
    
    @JsonProperty("type")
    private String type;

    public static NotificationResponseDto from(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getTitle()); // enum에서 가져온 기본 메시지
        dto.setTime(formatTime(notification.getCreateAt()));
        dto.setRead(notification.getIsRead());
        dto.setBookTitle(notification.getBookTitle() != null ? notification.getBookTitle() : "");
        dto.setDetailMessage(notification.getMessage() != null ? notification.getMessage() : ""); // 상세 메시지
        dto.setImageUrl(formatImageUrl(notification.getBookImageUrl())); // 이미지 URL 포맷팅
        dto.setRequester(notification.getSender() != null ? notification.getSender().getNickname() : "시스템");
        dto.setType(notification.getType().name()); // 알림 타입 추가
        return dto;
    }

    // 이미지 URL 포맷팅 (홈 페이지와 동일한 방식)
    private static String formatImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return "";
        }
        
        // 이미 완전한 URL인 경우 그대로 반환
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        
        // 상대 경로인 경우 절대 경로로 변환
        if (imageUrl.startsWith("/uploads/")) {
            return "http://localhost:8080" + imageUrl;
        }
        
        // uploads/ 경로가 없는 경우 추가
        if (!imageUrl.startsWith("/")) {
            return "http://localhost:8080/uploads/" + imageUrl;
        }
        
        return "http://localhost:8080" + imageUrl;
    }

    // 시간 포맷팅 (3시간 전, 1일 전 등)
    private static String formatTime(LocalDateTime createAt) {
        if (createAt == null) {
            return "알 수 없음";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long hours = ChronoUnit.HOURS.between(createAt, now);
        long days = ChronoUnit.DAYS.between(createAt, now);

        if (hours < 1) {
            long minutes = ChronoUnit.MINUTES.between(createAt, now);
            return Math.max(1, minutes) + "분 전";
        } else if (hours < 24) {
            return hours + "시간 전";
        } else if (days < 7) {
            return days + "일 전";
        } else {
            return createAt.format(DateTimeFormatter.ofPattern("MM-dd"));
        }
    }
}