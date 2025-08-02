package com.bookbook.domain.chat.dto;

import com.bookbook.domain.chat.entity.ChatRoom;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatRoomResponse {
    
    private Integer id;
    private String roomId;
    private Integer rentId;
    private String bookTitle;
    private String bookImage;
    private Integer otherUserId;
    private String otherUserNickname;
    private String otherUserProfileImage;
    private String lastMessage;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastMessageTime;
    
    private Long unreadCount;
    private boolean isActive;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdDate;
    
    public static ChatRoomResponse from(ChatRoom chatRoom, 
                                      String bookTitle, 
                                      String bookImage,
                                      String otherUserNickname, 
                                      String otherUserProfileImage,
                                      Long unreadCount) {
        return ChatRoomResponse.builder()
                .id(chatRoom.getId())
                .roomId(chatRoom.getRoomId())
                .rentId(chatRoom.getRentId())
                .bookTitle(bookTitle)
                .bookImage(bookImage)
                .otherUserId(null) // 컨트롤러에서 설정
                .otherUserNickname(otherUserNickname)
                .otherUserProfileImage(otherUserProfileImage)
                .lastMessage(chatRoom.getLastMessage())
                .lastMessageTime(chatRoom.getLastMessageTime())
                .unreadCount(unreadCount)
                .isActive(chatRoom.isActive())
                .createdDate(chatRoom.getCreatedDate())
                .build();
    }
}
