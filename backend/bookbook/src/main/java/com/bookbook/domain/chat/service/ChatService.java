package com.bookbook.domain.chat.service;

import com.bookbook.domain.chat.dto.*;
import com.bookbook.domain.chat.entity.ChatMessage;
import com.bookbook.domain.chat.entity.ChatRoom;
import com.bookbook.domain.chat.enums.MessageType;
import com.bookbook.domain.chat.repository.ChatMessageRepository;
import com.bookbook.domain.chat.repository.ChatRoomRepository;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ChatService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final RentRepository rentRepository;
    
    @Transactional
    public ChatRoomResponse createOrGetChatRoom(ChatRoomCreateRequest request, Integer borrowerId) {
        log.info("채팅방 생성 요청 - rentId: {}, lenderId: {}, borrowerId: {}", 
                request.getRentId(), request.getLenderId(), borrowerId);
        
        Rent rent = rentRepository.findById(request.getRentId())
                .orElseThrow(() -> new ServiceException("존재하지 않는 대여 게시글입니다."));
        
        User lender = userRepository.findById(Long.valueOf(request.getLenderId()))
                .orElseThrow(() -> new ServiceException("존재하지 않는 빌려주는 사용자입니다."));
        
        User borrower = userRepository.findById(Long.valueOf(borrowerId))
                .orElseThrow(() -> new ServiceException("존재하지 않는 빌리는 사용자입니다."));
        
        if (request.getLenderId().equals(borrowerId)) {
            throw new ServiceException("자기 자신과는 채팅할 수 없습니다.");
        }
        
        ChatRoom existingRoom = chatRoomRepository
                .findByRentIdAndLenderIdAndBorrowerId(request.getRentId(), request.getLenderId(), borrowerId)
                .orElse(null);
        
        if (existingRoom != null) {
            log.info("기존 채팅방 반환 - roomId: {}", existingRoom.getRoomId());
            return buildChatRoomResponse(existingRoom, rent, lender, borrower, borrowerId);
        }
        
        ChatRoom newRoom = ChatRoom.builder()
                .roomId(UUID.randomUUID().toString())
                .rentId(request.getRentId())
                .lenderId(request.getLenderId())
                .borrowerId(borrowerId)
                .isActive(true)
                .createdDate(LocalDateTime.now())
                .build();
        
        chatRoomRepository.save(newRoom);
        
        createSystemMessage(newRoom.getRoomId(), 
                String.format("📚 '%s' 책에 대한 채팅방이 생성되었습니다.", rent.getBookTitle()));
        
        log.info("새 채팅방 생성 완료 - roomId: {}", newRoom.getRoomId());
        return buildChatRoomResponse(newRoom, rent, lender, borrower, borrowerId);
    }
    
    public Page<ChatRoomResponse> getChatRooms(Integer userId, Pageable pageable) {
        log.info("채팅방 목록 조회 - userId: {}", userId);
        
        Page<ChatRoom> chatRooms = chatRoomRepository.findByUserIdOrderByLastMessageTimeDesc(userId, pageable);
        
        return chatRooms.map(room -> {
            Rent rent = rentRepository.findById(room.getRentId()).orElse(null);
            String bookTitle = rent != null ? rent.getBookTitle() : "알 수 없는 책";
            String bookImage = rent != null ? rent.getBookImage() : null;
            
            Integer otherUserId = room.getOtherUserId(userId);
            User otherUser = userRepository.findById(Long.valueOf(otherUserId)).orElse(null);
            String otherUserNickname = otherUser != null ? otherUser.getNickname() : "알 수 없는 사용자";
            
            long unreadCount = chatMessageRepository.countUnreadMessagesByRoomIdAndUserId(room.getRoomId(), userId);
            
            ChatRoomResponse response = ChatRoomResponse.from(room, bookTitle, bookImage, 
                    otherUserNickname, null, unreadCount);
            response.setOtherUserId(otherUserId);
            
            return response;
        });
    }
    
    public Page<MessageResponse> getChatMessages(String roomId, Integer userId, Pageable pageable) {
        log.info("채팅 메시지 조회 - roomId: {}, userId: {}, page: {}, size: {}", 
                roomId, userId, pageable.getPageNumber(), pageable.getPageSize());
        
        ChatRoom chatRoom = chatRoomRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ServiceException("채팅방에 접근할 권한이 없습니다."));
        
        Page<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByCreatedDateDesc(roomId, pageable);
        
        return messages.map(message -> {
            // 시스템 메시지 처리 (senderId가 0인 경우)
            if (message.getSenderId() == 0) {
                return MessageResponse.from(message, "시스템", null, false);
            }
            
            User sender = userRepository.findById(Long.valueOf(message.getSenderId())).orElse(null);
            String senderNickname = sender != null ? sender.getNickname() : "알 수 없는 사용자";
            
            // isMine 계산: 현재 사용자의 ID와 메시지 발신자 ID가 같은지 확인
            boolean isMine = message.getSenderId().equals(userId);
            
            // 🔍 디버깅 로그 추가
            log.info("🔍 메시지 ID: {}, 발신자 ID: {}, 현재 사용자 ID: {}, isMine: {}, 내용: '{}'", 
                    message.getId(), message.getSenderId(), userId, isMine, 
                    message.getContent().length() > 20 ? message.getContent().substring(0, 20) + "..." : message.getContent());
            
            MessageResponse response = MessageResponse.from(message, senderNickname, null, isMine);
            
            // 📤 응답 객체 확인
            log.info("📤 응답 객체 - 메시지 ID: {}, isMine: {}, senderId: {}", 
                    response.getId(), response.isMine(), response.getSenderId());
            
            return response;
        });
    }
    
    @Transactional
    public MessageResponse sendMessage(MessageSendRequest request, Integer senderId) {
        log.info("메시지 전송 - roomId: {}, senderId: {}, content: '{}'", 
                request.getRoomId(), senderId, 
                request.getContent().length() > 20 ? request.getContent().substring(0, 20) + "..." : request.getContent());
        
        ChatRoom chatRoom = chatRoomRepository.findByRoomIdAndUserId(request.getRoomId(), senderId)
                .orElseThrow(() -> new ServiceException("채팅방에 접근할 권한이 없습니다."));
        
        ChatMessage message = ChatMessage.builder()
                .roomId(request.getRoomId())
                .senderId(senderId)
                .content(request.getContent())
                .messageType(request.getMessageType())
                .isRead(false)
                .createdDate(LocalDateTime.now())
                .build();
        
        chatMessageRepository.save(message);
        
        chatRoom.updateLastMessage(request.getContent(), LocalDateTime.now());
        chatRoomRepository.save(chatRoom);
        
        User sender = userRepository.findById(Long.valueOf(senderId)).orElse(null);
        String senderNickname = sender != null ? sender.getNickname() : "알 수 없는 사용자";
        
        // 메시지를 보낸 사람이므로 항상 isMine = true
        MessageResponse response = MessageResponse.from(message, senderNickname, null, true);
        
        // 🔍 전송 메시지 디버깅 로그
        log.info("🔍 전송된 메시지 - ID: {}, senderId: {}, isMine: {}, content: '{}'", 
                message.getId(), senderId, true, request.getContent());
        
        // 📤 응답 객체 확인
        log.info("📤 전송 응답 객체 - 메시지 ID: {}, isMine: {}, senderId: {}", 
                response.getId(), response.isMine(), response.getSenderId());
        
        log.info("메시지 전송 완료 - messageId: {}, senderId: {}", message.getId(), senderId);
        return response;
    }
    
    @Transactional
    public void markMessagesAsRead(String roomId, Integer userId) {
        log.info("메시지 읽음 처리 - roomId: {}, userId: {}", roomId, userId);
        
        chatRoomRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ServiceException("채팅방에 접근할 권한이 없습니다."));
        
        int updatedCount = chatMessageRepository.markAllMessagesAsReadInRoom(roomId, userId);
        log.info("읽음 처리 완료 - 업데이트된 메시지 수: {}", updatedCount);
    }
    
    public long getUnreadMessageCount(Integer userId) {
        return chatMessageRepository.countUnreadMessagesByUserId(userId);
    }
    
    @Transactional
    public void createSystemMessage(String roomId, String content) {
        ChatMessage systemMessage = ChatMessage.builder()
                .roomId(roomId)
                .senderId(0)
                .content(content)
                .messageType(MessageType.SYSTEM)
                .isRead(false)
                .createdDate(LocalDateTime.now())
                .build();
        
        chatMessageRepository.save(systemMessage);
        
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId).orElse(null);
        if (chatRoom != null) {
            chatRoom.updateLastMessage(content, LocalDateTime.now());
            chatRoomRepository.save(chatRoom);
        }
    }
    
    @Transactional
    public void createBookCardMessage(String roomId, Integer rentId, String bookTitle, String bookImage, String message) {
        String jsonContent = String.format(
                "{\"type\":\"BOOK_CARD\",\"rentId\":%d,\"bookTitle\":\"%s\",\"bookImage\":\"%s\",\"message\":\"%s\"}",
                rentId, bookTitle, bookImage != null ? bookImage : "", message
        );
        
        ChatMessage systemMessage = ChatMessage.builder()
                .roomId(roomId)
                .senderId(0)
                .content(jsonContent)
                .messageType(MessageType.SYSTEM)
                .isRead(false)
                .createdDate(LocalDateTime.now())
                .build();
        
        chatMessageRepository.save(systemMessage);
        
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId).orElse(null);
        if (chatRoom != null) {
            chatRoom.updateLastMessage(message, LocalDateTime.now());
            chatRoomRepository.save(chatRoom);
        }
    }
    
    private ChatRoomResponse buildChatRoomResponse(ChatRoom room, Rent rent, User lender, User borrower, Integer currentUserId) {
        boolean isCurrentUserLender = room.getLenderId().equals(currentUserId);
        User otherUser = isCurrentUserLender ? borrower : lender;
        Integer otherUserId = otherUser.getId().intValue();
        
        long unreadCount = chatMessageRepository.countUnreadMessagesByRoomIdAndUserId(room.getRoomId(), currentUserId);
        
        ChatRoomResponse response = ChatRoomResponse.from(
                room, 
                rent.getBookTitle(), 
                rent.getBookImage(), 
                otherUser.getNickname(), 
                null,
                unreadCount
        );
        
        response.setOtherUserId(otherUserId);
        return response;
    }
}
