package com.bookbook.domain.user.service;

import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.exception.ServiceException;
import com.bookbook.global.util.NicknameGenerator;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NicknameGenerator nicknameGenerator;

    @PostConstruct
    @Transactional
    public void createAdminUser(){
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
                    .rating(5.0f) // 초기 별점
                    .role(Role.ADMIN) // 관리자 역할
                    .userStatus(UserStatus.ACTIVE) // 활성화 상태
                    .build();
            userRepository.save(adminUser);
            System.out.println("관리자 계정이 생성되었습니다: " + adminUsername);
        } else {
            System.out.println("관리자 계정이 이미 존재합니다: " + adminUsername);
        }
    }

    public boolean checkNicknameAvailability(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }

    @Transactional
    public void completeRegistration(Long userId, String nickname, String address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "해당 ID의 사용자를 찾을 수 없습니다."));

        if (!nickname.trim().isEmpty() && userRepository.existsByNickname(nickname)) {
            throw new ServiceException("409-NICKNAME-DUPLICATE", "이미 사용 중인 닉네임입니다.");
        }
        if (nickname.trim().isEmpty()) {
            throw new ServiceException("400-NICKNAME-EMPTY", "닉네임은 필수 입력 사항입니다.");
        }
        if (address.trim().isEmpty()) {
            throw new ServiceException("400-ADDRESS-EMPTY", "주소는 필수 입력 사항입니다.");
        }

        user.changeNickname(nickname);
        user.changeAddress(address);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserInfo(Long userId, String nickname, String address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "해당 ID의 사용자를 찾을 수 없습니다."));

        boolean hasChanges = false; // <-- 변경 사항 감지를 위한 플래그 초기화

        if (nickname != null && !nickname.trim().isEmpty() && !user.getNickname().equals(nickname.trim())) {
            if (userRepository.existsByNickname(nickname.trim())) {
                throw new ServiceException("409-NICKNAME-DUPLICATE", "이미 사용 중인 닉네임입니다.");
            }
            user.changeNickname(nickname.trim()); // 변경 적용
            hasChanges = true; // 변경 사항이 있음을 표시
        }

        if (address != null && !address.trim().isEmpty() && !user.getAddress().equals(address.trim())) {
            user.changeAddress(address.trim());
            hasChanges = true;
        }

        if (!hasChanges) {
            throw new ServiceException("400-NO-CHANGES", "변경할 닉네임 또는 주소를 제공하지 않았거나 변경사항이 없습니다.");
        }

        userRepository.save(user);
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
        user.changeNickname(user.getNickname() + "_deleted_" + UUID.randomUUID().toString());

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
                    // 기존 사용자: 소셜 닉네임이 다르고 중복되지 않으면 업데이트
                    if (socialNickname != null && !socialNickname.trim().isEmpty() && !user.getNickname().equals(socialNickname)) {
                        if (!userRepository.existsByNickname(socialNickname)) {
                            user.changeNickname(socialNickname);
                            userRepository.save(user);
                        }
                    }
                    return user;
                })
                .orElseGet(() -> {
                    // 새 사용자: 고유한 닉네임 생성 및 User 엔티티 생성
                    String initialNickname;
                    if (socialNickname != null && !socialNickname.trim().isEmpty()) {
                        initialNickname = nicknameGenerator.generateUniqueNickname(socialNickname);
                    } else {
                        initialNickname = nicknameGenerator.generateUniqueNickname("새로운 사용자");
                    }

                    User newUser = User.builder()
                            .username(username)
                            .email(email)
                            .nickname(initialNickname)
                            .address("기본 주소")
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .rating(0.0f)
                            .role(Role.USER)
                            .userStatus(UserStatus.ACTIVE)
                            .build();
                    userRepository.save(newUser);
                    return newUser;
                });
    }
}
