package com.bookbook.domain.chat.controller;

import com.bookbook.domain.chat.dto.MessageResponse;
import com.bookbook.domain.chat.dto.MessageSendRequest;
import com.bookbook.domain.chat.service.ChatService;
import com.bookbook.global.security.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketChatController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    
    /**
     * 채팅 메시지 전송 (WebSocket)
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageSendRequest request, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // 인증 정보에서 사용자 ID 추출
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof CustomOAuth2User)) {
                log.error("WebSocket 메시지 전송 실패 - 인증되지 않은 사용자");
                return;
            }
            
            CustomOAuth2User user = (CustomOAuth2User) auth.getPrincipal();
            Integer userId = user.getUserId().intValue();
            
            log.info("WebSocket 메시지 전송 - roomId: {}, userId: {}", request.getRoomId(), userId);
            
            // 메시지 저장
            MessageResponse messageResponse = chatService.sendMessage(request, userId);
            
            // 채팅방 구독자들에게 메시지 브로드캐스트
            messagingTemplate.convertAndSend("/topic/chat/" + request.getRoomId(), messageResponse);
            
            log.info("WebSocket 메시지 전송 완료 - messageId: {}", messageResponse.getId());
            
        } catch (Exception e) {
            log.error("WebSocket 메시지 전송 실패", e);
        }
    }
    
    /**
     * 채팅방 입장 (WebSocket)
     */
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload String roomId, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // 인증 정보에서 사용자 정보 추출
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof CustomOAuth2User)) {
                log.error("WebSocket 사용자 입장 실패 - 인증되지 않은 사용자");
                return;
            }
            
            CustomOAuth2User user = (CustomOAuth2User) auth.getPrincipal();
            
            log.info("WebSocket 사용자 입장 - roomId: {}, userId: {}, nickname: {}", 
                    roomId, user.getUserId(), user.getNickname());
            
            // 세션에 사용자 정보 저장
            headerAccessor.getSessionAttributes().put("userId", user.getUserId().intValue());
            headerAccessor.getSessionAttributes().put("roomId", roomId);
            headerAccessor.getSessionAttributes().put("nickname", user.getNickname());
            
        } catch (Exception e) {
            log.error("WebSocket 사용자 입장 실패", e);
        }
    }
    
    /**
     * 메시지 읽음 처리 (WebSocket)
     */
    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload String roomId, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // 인증 정보에서 사용자 ID 추출
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof CustomOAuth2User)) {
                log.error("WebSocket 읽음 처리 실패 - 인증되지 않은 사용자");
                return;
            }
            
            CustomOAuth2User user = (CustomOAuth2User) auth.getPrincipal();
            Integer userId = user.getUserId().intValue();
            
            log.info("WebSocket 읽음 처리 - roomId: {}, userId: {}", roomId, userId);
            
            // 메시지 읽음 처리
            chatService.markMessagesAsRead(roomId, userId);
            
            // 읽음 처리 알림을 채팅방에 브로드캐스트 (선택사항)
            messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/read", 
                    "사용자 " + user.getNickname() + "이(가) 메시지를 읽었습니다.");
            
        } catch (Exception e) {
            log.error("WebSocket 읽음 처리 실패", e);
        }
    }
}
