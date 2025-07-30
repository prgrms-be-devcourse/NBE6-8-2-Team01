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
    public User registerAddUserInfo(Long userId, String nickname, String address){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404-USER-NOT-FOUND", "사용자를 찾을 수 없습니다."));

        if(nickname != null && !nickname.trim().isEmpty() && userRepository.existsByNickname(nickname) && !user.getNickname().equals(nickname)) {
            throw new ServiceException("409-NICKNAME-DUPLICATED", "이미 사용 중인 닉네임입니다.");
        }

        if (nickname != null && !nickname.trim().isEmpty()) {
            user.changeNickname(nickname);
        }
        if (address != null && !address.trim().isEmpty()) {
            user.changeAddress(address);
        }

        return userRepository.save(user);
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
}
