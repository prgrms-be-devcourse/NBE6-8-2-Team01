package com.bookbook.domain.user.repository;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByNickname(String nickname);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findAllByUserStatusAndResumedAtBefore(UserStatus userStatus, LocalDateTime now);

    @Query("""
        SELECT u FROM User u WHERE
        (:status IS NULL OR u.userStatus in :status) AND 
        (:userId IS NULL OR u.id = :userId)
        ORDER BY u.createAt DESC
    """)
    Page<User> findFilteredUsers(
            Pageable pageable,
            @Param("status") List<String> status,
            @Param("userId") Long userId
    );

    boolean existsByUsername(String username); // 사용자명 중복확인
    boolean existsByNickname(String nickname); // 닉네임 중복확인
}
