package com.bookbook.domain.user.controller;

import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.service.UserService;
import com.bookbook.global.security.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/bookbook/users")
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

    @GetMapping("check-username")
    public ResponseEntity<Map<String, Boolean>> checkNickname(@RequestParam String nickname) {
        if(nickname == null || nickname.trim().isEmpty()){
            Map<String, Boolean> errorResponse = new HashMap<>();
            errorResponse.put("isAvailable", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        boolean isAvailable = userService.checkNicknameAvailability(nickname);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isAvailable", isAvailable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<String> completeSignup(
            @RequestBody SignupRequest signupRequest,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ){
        Long userId = Objects.requireNonNullElse(customOAuth2User.getUserId(), -1L);

        if(userId == -1L || customOAuth2User == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 유효하지 않습니다.");
        }

        if(signupRequest.getNickname() == null || signupRequest.getNickname().trim().isEmpty()){
            return ResponseEntity.badRequest().body("닉네임은 필수 입력 사항입니다.");
        }

        if(signupRequest.getAddress() == null || signupRequest.getAddress().trim().isEmpty()){
            return ResponseEntity.badRequest().body("주소는 필수 입력 사항입니다.");
        }

        try{
            userService.registerAddUserInfo(userId, signupRequest.getNickname(), signupRequest.getAddress());
            return ResponseEntity.ok("회원가입이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

}
