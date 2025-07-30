package com.bookbook.domain.user.service;

import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.util.NicknameGenerator;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final NicknameGenerator nicknameGenerator;

    @Value("${app.dev-login.enable:false}")
    private boolean devLoginEnabled;
    @Value("${app.dev-login.username:}")
    private String devUsername;
    @Value("${app.dev-login.password:}")
    private String devPassword;
    @Value("${app.dev-login.email:}")
    private String devEmail;

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

    public Optional<UserResponseDto> authenticateDevUser(UserLoginRequestDto loginRequestDto){
        if (!devLoginEnabled) {
            System.out.println("개발자 로그인 기능이 비활성화되어 있습니다.");
            return Optional.empty();
        }
        if (loginRequestDto.getUsername().equals(devUsername) &&
                passwordEncoder.matches(loginRequestDto.getPassword(), passwordEncoder.encode(devPassword))) {
            System.out.println("개발자 사용자 인증 성공:" + devUsername);

            return userRepository.findByUsername(devUsername)
                    .map(UserResponseDto::new)
                    .or(() -> {
                        String uniqueNickname = nicknameGenerator.generateUniqueNickname("개발자 테스트"); // 변경
                        User devUser = User.builder()
                                .username(devUsername)
                                .password(passwordEncoder.encode(devPassword))
                                .email(devEmail)
                                .nickname(uniqueNickname)
                                .address("개발자 주소")
                                .rating(5.0f)
                                .role(Role.USER)
                                .userStatus(UserStatus.ACTIVE)
                                .build();
                        userRepository.save(devUser);
                        System.out.println("개발자 사용자 생성: " + devUsername);
                        return Optional.of(new UserResponseDto(devUser));
                    });
        }

        System.out.println("사용자명" + loginRequestDto.getUsername() + "에 대한 개발자 로그인에 실패 하였습니다.");
        return Optional.empty();
    }

    public boolean checkNicknameAvailability(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElse(null);
    }

    @Transactional
    public User registerAddUserInfo(Long userId, String nickname, String address){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if(userRepository.existsByNickname(nickname) && !user.getNickname().equals(nickname)) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        user.changeNickname(nickname);
        user.changeAddress(address);

        return userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 사용자를 찾을 수 없습니다."));

        // 사용자가 이미 비활성화 상태인 경우
        if (user.getUserStatus() == UserStatus.INACTIVE) {
            throw new IllegalStateException("이미 탈퇴 처리된 사용자입니다.");
        }

        // 사용자 상태를 INACTIVE로 변경
        user.changeUserStatus(UserStatus.INACTIVE);
        // 사용자명, 이메일, 닉네임 등을 고유성이 유지되지 않도록 변경하여 재가입 시 문제 없도록 처리
        // 예: 원래 username + "_deleted_" + UUID
        user.changeUsername(user.getUsername() + "_deleted_" + UUID.randomUUID().toString());
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            user.setEmail(user.getEmail() + "_deleted_" + UUID.randomUUID().toString());
        }
        user.changeNickname(user.getNickname() + "_deleted_" + UUID.randomUUID().toString());


        userRepository.save(user);
    }
}
