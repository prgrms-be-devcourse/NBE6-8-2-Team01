package com.bookbook.domain.chat.repository;

import com.bookbook.domain.chat.entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    
    // 사용자별 채팅방 목록 조회 (최신 메시지 순)
    @Query("SELECT cr FROM ChatRoom cr " +
           "WHERE (cr.lenderId = :userId OR cr.borrowerId = :userId) " +
           "AND cr.isActive = true " +
           "ORDER BY cr.lastMessageTime DESC NULLS LAST, cr.createdDate DESC")
    Page<ChatRoom> findByUserIdOrderByLastMessageTimeDesc(@Param("userId") Integer userId, Pageable pageable);
    
    // 특정 대여 게시글에 대한 채팅방 존재 여부 확인
    Optional<ChatRoom> findByRentIdAndLenderIdAndBorrowerId(Integer rentId, Integer lenderId, Integer borrowerId);
    
    // 채팅방 ID로 조회
    Optional<ChatRoom> findByRoomId(String roomId);
    
    // 사용자가 참여한 채팅방인지 확인
    @Query("SELECT cr FROM ChatRoom cr " +
           "WHERE cr.roomId = :roomId " +
           "AND (cr.lenderId = :userId OR cr.borrowerId = :userId) " +
           "AND cr.isActive = true")
    Optional<ChatRoom> findByRoomIdAndUserId(@Param("roomId") String roomId, @Param("userId") Integer userId);
    
    // 사용자의 활성 채팅방 개수
    @Query("SELECT COUNT(cr) FROM ChatRoom cr " +
           "WHERE (cr.lenderId = :userId OR cr.borrowerId = :userId) " +
           "AND cr.isActive = true")
    long countActiveRoomsByUserId(@Param("userId") Integer userId);
}
