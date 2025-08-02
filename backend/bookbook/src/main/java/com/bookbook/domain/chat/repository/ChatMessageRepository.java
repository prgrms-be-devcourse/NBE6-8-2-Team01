package com.bookbook.domain.chat.repository;

import com.bookbook.domain.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    
    // 채팅방별 메시지 목록 조회 (최신순)
    Page<ChatMessage> findByRoomIdOrderByCreatedDateDesc(String roomId, Pageable pageable);
    
    // 특정 사용자의 읽지 않은 메시지 개수 (전체)
    @Query("SELECT COUNT(cm) FROM ChatMessage cm " +
           "JOIN ChatRoom cr ON cm.roomId = cr.roomId " +
           "WHERE (cr.lenderId = :userId OR cr.borrowerId = :userId) " +
           "AND cm.senderId != :userId " +
           "AND cm.isRead = false")
    long countUnreadMessagesByUserId(@Param("userId") Integer userId);
    
    // 특정 채팅방에서 특정 사용자의 읽지 않은 메시지 개수
    @Query("SELECT COUNT(cm) FROM ChatMessage cm " +
           "WHERE cm.roomId = :roomId " +
           "AND cm.senderId != :userId " +
           "AND cm.isRead = false")
    long countUnreadMessagesByRoomIdAndUserId(@Param("roomId") String roomId, @Param("userId") Integer userId);
    
    // 특정 채팅방의 특정 사용자가 받은 메시지를 모두 읽음 처리
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.isRead = true, cm.readTime = CURRENT_TIMESTAMP " +
           "WHERE cm.roomId = :roomId " +
           "AND cm.senderId != :userId " +
           "AND cm.isRead = false")
    int markAllMessagesAsReadInRoom(@Param("roomId") String roomId, @Param("userId") Integer userId);
    
    // 채팅방의 마지막 메시지 조회
    @Query("SELECT cm FROM ChatMessage cm " +
           "WHERE cm.roomId = :roomId " +
           "ORDER BY cm.createdDate DESC " +
           "LIMIT 1")
    ChatMessage findLastMessageByRoomId(@Param("roomId") String roomId);
}
