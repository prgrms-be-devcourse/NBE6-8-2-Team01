package com.bookbook.domain.chat.dto;

import com.bookbook.domain.chat.entity.ChatMessage;
import com.bookbook.domain.chat.enums.MessageType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    
    private Integer id;
    private String roomId;
    private Integer senderId;
    private String senderNickname;
    private String senderProfileImage;
    private String content;
    private MessageType messageType;
    private boolean isRead;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime readTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdDate;
    
    @JsonProperty("isMine")  // JSON 직렬화 시 필드명 명시
    private boolean isMine; // 내가 보낸 메시지인지 여부
    
    public static MessageResponse from(ChatMessage message, String senderNickname, String senderProfileImage, boolean isMine) {
        return MessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoomId())
                .senderId(message.getSenderId())
                .senderNickname(senderNickname)
                .senderProfileImage(senderProfileImage)
                .content(message.getContent())
                .messageType(message.getMessageType())
                .isRead(message.isRead())
                .readTime(message.getReadTime())
                .createdDate(message.getCreatedDate())
                .isMine(isMine)
                .build();
    }
}
