package com.bookbook.domain.user.controller;

import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bookbook/users")
public class UserController {
    private final UserService userService;

    @Profile("dev")
    @PostMapping("/login/dev")
    public ResponseEntity<?> devLogin(@RequestBody UserLoginRequestDto requestDto) {
       Optional<UserResponseDto> userResponse = userService.authenticateDevUser(requestDto);
        if (userResponse.isPresent()) {
            return ResponseEntity.ok(userResponse.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("개발자 로그인 실패");
        }

    }

    @PostMapping("/social/callback")
    public ResponseEntity<UserResponseDto> socialLoginCallback(
            @RequestParam String provider, // 소셜 로그인 제공자 (예: google, kakao 등)
            @RequestParam String code // 소셜 로그인 인증 코드
    ) {
        System.out.println("소셜 로그인 콜백 요청: provider=" + provider + ", code=" + code);

        //시연을 위해 임시로 소셜 로그인 처리 로직을 구현
        String socialUsernamePlaceholder = provider.toUpperCase() + "_" + code.substring(0, Math.min(code.length(), 10)); // 예 : GOOGLE_1234567890
        String socialEmailPlaceholder = "user_" + System.currentTimeMillis() + "@social.com";
        String socialNicknamePlaceholder = provider + "_유저";
        String socialAddressPlaceholder = "소셜 주소";

        UserResponseDto response =  userService.socialSignupOrLogin(
                socialUsernamePlaceholder,
                socialEmailPlaceholder,
                socialNicknamePlaceholder,
                socialAddressPlaceholder
        );
        return ResponseEntity.ok(response);
    }
}
