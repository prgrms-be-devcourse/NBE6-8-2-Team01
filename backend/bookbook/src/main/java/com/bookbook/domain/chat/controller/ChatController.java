package com.bookbook.domain.chat.controller;

import com.bookbook.domain.chat.dto.*;
import com.bookbook.domain.chat.service.ChatService;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookbook/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final ChatService chatService;
    
    /**
     * 채팅방 생성 또는 기존 채팅방 반환
     */
    @PostMapping("/rooms")
    public ResponseEntity<RsData<ChatRoomResponse>> createChatRoom(
            @Valid @RequestBody ChatRoomCreateRequest request,
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        log.info("채팅방 생성 요청 - userId: {}, rentId: {}, lenderId: {}", 
                user.getUserId(), request.getRentId(), request.getLenderId());
        
        try {
            ChatRoomResponse response = chatService.createOrGetChatRoom(request, user.getUserId().intValue());
            return ResponseEntity.ok(RsData.of("200", "채팅방이 생성되었습니다.", response));
        } catch (Exception e) {
            log.error("채팅방 생성 실패", e);
            return ResponseEntity.badRequest()
                    .body(RsData.of("400", e.getMessage(), null));
        }
    }
    
    /**
     * 사용자의 채팅방 목록 조회
     */
    @GetMapping("/rooms")
    public ResponseEntity<RsData<Page<ChatRoomResponse>>> getChatRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        log.info("채팅방 목록 조회 - userId: {}, page: {}, size: {}", user.getUserId(), page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ChatRoomResponse> chatRooms = chatService.getChatRooms(user.getUserId().intValue(), pageable);
            
            return ResponseEntity.ok(RsData.of("200", "채팅방 목록을 조회했습니다.", chatRooms));
        } catch (Exception e) {
            log.error("채팅방 목록 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(RsData.of("500", "채팅방 목록 조회에 실패했습니다.", null));
        }
    }
    
    /**
     * 채팅방 메시지 목록 조회
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<RsData<Page<MessageResponse>>> getChatMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        log.info("🔍 채팅 메시지 조회 요청 - roomId: {}, userId: {}, page: {}, size: {}", 
                roomId, user.getUserId(), page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MessageResponse> messages = chatService.getChatMessages(roomId, user.getUserId().intValue(), pageable);
            
            // 📊 첫 번째 메시지 정보 로그
            if (!messages.isEmpty()) {
                MessageResponse firstMessage = messages.getContent().get(0);
                log.info("📊 첫 번째 메시지 정보 - ID: {}, isMine: {}, senderId: {}, userId: {}, content: '{}'", 
                        firstMessage.getId(), firstMessage.isMine(), firstMessage.getSenderId(), 
                        user.getUserId(), firstMessage.getContent().length() > 20 ? 
                        firstMessage.getContent().substring(0, 20) + "..." : firstMessage.getContent());
            }
            
            log.info("📤 메시지 조회 완료 - 총 {} 개 메시지 반환", messages.getTotalElements());
            
            return ResponseEntity.ok(RsData.of("200", "채팅 메시지를 조회했습니다.", messages));
        } catch (Exception e) {
            log.error("채팅 메시지 조회 실패", e);
            if (e.getMessage().contains("권한이 없습니다")) {
                return ResponseEntity.status(403)
                        .body(RsData.of("403", e.getMessage(), null));
            }
            return ResponseEntity.internalServerError()
                    .body(RsData.of("500", "채팅 메시지 조회에 실패했습니다.", null));
        }
    }
    
    /**
     * 메시지 전송
     */
    @PostMapping("/messages")
    public ResponseEntity<RsData<MessageResponse>> sendMessage(
            @Valid @RequestBody MessageSendRequest request,
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        log.info("🔍 메시지 전송 요청 - roomId: {}, userId: {}, messageType: {}, content: '{}'", 
                request.getRoomId(), user.getUserId(), request.getMessageType(),
                request.getContent().length() > 20 ? request.getContent().substring(0, 20) + "..." : request.getContent());
        
        try {
            MessageResponse response = chatService.sendMessage(request, user.getUserId().intValue());
            
            // 📤 전송 완료 로그
            log.info("📤 메시지 전송 완료 - messageId: {}, isMine: {}, senderId: {}", 
                    response.getId(), response.isMine(), response.getSenderId());
            
            return ResponseEntity.ok(RsData.of("200", "메시지가 전송되었습니다.", response));
        } catch (Exception e) {
            log.error("메시지 전송 실패", e);
            if (e.getMessage().contains("권한이 없습니다")) {
                return ResponseEntity.status(403)
                        .body(RsData.of("403", e.getMessage(), null));
            }
            return ResponseEntity.badRequest()
                    .body(RsData.of("400", e.getMessage(), null));
        }
    }
    
    /**
     * 채팅방 메시지 읽음 처리
     */
    @PatchMapping("/rooms/{roomId}/read")
    public ResponseEntity<RsData<Void>> markMessagesAsRead(
            @PathVariable String roomId,
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        log.info("메시지 읽음 처리 - roomId: {}, userId: {}", roomId, user.getUserId());
        
        try {
            chatService.markMessagesAsRead(roomId, user.getUserId().intValue());
            return ResponseEntity.ok(RsData.of("200", "메시지를 읽음 처리했습니다.", null));
        } catch (Exception e) {
            log.error("메시지 읽음 처리 실패", e);
            if (e.getMessage().contains("권한이 없습니다")) {
                return ResponseEntity.status(403)
                        .body(RsData.of("403", e.getMessage(), null));
            }
            return ResponseEntity.internalServerError()
                    .body(RsData.of("500", "메시지 읽음 처리에 실패했습니다.", null));
        }
    }
    
    /**
     * 사용자의 읽지 않은 메시지 총 개수 조회
     */
    @GetMapping("/unread-count")
    public ResponseEntity<RsData<Long>> getUnreadMessageCount(
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        log.info("읽지 않은 메시지 개수 조회 - userId: {}", user.getUserId());
        
        try {
            long unreadCount = chatService.getUnreadMessageCount(user.getUserId().intValue());
            return ResponseEntity.ok(RsData.of("200", "읽지 않은 메시지 개수를 조회했습니다.", unreadCount));
        } catch (Exception e) {
            log.error("읽지 않은 메시지 개수 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(RsData.of("500", "읽지 않은 메시지 개수 조회에 실패했습니다.", null));
        }
    }
}
