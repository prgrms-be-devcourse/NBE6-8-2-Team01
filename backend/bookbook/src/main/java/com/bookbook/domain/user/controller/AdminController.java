package com.bookbook.domain.user.controller;

import com.bookbook.domain.user.dto.UserBaseDto;
import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.response.UserDetailResponseDto;
import com.bookbook.domain.user.dto.response.UserLoginResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.service.AdminService;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import com.bookbook.global.security.jwt.JwtProvider;
import com.bookbook.global.util.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "AdminController", description = "어드민 전용 컨트롤러")
public class AdminController {
    private final AdminService adminService;
    private final JwtProvider jwtProvider;

    @Value("${jwt.cookie.name}")
    private String jwtAccessTokenCookieName;

    @Value("${jwt.cookie.refresh-name}")
    private String jwtRefreshTokenCookieName;

    /**
     * 입력된 아이미와 비밀번호로 로그인을 진행합니다.
     * 로그인 시 access token과 refresh token을 포함해 응답을 반환합니다
     *
     * @param requestDto 로그인 요청 정보
     * @param response 응답 정보
     * @return 유저 로그인 정보
     */
    @PostMapping("/login")
    @Operation(summary = "어드민 로그인")
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

    /**
     * 관리자 계정의 로그아웃을 진행합니다.
     * access token과 refresh token을 파기합니다.
     *
     * @param currentUser JWT 기반 유저 정보
     * @param response 응답 정보
     */
    @DeleteMapping("/logout")
    @Operation(summary = "어드민 로그아웃")
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

    /**
     * Id 기반으로 유저의 상세정보를 가져옵니다.
     *
     * @param userId 조회할 유저의 ID
     * @return 조회된 유저 정보
     */
    @GetMapping("/users/{userId}")
    @Operation(summary = "유저 상세 정보 조회")
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

    /**
     * 유저 목록을 가져옵니다.
     *
     * <p>페이지 번호와 사이즈의 조합, 그리고 신고 처리 상태와
     * 신고 대상자 ID를 기반으로 필터링된 페이지를 가져올 수 있습니다.
     *
     * @param page 페이지 번호
     * @param size 페이지 당 항목 수
     * @param status 유저 상태
     * @param userId 검색할 유저의 ID
     * @return 생성된 유저들의 페이지 정보
     */
    @GetMapping("/users")
    @Operation(summary = "유저 목록 조회")
    public ResponseEntity<RsData<PageResponse<UserBaseDto>>> getFilteredUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) List<UserStatus> status,
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

    /**
     * 응답에 쿠키 정보를 더합니다.
     *
     * @param response 응답 정보
     * @param tokenName 토큰 명
     * @param token 토큰 값
     * @param maxAge 토큰 유효 기간(초)
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

    /**
     * 응답에 쿠키 정보를 더합니다.
     * 토큰 정보 말소 목적으로 사용됩니다
     *
     * @param response 응답 정보
     * @param tokenName 토큰 명
     */
    private void invalidateCookie(HttpServletResponse response, String tokenName) {
        Cookie cookie = new Cookie(tokenName, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
