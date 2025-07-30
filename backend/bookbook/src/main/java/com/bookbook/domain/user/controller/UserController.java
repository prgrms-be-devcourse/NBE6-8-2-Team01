package com.bookbook.domain.user.controller;

import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.dto.UserSignupRequestDto;
import com.bookbook.domain.user.service.UserService;
import com.bookbook.global.exception.ServiceException;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/bookbook/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/check-nickname")
    public ResponseEntity<RsData<Map<String, Boolean>>> checkNickname(@RequestParam String nickname) {
        if(nickname == null || nickname.trim().isEmpty()){
            throw new ServiceException("400-NICKNAME-EMPTY", "닉네임을 입력해주세요.");
        }

        boolean isAvailable = userService.checkNicknameAvailability(nickname);
        Map<String, Boolean> responseData = new HashMap<>();
        responseData.put("isAvailable", isAvailable);

        RsData<Map<String, Boolean>> rsData = RsData.of("200-OK", "닉네임 중복 확인 완료", responseData);
        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }

    @PostMapping("/signup")
    public ResponseEntity<RsData<Void>> completeSignup(
            @RequestBody UserSignupRequestDto signupRequest,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ){
        if(customOAuth2User == null || customOAuth2User.getUserId() == null || customOAuth2User.getUserId() == -1L){
            throw new ServiceException("401-AUTH-INVALID", "로그인 정보가 유효하지 않습니다.");
        }
        Long userId = customOAuth2User.getUserId();

        if(signupRequest.getNickname() == null || signupRequest.getNickname().trim().isEmpty()){
            throw new ServiceException("400-NICKNAME-EMPTY", "닉네임은 필수 입력 사항입니다.");
        }

        if(signupRequest.getAddress() == null || signupRequest.getAddress().trim().isEmpty()){
            throw new ServiceException("400-ADDRESS-EMPTY", "주소는 필수 입력 사항입니다.");
        }

        userService.registerAddUserInfo(userId, signupRequest.getNickname(), signupRequest.getAddress());
        RsData<Void> rsData = RsData.of("200-OK", "회원가입이 완료되었습니다.");
        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }

    @GetMapping("/me")
    public ResponseEntity<RsData<UserResponseDto>> getCurrentUser(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            throw new ServiceException("401-AUTH-INVALID", "로그인된 사용자가 없습니다.");
        }

        UserResponseDto userDetails = userService.getUserDetails(customOAuth2User.getUserId());
        RsData<UserResponseDto> rsData = RsData.of("200-OK", "사용자 정보 조회 성공", userDetails);
        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }

    @GetMapping("/isAuthenticated")
    public ResponseEntity<RsData<Boolean>> isAuthenticated(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        boolean authenticated = customOAuth2User != null;
        RsData<Boolean> rsData = RsData.of("200-OK", "인증 여부 확인 완료", authenticated);
        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }


    @DeleteMapping("/me")
    public ResponseEntity<RsData<Void>> deactivateUser(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null) {
            throw new ServiceException("401-AUTH-INVALID", "로그인 정보가 유효하지 않습니다.");
        }

        userService.deactivateUser(customOAuth2User.getUserId());
        RsData<Void> rsData = RsData.of("200-OK", "회원 탈퇴가 성공적으로 처리되었습니다.");
        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }

    @PatchMapping("/me")
    public ResponseEntity<RsData<Void>> updateMyInfo(
            @RequestBody UserSignupRequestDto updateRequest,
            @AuthenticationPrincipal CustomOAuth2User customOAuth2User
    ) {
        if (customOAuth2User == null || customOAuth2User.getUserId() == null || customOAuth2User.getUserId() == -1L) {
            throw new ServiceException("401-AUTH-INVALID", "로그인 정보가 유효하지 않습니다.");
        }
        Long userId = customOAuth2User.getUserId();

        if ((updateRequest.getNickname() == null || updateRequest.getNickname().trim().isEmpty()) &&
                (updateRequest.getAddress() == null || updateRequest.getAddress().trim().isEmpty())) {
            throw new ServiceException("400-UPDATE-REQUIRED", "수정할 닉네임 또는 주소를 제공해야 합니다.");
        }

        userService.registerAddUserInfo(userId, updateRequest.getNickname(), updateRequest.getAddress());
        RsData<Void> rsData = RsData.of("200-OK", "회원 정보가 성공적으로 수정되었습니다.");
        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }
}
