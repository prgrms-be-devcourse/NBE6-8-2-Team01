package com.bookbook.domain.user.service;

import com.bookbook.domain.review.repository.ReviewRepository;
import com.bookbook.domain.user.dto.UserProfileResponseDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.exception.ServiceException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final ReviewRepository reviewRepository;

    @PostConstruct
    @Transactional
    public void initializeData(){
        createAdminUser();
        updateNotificationSchema();
    }

    private void createAdminUser(){
        String adminUsername = "admin";
        String adminPassword = "admin123";
        String adminEmail = "admin@book.com";

        if(!userRepository.existsByUsername(adminUsername)){
            User adminUser = User.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .nickname("관리자")
                    .address("서울시 강남구")
                    .rating(5.0f)
                    .role(Role.ADMIN)
                    .userStatus(UserStatus.ACTIVE)
                    .registrationCompleted(true)
                    .build();
            userRepository.save(adminUser);
            System.out.println("관리자 계정이 생성되었습니다: " + adminUsername);
        } else {
            System.out.println("관리자 계정이 이미 존재합니다: " + adminUsername);
        }
    }

    private void updateNotificationSchema() {
        try {
            // 기존 CHECK 제약 조건을 제거하고 새로운 것으로 교체
            jdbcTemplate.execute("ALTER TABLE notification DROP CONSTRAINT IF EXISTS notification_type_check");
            jdbcTemplate.execute("ALTER TABLE notification ADD CONSTRAINT notification_type_check CHECK (type IN ('RENT_REQUEST', 'RETURN_REMINDER', 'WISHLIST_AVAILABLE', 'POST_CREATED'))");
            System.out.println("✅ NotificationType 스키마 업데이트 완료: POST_CREATED 추가됨");
        } catch (Exception e) {
            System.err.println("❌ NotificationType 스키마 업데이트 실패: " + e.getMessage());
            // 개발 환경에서는 계속 진행
        }
    }

    public boolean checkNicknameAvailability(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }

    @Transactional
    public void completeRegistration(Long userId, String nickname, String address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "해당 ID의 사용자를 찾을 수 없습니다."));

        if (nickname == null || nickname.trim().isEmpty()) {
            throw new ServiceException("400-NICKNAME-EMPTY", "닉네임은 필수 입력 사항입니다.");
        }
        if (userRepository.existsByNickname(nickname.trim())) {
            throw new ServiceException("409-NICKNAME-DUPLICATE", "이미 사용 중인 닉네임입니다.");
        }
        if (address == null || address.trim().isEmpty()) {
            throw new ServiceException("400-ADDRESS-EMPTY", "주소는 필수 입력 사항입니다.");
        }

        user.setNickname(nickname.trim());
        user.setAddress(address.trim());
        user.setRegistrationCompleted(true);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserInfo(Long userId, String nickname, String address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "해당 ID의 사용자를 찾을 수 없습니다."));

        boolean hasChanges = false;

        if (nickname != null && !nickname.trim().isEmpty()) {
            String trimmedNickname = nickname.trim();
            if (!trimmedNickname.equals(user.getNickname())) {
                if (userRepository.existsByNickname(trimmedNickname)) {
                    throw new ServiceException("409-NICKNAME-DUPLICATE", "이미 사용 중인 닉네임입니다.");
                }
                user.setNickname(trimmedNickname);
                hasChanges = true;
            }
        }


        if (address != null && !address.trim().isEmpty()) {
            String trimmedAddress = address.trim();
            if (!trimmedAddress.equals(user.getAddress())) {
                user.setAddress(trimmedAddress);
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            throw new ServiceException("400-NO-CHANGES", "변경할 닉네임 또는 주소를 제공하지 않았거나 변경사항이 없습니다.");
        }

        user.setRegistrationCompleted(true);
        userRepository.save(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "해당 ID의 사용자를 찾을 수 없습니다."));

        if (user.getUserStatus() == UserStatus.INACTIVE) {
            throw new ServiceException("409-USER-ALREADY-INACTIVE", "이미 탈퇴 처리된 사용자입니다.");
        }

        user.changeUserStatus(UserStatus.INACTIVE);
        user.changeUsername(user.getUsername() + "_deleted_" + UUID.randomUUID().toString());
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            user.setEmail(user.getEmail() + "_deleted_" + UUID.randomUUID().toString());
        }

        user.setNickname(null);
        user.setAddress(null);
        user.setRegistrationCompleted(false);

        userRepository.save(user);
    }

    public UserResponseDto getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "해당 ID의 사용자를 찾을 수 없습니다."));
        return new UserResponseDto(user);
    }

    @Transactional
    public User findOrCreateUser(String username, String email, String socialNickname) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getEmail() == null && email != null) {
                        user.setEmail(email);
                    }
                    return user;
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(username)
                            .email(email)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .nickname(null)
                            .address(null)
                            .rating(0.0f)
                            .role(Role.USER)
                            .userStatus(UserStatus.ACTIVE)
                            .registrationCompleted(false)
                            .build();
                    userRepository.save(newUser);
                    return newUser;
                });
    }

    public User getByIdOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "해당 사용자를 찾을 수 없습니다."));
    }

    public UserProfileResponseDto getUserProfileDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "사용자를 찾을 수 없습니다."));

        Optional<Double> averageRating = reviewRepository.findAverageRatingByRevieweeId(userId);
        long mannerScoreCount = reviewRepository.countByRevieweeId(userId);

        double mannerScore = averageRating.orElse(0.0);

        return UserProfileResponseDto.from(user, mannerScore, (int) mannerScoreCount);
    }

}