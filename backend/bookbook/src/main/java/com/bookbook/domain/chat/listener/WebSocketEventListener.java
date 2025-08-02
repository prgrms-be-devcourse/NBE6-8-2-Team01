package com.bookbook.domain.chat.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    
    private final SimpMessageSendingOperations messagingTemplate;
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("새로운 WebSocket 연결이 수신되었습니다");
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        String nickname = (String) headerAccessor.getSessionAttributes().get("nickname");
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        
        if (roomId != null && nickname != null) {
            log.info("사용자 연결 해제 - roomId: {}, userId: {}, nickname: {}", roomId, userId, nickname);
            
            // 선택사항: 사용자 나감 알림을 채팅방에 브로드캐스트
            // messagingTemplate.convertAndSend("/topic/chat/" + roomId, 
            //         nickname + "님이 채팅방을 나갔습니다.");
        }
    }
}
