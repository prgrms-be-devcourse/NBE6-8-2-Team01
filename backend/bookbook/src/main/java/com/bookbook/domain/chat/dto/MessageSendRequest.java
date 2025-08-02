package com.bookbook.domain.chat.dto;

import com.bookbook.domain.chat.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageSendRequest {
    
    @NotBlank(message = "채팅방 ID는 필수입니다.")
    private String roomId;
    
    @NotBlank(message = "메시지 내용은 필수입니다.")
    private String content;
    
    private MessageType messageType = MessageType.TEXT;
}
