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
    
    @JsonProperty("rentId")
    private Long rentId; // rent ID 추가

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
        dto.setRentId(notification.getRelatedId()); // rent ID 추가 👈 새로 추가된 부분
        return dto;
    }

    // 이미지 URL 포맷팅 - 디버깅 로그 추가
    private static String formatImageUrl(String imageUrl) {
        System.out.println("🖼️ formatImageUrl 호출 - 원본 URL: " + imageUrl);
        
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            System.out.println("❌ 이미지 URL이 null 또는 빈 문자열");
            return ""; // 빈 문자열로 반환 - 프론트엔드에서 placeholder 처리
        }
        
        String trimmedUrl = imageUrl.trim();
        String result;
        
        // 이미 완전한 URL인 경우 그대로 반환
        if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
            result = trimmedUrl;
            System.out.println("✅ 완전한 URL - 그대로 사용: " + result);
        }
        // 절대 경로 처리
        else if (trimmedUrl.startsWith("/")) {
            result = "http://localhost:8080" + trimmedUrl;
            System.out.println("🔧 절대경로 변환: " + result);
        }
        // 상대 경로 처리 - uploads 폴더 확인
        else if (trimmedUrl.startsWith("uploads/")) {
            result = "http://localhost:8080/" + trimmedUrl;
            System.out.println("🔧 uploads 경로 변환: " + result);
        }
        // 파일명만 있는 경우 uploads 폴더에서 찾기
        else {
            result = "http://localhost:8080/uploads/" + trimmedUrl;
            System.out.println("🔧 파일명만 있음 - uploads 폴더에서 찾기: " + result);
        }
        
        return result;
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