package com.bookbook.domain.user.repository;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByNickname(String nickname);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findAllByUserStatusAndResumedAtBefore(UserStatus userStatus, LocalDateTime now);

    boolean existsByUsername(String username); // 사용자명 중복확인
    boolean existsByNickname(String nickname); // 닉네임 중복확인
}
