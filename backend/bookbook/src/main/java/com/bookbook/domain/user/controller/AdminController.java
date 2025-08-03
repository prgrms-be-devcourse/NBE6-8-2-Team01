package com.bookbook.domain.user.controller;

import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.service.RentService;
import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.suspend.dto.response.UserSuspendResponseDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.suspend.service.SuspendedUserService;
import com.bookbook.domain.user.dto.ChangeRentStatusRequestDto;
import com.bookbook.domain.user.dto.RentSimpleResponseDto;
import com.bookbook.domain.user.dto.UserBaseDto;
import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.response.PageResponse;
import com.bookbook.domain.user.dto.response.UserDetailResponseDto;
import com.bookbook.domain.user.dto.response.UserLoginResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.service.AdminService;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import com.bookbook.global.security.jwt.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final SuspendedUserService suspendedUserService;
    private final RentService rentService;
    private final JwtProvider jwtProvider;

    @Value("${jwt.cookie.name}")
    private String jwtAccessTokenCookieName;

    @Value("${jwt.cookie.refresh-name}")
    private String jwtRefreshTokenCookieName;

    @PostMapping("/login")
    public ResponseEntity<RsData<UserLoginResponseDto>> adminLogin(
            @Valid @RequestBody UserLoginRequestDto requestDto,
            HttpServletResponse response
    ) {
        User admin = adminService.login(requestDto);

        String accessToken = jwtProvider.generateAccessToken(
                admin.getId(),
                admin.getUsername(),
                admin.getRole().toString()
        );
        String refreshToken = jwtProvider.generateRefreshToken(admin.getId());

        setCookie(response, jwtAccessTokenCookieName, accessToken, jwtProvider.getAccessTokenValidityInSeconds());
        setCookie(response, jwtRefreshTokenCookieName, refreshToken, jwtProvider.getRefreshTokenValidityInSeconds());

        UserLoginResponseDto userLoginResponseDto = UserLoginResponseDto.from(admin);

        return ResponseEntity.ok(
                RsData.of(
                    "200-1",
                    "관리자 %s님이 로그인하였습니다.".formatted(admin.getUsername()),
                    userLoginResponseDto
        ));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<RsData<Void>> adminLogout(
            @AuthenticationPrincipal CustomOAuth2User currentUser,
            HttpServletResponse response
    ) {
        invalidateCookie(response, jwtAccessTokenCookieName);
        invalidateCookie(response, jwtRefreshTokenCookieName);

        if (currentUser != null) {
            jwtProvider.deleteRefreshToken(currentUser.getUserId());
        }

        return ResponseEntity.ok(
                RsData.of("200-1", "로그아웃을 정상적으로 완료했습니다.")
        );
    }

    @PatchMapping("/users/suspend")
    public ResponseEntity<RsData<UserDetailResponseDto>> suspendUser(
            @RequestBody UserSuspendRequestDto requestDto
    ) {
        SuspendedUser suspendedUser = suspendedUserService.addUserAsSuspended(requestDto);
        UserDetailResponseDto userSuspendResponseDto = UserDetailResponseDto.from(suspendedUser.getUser());

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%s님을 정지하였습니다".formatted(suspendedUser.getUser().getUsername()),
                        userSuspendResponseDto
                )
        );
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<RsData<UserDetailResponseDto>> getUserDetail(
            @PathVariable Long userId
    ) {
        UserDetailResponseDto specificUserInfo = adminService.getSpecificUserInfo(userId);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%s 유저의 정보를 찾았습니다.".formatted(specificUserInfo.baseResponseDto().nickname()),
                        specificUserInfo
                ));
    }

    @PatchMapping("/users/{userId}/resume")
    public ResponseEntity<RsData<UserDetailResponseDto>> resumeUser(
            @PathVariable Long userId
    ) {
        User user = suspendedUserService.resumeUser(userId);
        UserDetailResponseDto userSuspendResponseDto = UserDetailResponseDto.from(user);

        return ResponseEntity.ok(
                RsData.of(
                    "200-1",
                    "%s님을 정지하였습니다".formatted(userSuspendResponseDto.baseResponseDto().nickname()),
                    userSuspendResponseDto
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<RsData<PageResponse<UserBaseDto>>> getFilteredUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) Long userId
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<UserBaseDto> userPage = adminService.getFilteredUsers(pageable, status, userId);
        PageResponse<UserBaseDto> response = PageResponse.from(userPage, page, size);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "해당 조건에 맞는 %d명의 유저를 찾았습니다.".formatted(userPage.getTotalElements()),
                        response
                )
        );
    }

    @GetMapping("/users/suspend")
    public ResponseEntity<RsData<PageResponse<UserSuspendResponseDto>>> getAllSuspendedHistory(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<UserSuspendResponseDto> historyPage = suspendedUserService.getSuspendedHistoryPage(pageable);
        PageResponse<UserSuspendResponseDto> response = PageResponse.from(historyPage, page, size);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%d개의 정지 이력을 발견했습니다".formatted(historyPage.getTotalElements()),
                        response
                )
        );
    }

    /*
    @GetMapping("/posts")
    public ResponseEntity<RsData<PageResponse<RentSimpleResponseDto>>> getPosts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) String nickname
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<RentSimpleResponseDto> rentHistoryPage = rentService.getRentsPage(pageable, status, nickname);
        PageResponse<RentSimpleResponseDto> response = PageResponse.from(rentHistoryPage, page, size);

        RsData<PageResponse<RentSimpleResponseDto>> rsData = new RsData<>(
                "200-1",
                "%d개의 글을 발견했습니다.".formatted(rentHistoryPage.getTotalElements()),
                response
        );

        return ResponseEntity.status(rsData.getStatusCode()).body(rsData);
    }

    @PatchMapping("/rent/{id}") // /rent/{id} 경로로 patch 요청을 처리
    public RsData<RentResponseDto> changeRentStatus(
            @PathVariable int id,
            @RequestBody ChangeRentStatusRequestDto status
    ){ // 경로 변수로 전달된 id를 사용
        RentResponseDto rentResponseDto = rentService.modifyRentPageStatus(id, status);

        return new RsData<>(
                "200-1",
                "%d 번 글 삭제 완료",
                rentResponseDto
        );
    }
     */

    private void setCookie(
            HttpServletResponse response,
            String tokenName,
            String token,
            Integer maxAge
    ) {
        Cookie cookie = new Cookie(tokenName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    private void invalidateCookie(HttpServletResponse response, String tokenName) {
        Cookie cookie = new Cookie(tokenName, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
