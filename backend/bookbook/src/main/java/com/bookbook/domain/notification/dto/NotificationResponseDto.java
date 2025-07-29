package com.bookbook.domain.notification.dto;

import com.bookbook.domain.notification.entity.Notification;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
public class NotificationResponseDto {
    private Long id;
    private String message;
    private String time;
    private boolean read;
    private String bookTitle;
    private String detailMessage;
    private String imageUrl;
    private String requester;

    public static NotificationResponseDto from(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getTitle()); // enum에서 가져온 기본 메시지
        dto.setTime(formatTime(notification.getCreateAt()));
        dto.setRead(notification.getIsRead());
        dto.setBookTitle(notification.getBookTitle());
        dto.setDetailMessage(notification.getMessage()); // 상세 메시지
        dto.setImageUrl(notification.getBookImageUrl());
        dto.setRequester(notification.getSender() != null ? notification.getSender().getNickname() : "시스템");
        return dto;
    }

    // 시간 포맷팅 (3시간 전, 1일 전 등)
    private static String formatTime(LocalDateTime createAt) {
        LocalDateTime now = LocalDateTime.now();
        long hours = ChronoUnit.HOURS.between(createAt, now);
        long days = ChronoUnit.DAYS.between(createAt, now);

        if (hours < 1) {
            long minutes = ChronoUnit.MINUTES.between(createAt, now);
            return minutes + "분 전";
        } else if (hours < 24) {
            return hours + "시간 전";
        } else if (days < 7) {
            return days + "일 전";
        } else {
            return createAt.format(DateTimeFormatter.ofPattern("MM-dd"));
        }
    }
}