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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

        try {
            // 입력값 검증
            if (request.getRentId() == null || request.getLenderId() == null || borrowerId == null) {
                log.error("필수 파라미터가 누락됨 - rentId: {}, lenderId: {}, borrowerId: {}",
                        request.getRentId(), request.getLenderId(), borrowerId);
                throw new ServiceException("필수 정보가 누락되었습니다.");
            }

            Rent rent = rentRepository.findById(request.getRentId())
                    .orElseThrow(() -> {
                        log.error("존재하지 않는 대여 게시글 - rentId: {}", request.getRentId());
                        return new ServiceException("존재하지 않는 대여 게시글입니다.");
                    });

            User lender = userRepository.findById(request.getLenderId().longValue())
                    .orElseThrow(() -> {
                        log.error("존재하지 않는 빌려주는 사용자 - lenderId: {}", request.getLenderId());
                        return new ServiceException("존재하지 않는 빌려주는 사용자입니다.");
                    });

            User borrower = userRepository.findById(borrowerId.longValue())
                    .orElseThrow(() -> {
                        log.error("존재하지 않는 빌리는 사용자 - borrowerId: {}", borrowerId);
                        return new ServiceException("존재하지 않는 빌리는 사용자입니다.");
                    });

            if (request.getLenderId().equals(borrowerId)) {
                log.error("자기 자신과의 채팅 시도 - userId: {}", borrowerId);
                throw new ServiceException("자기 자신과는 채팅할 수 없습니다.");
            }

            // 기존 채팅방 조회 - 활성 채팅방만 조회
            List<ChatRoom> existingRooms = chatRoomRepository
                    .findByRentIdAndLenderIdAndBorrowerIdOrderByCreatedDateDesc(
                            request.getRentId(), request.getLenderId(), borrowerId);

            ChatRoom existingRoom = null;

            // 활성 채팅방 중에서 사용자가 나가지 않은 채팅방 찾기 또는 복구 가능한 채팅방 찾기
            for (ChatRoom room : existingRooms) {
                if (!room.isActive()) {
                    continue; // 비활성 채팅방은 스킵
                }

                boolean lenderLeft = room.hasUserLeft(request.getLenderId());
                boolean borrowerLeft = room.hasUserLeft(borrowerId);

                if (!lenderLeft && !borrowerLeft) {
                    // 둘 다 활성 상태인 채팅방 - 이것을 우선 사용
                    existingRoom = room;
                    break;
                } else if (lenderLeft || borrowerLeft) {
                    // 한 명 또는 둘 다 나간 경우 - 나간 상태를 해제하고 채팅방 재사용
                    log.info("나간 사용자 재참여 처리 - roomId: {}, lenderLeft: {}, borrowerLeft: {}",
                            room.getRoomId(), lenderLeft, borrowerLeft);

                    // 나간 상태 해제
                    if (lenderLeft) {
                        room.rejoinUser(request.getLenderId());
                    }
                    if (borrowerLeft) {
                        room.rejoinUser(borrowerId);
                    }

                    chatRoomRepository.save(room);
                    existingRoom = room;
                    break;
                }
            }

            // 중복된 오래된 채팅방들 정리
            if (existingRooms.size() > 1) {
                log.warn("중복 채팅방 발견 및 정리 시작 - 개수: {}, rentId: {}, lenderId: {}, borrowerId: {}",
                        existingRooms.size(), request.getRentId(), request.getLenderId(), borrowerId);

                // 트랜잭션 내에서 중복 채팅방들 정리 (활성이고 모든 사용자가 있는 방 제외)
                cleanupDuplicateChatRooms(existingRooms, existingRoom);
            }

            if (existingRoom != null) {
                log.info("기존 활성 채팅방 발견 및 반환 - roomId: {}", existingRoom.getRoomId());
                return buildChatRoomResponse(existingRoom, rent, lender, borrower, borrowerId);
            }

            // 새 채팅방 생성
            log.info("새 채팅방 생성 시작");

            String newRoomId = UUID.randomUUID().toString();

            // 최종 중복 체크 (동시성 문제 방지)
            List<ChatRoom> finalCheck = chatRoomRepository
                    .findByRentIdAndLenderIdAndBorrowerIdOrderByCreatedDateDesc(
                            request.getRentId(), request.getLenderId(), borrowerId);

            if (!finalCheck.isEmpty()) {
                log.info("채팅방 생성 중 기존 채팅방 발견 - 기존 채팅방 사용: {}", finalCheck.get(0).getRoomId());
                return buildChatRoomResponse(finalCheck.get(0), rent, lender, borrower, borrowerId);
            }

            ChatRoom newRoom = ChatRoom.builder()
                    .roomId(newRoomId)
                    .rentId(request.getRentId())
                    .lenderId(request.getLenderId())
                    .borrowerId(borrowerId)
                    .isActive(true)
                    .createdDate(LocalDateTime.now())
                    .build();

            ChatRoom savedRoom = chatRoomRepository.save(newRoom);
            log.info("새 채팅방 생성 완료 - roomId: {}", savedRoom.getRoomId());

            return buildChatRoomResponse(savedRoom, rent, lender, borrower, borrowerId);

        } catch (ServiceException e) {
            log.error("채팅방 생성 실패 (ServiceException) - {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("채팅방 생성 중 예상치 못한 오류 발생", e);
            throw new ServiceException("채팅방 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    public Page<ChatRoomResponse> getChatRooms(Integer userId, Pageable pageable) {
        log.info("채팅방 목록 조회 - userId: {}", userId);

        Page<ChatRoom> chatRooms = chatRoomRepository.findByUserIdOrderByLastMessageTimeDesc(userId, pageable);

        // 나가지 않은 채팅방만 필터링하여 리스트로 변환
        List<ChatRoomResponse> validChatRooms = chatRooms.getContent().stream()
                .filter(room -> !room.hasUserLeft(userId)) // 나가지 않은 채팅방만
                .map(room -> {
                    Rent rent = rentRepository.findById(room.getRentId()).orElse(null);
                    String bookTitle = rent != null ? rent.getBookTitle() : "알 수 없는 책";
                    String bookImage = rent != null ? rent.getBookImage() : null;

                    Integer otherUserId = room.getOtherUserId(userId);
                    User otherUser = userRepository.findById(otherUserId.longValue()).orElse(null);
                    String otherUserNickname = otherUser != null ? otherUser.getNickname() : "알 수 없는 사용자";

                    Long unreadCount = chatMessageRepository.countUnreadMessagesByRoomIdAndUserId(room.getRoomId(), userId);

                    ChatRoomResponse response = ChatRoomResponse.from(room, bookTitle, bookImage,
                            otherUserNickname, null, unreadCount);
                    response.setOtherUserId(otherUserId);

                    return response;
                })
                .collect(Collectors.toList());

        // 새로운 Page 객체 생성 (실제 결과 개수로 totalElements 조정)
        return new PageImpl<>(validChatRooms, pageable, validChatRooms.size());
    }

    public ChatRoomResponse getChatRoom(String roomId, Integer userId) {
        log.info("채팅방 정보 조회 - roomId: {}, userId: {}", roomId, userId);

        ChatRoom chatRoom = chatRoomRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ServiceException("채팅방에 접근할 권한이 없습니다."));

        // 사용자가 나간 상태인 경우 재참여 처리
        if (chatRoom.hasUserLeft(userId)) {
            log.info("나간 사용자 재참여 처리 - roomId: {}, userId: {}", roomId, userId);
            chatRoom.rejoinUser(userId);
            chatRoomRepository.save(chatRoom);
        }

        Rent rent = rentRepository.findById(chatRoom.getRentId()).orElse(null);
        String bookTitle = rent != null ? rent.getBookTitle() : "알 수 없는 책";
        String bookImage = rent != null ? rent.getBookImage() : null;

        Integer otherUserId = chatRoom.getOtherUserId(userId);
        User otherUser = userRepository.findById(otherUserId.longValue()).orElse(null);
        String otherUserNickname = otherUser != null ? otherUser.getNickname() : "알 수 없는 사용자";

        Long unreadCount = chatMessageRepository.countUnreadMessagesByRoomIdAndUserId(roomId, userId);

        ChatRoomResponse response = ChatRoomResponse.from(chatRoom, bookTitle, bookImage,
                otherUserNickname, null, unreadCount);
        response.setOtherUserId(otherUserId);
        response.setRentId(chatRoom.getRentId()); // rentId 설정

        return response;
    }

    public Page<MessageResponse> getChatMessages(String roomId, Integer userId, Pageable pageable) {
        log.info("채팅 메시지 조회 - roomId: {}, userId: {}, page: {}, size: {}",
                roomId, userId, pageable.getPageNumber(), pageable.getPageSize());

        ChatRoom chatRoom = chatRoomRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ServiceException("채팅방에 접근할 권한이 없습니다."));

        // 사용자가 나간 시간 확인
        LocalDateTime userLeftTime = chatRoom.getUserLeftTime(userId);

        Page<ChatMessage> messages;
        if (userLeftTime != null) {
            // 나간 시간 이후의 메시지만 조회 (나간 후 새로 온 메시지만)
            log.info("사용자가 나간 시간 이후 메시지만 조회 - userId: {}, leftTime: {}", userId, userLeftTime);
            messages = chatMessageRepository.findByRoomIdAndCreatedDateAfterOrderByCreatedDateDesc(
                    roomId, userLeftTime, pageable);
        } else {
            // 모든 메시지 조회
            messages = chatMessageRepository.findByRoomIdOrderByCreatedDateDesc(roomId, pageable);
        }

        return messages.map(message -> {
            // 시스템 메시지 처리 (senderId가 0인 경우)
            if (message.getSenderId() == 0) {
                return MessageResponse.from(message, "시스템", null, false);
            }

            User sender = userRepository.findById(message.getSenderId().longValue()).orElse(null);
            String senderNickname = sender != null ? sender.getNickname() : "알 수 없는 사용자";

            // isMine 계산: 현재 사용자의 ID와 메시지 발신자 ID가 같은지 확인
            boolean isMine = message.getSenderId().equals(userId);

            return MessageResponse.from(message, senderNickname, null, isMine);
        });
    }

    @Transactional
    public MessageResponse sendMessage(MessageSendRequest request, Integer senderId) {
        log.info("메시지 전송 - roomId: {}, senderId: {}", request.getRoomId(), senderId);

        ChatRoom chatRoom = chatRoomRepository.findByRoomIdAndUserId(request.getRoomId(), senderId)
                .orElseThrow(() -> new ServiceException("채팅방에 접근할 권한이 없습니다."));

        // 채팅방에 메시지가 있는지 확인 (첫 번째 메시지인지 체크)
        boolean isFirstMessage = chatMessageRepository.countByRoomId(request.getRoomId()) == 0L;

        // 첫 번째 메시지인 경우 시스템 메시지 생성
        if (isFirstMessage) {
            try {
                Rent rent = rentRepository.findById(chatRoom.getRentId()).orElse(null);
                if (rent != null) {
                    String systemMessage = String.format("📚 '%s' 책에 대한 채팅방이 생성되었습니다.", rent.getBookTitle());
                    createSystemMessage(request.getRoomId(), systemMessage);
                }
            } catch (Exception e) {
                log.warn("시스템 메시지 생성 실패 - roomId: {}", request.getRoomId(), e);
            }
        }

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

        User sender = userRepository.findById(senderId.longValue()).orElse(null);
        String senderNickname = sender != null ? sender.getNickname() : "알 수 없는 사용자";

        // 메시지를 보낸 사람이므로 항상 isMine = true
        MessageResponse response = MessageResponse.from(message, senderNickname, null, true);

        log.info("메시지 전송 완료 - messageId: {}, senderId: {}", message.getId(), senderId);
        return response;
    }

    @Transactional
    public void markMessagesAsRead(String roomId, Integer userId) {
        log.info("메시지 읽음 처리 - roomId: {}, userId: {}", roomId, userId);

        chatRoomRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ServiceException("채팅방에 접근할 권한이 없습니다."));

        Integer updatedCount = chatMessageRepository.markAllMessagesAsReadInRoom(roomId, userId);
        log.info("읽음 처리 완료 - 업데이트된 메시지 수: {}", updatedCount);
    }

    public Long getUnreadMessageCount(Integer userId) {
        // 사용자가 참여한 모든 채팅방 중 나가지 않은 채팅방에서만 읽지 않은 메시지 카운트
        List<ChatRoom> userChatRooms = chatRoomRepository.findByLenderIdOrBorrowerId(userId, userId);

        long totalUnreadCount = 0;

        for (ChatRoom chatRoom : userChatRooms) {
            // 사용자가 나간 채팅방은 제외
            if (chatRoom.hasUserLeft(userId)) {
                continue;
            }

            // 해당 채팅방의 읽지 않은 메시지 수 조회
            Long roomUnreadCount = chatMessageRepository.countUnreadMessagesByRoomIdAndUserId(chatRoom.getRoomId(), userId);
            totalUnreadCount += roomUnreadCount;
        }

        return totalUnreadCount;
    }

    @Transactional
    public void leaveChatRoom(String roomId, Integer userId) {
        log.info("채팅방 나가기 시작 - roomId: {}, userId: {}", roomId, userId);

        // 채팅방 존재 여부 및 권한 확인
        ChatRoom chatRoom = chatRoomRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> {
                    log.error("채팅방 접근 권한 없음 - roomId: {}, userId: {}", roomId, userId);
                    return new ServiceException("채팅방에 접근할 권한이 없습니다.");
                });

        try {
            // 이미 나간 상태인지 확인
            if (chatRoom.hasUserLeft(userId)) {
                log.warn("이미 나간 채팅방 - roomId: {}, userId: {}", roomId, userId);
                return; // 이미 나간 상태면 그대로 종료
            }

            // 채팅방을 나가기 전에 모든 읽지 않은 메시지를 읽음 처리
            Integer markedAsReadCount = chatMessageRepository.markAllMessagesAsReadInRoom(roomId, userId);
            log.info("채팅방 나가기 - 읽음 처리된 메시지 수: {}", markedAsReadCount);

            // 상대방에게 나가기 알림 메시지 전송
            User leavingUser = userRepository.findById(userId.longValue()).orElse(null);
            String leavingUserNickname = leavingUser != null ? leavingUser.getNickname() : "사용자";
            String leaveMessage = String.format("💔 %s님이 채팅방을 나갔습니다.", leavingUserNickname);

            // 시스템 메시지 생성 (실패해도 나가기는 진행)
            try {
                createSystemMessage(roomId, leaveMessage);
            } catch (Exception e) {
                log.warn("시스템 메시지 생성 실패 - roomId: {}", roomId, e);
            }

            // 해당 사용자만 "나가기" 표시 (채팅방은 유지)
            chatRoom.markUserAsLeft(userId);
            ChatRoom savedRoom = chatRoomRepository.save(chatRoom);

            log.info("사용자 채팅방 나가기 완료 - roomId: {}, userId: {}, isEmpty: {}",
                    roomId, userId, savedRoom.isEmpty());

        } catch (Exception e) {
            log.error("채팅방 나가기 중 오류 발생 - roomId: {}, userId: {}", roomId, userId, e);
            throw new ServiceException("채팅방 나가기 중 오류가 발생했습니다: " + e.getMessage());
        }
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

        Long unreadCount = chatMessageRepository.countUnreadMessagesByRoomIdAndUserId(room.getRoomId(), currentUserId);

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

    /**
     * 중복 채팅방 정리 (사용 중인 방은 보호하고 나머지 삭제)
     */
    @Transactional
    public void cleanupDuplicateChatRooms(List<ChatRoom> duplicateRooms, ChatRoom protectedRoom) {
        if (duplicateRooms.size() <= 1) {
            return; // 중복이 없으면 처리할 필요 없음
        }

        try {
            for (ChatRoom duplicateRoom : duplicateRooms) {
                // 보호할 채팅방은 건드리지 않음
                if (protectedRoom != null && duplicateRoom.getId().equals(protectedRoom.getId())) {
                    continue;
                }

                // 활성이고 사용자가 모두 있는 방도 보호
                if (duplicateRoom.isActive() &&
                        !duplicateRoom.hasUserLeft(duplicateRoom.getLenderId()) &&
                        !duplicateRoom.hasUserLeft(duplicateRoom.getBorrowerId())) {
                    continue;
                }

                log.info("중복 채팅방 정리 중 - roomId: {}, createdDate: {}, active: {}",
                        duplicateRoom.getRoomId(), duplicateRoom.getCreatedDate(), duplicateRoom.isActive());

                try {
                    // 1. 관련 메시지들 먼저 삭제
                    Integer deletedMessages = chatMessageRepository.deleteByRoomId(duplicateRoom.getRoomId());
                    log.info("채팅방 메시지 삭제 완료 - roomId: {}, 삭제된 메시지 수: {}",
                            duplicateRoom.getRoomId(), deletedMessages);

                    // 2. 채팅방 삭제
                    chatRoomRepository.delete(duplicateRoom);
                    log.info("중복 채팅방 삭제 완료 - roomId: {}", duplicateRoom.getRoomId());

                } catch (Exception e) {
                    log.error("개별 채팅방 삭제 실패 - roomId: {}", duplicateRoom.getRoomId(), e);
                    // 개별 실패는 전체 프로세스를 중단시키지 않음
                }
            }

            log.info("중복 채팅방 정리 완료");

        } catch (Exception e) {
            log.error("중복 채팅방 정리 중 전체 오류 발생", e);
            // 정리 실패해도 채팅방 생성은 진행
        }
    }
}
