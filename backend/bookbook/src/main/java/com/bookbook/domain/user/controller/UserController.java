package com.bookbook.domain.user.controller;

import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.dto.UserSignupRequestDto;
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

    @GetMapping("/check-nickname")
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
            @RequestBody UserSignupRequestDto signupRequest,
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

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인된 사용자가 없습니다.");
        }

        try {
            // UserService를 통해 User 엔티티에서 상세 정보를 가져와 UserResponseDto로 반환
            UserResponseDto userDetails = userService.getUserDetails(customOAuth2User.getUserId());
            return ResponseEntity.ok(userDetails);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("사용자 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/isAuthenticated") // 간단한 로그인 여부 확인
    public ResponseEntity<Boolean> isAuthenticated(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        return ResponseEntity.ok(customOAuth2User != null);
    }


    @DeleteMapping("/me") // 회원 탈퇴 엔드포인트
    public ResponseEntity<String> deactivateUser(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 유효하지 않습니다.");
        }

        try {
            userService.deactivateUser(customOAuth2User.getUserId());
            return ResponseEntity.ok("회원 탈퇴가 성공적으로 처리되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage()); // 409 Conflict
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원 탈퇴 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @PatchMapping("/me")
    public ResponseEntity<String> updateMyInfo(
            @RequestBody UserSignupRequestDto updateRequest, // 닉네임, 주소를 담을 DTO 재사용
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        Long userId = Objects.requireNonNullElse(customOAuth2User.getUserId(), -1L);

        if (userId == -1L || customOAuth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 유효하지 않습니다.");
        }

        // 닉네임과 주소 중 최소 하나는 제공되어야 한다고 가정
        if ((updateRequest.getNickname() == null || updateRequest.getNickname().trim().isEmpty()) &&
                (updateRequest.getAddress() == null || updateRequest.getAddress().trim().isEmpty())) {
            return ResponseEntity.badRequest().body("수정할 닉네임 또는 주소를 제공해야 합니다.");
        }

        try {
            // registerAddUserInfo 메서드가 이미 닉네임과 주소 변경을 처리하므로 재활용
            userService.registerAddUserInfo(userId, updateRequest.getNickname(), updateRequest.getAddress());
            return ResponseEntity.ok("회원 정보가 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원 정보 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
