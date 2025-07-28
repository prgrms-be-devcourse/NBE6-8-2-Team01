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
import java.util.Random;
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

    public UserResponseDto socialSignupOrLogin(String socialUsername, String socialEmail, String socialNickname, String address) {
        return userRepository.findByUsername(socialUsername)// 고유한 소셜 사용자명을 이용하여 사용자가 이미 존재하는지 확인
                .map(UserResponseDto::new)
                .orElseGet(() -> { // 사용자가 존재하지 않으면 새로 생성
                    User newUser = User.builder()
                            .username(socialUsername)
                            .email(socialEmail)
                            .nickname(socialNickname)
                            .address(address)
                            .rating(0.0f) // 초기 별점
                            .password(passwordEncoder.encode(UUID.randomUUID().toString())) // 소셜 로그인 사용자에게 임의의 비밀번호 할당
                            .role(Role.USER) // 일반 사용자 역할
                            .userStatus(UserStatus.ACTIVE) // 활성화 상태
                            .build();
                    userRepository.save(newUser);
                    return new UserResponseDto(newUser);
                });
    }
}
