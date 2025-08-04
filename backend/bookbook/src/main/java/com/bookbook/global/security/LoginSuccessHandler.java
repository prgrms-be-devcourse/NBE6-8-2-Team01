package com.bookbook.global.security;

import com.bookbook.global.security.jwt.JwtProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    @Value("${jwt.cookie.name}")
    private String jwtAccessTokenCookieName;
    @Value("${jwt.cookie.refresh-name}")
    private String jwtRefreshTokenCookieName;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${frontend.signup-path}")
    private String signupPath;

    @Value("${frontend.main-path}")
    private String mainPath;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();

        log.info("DEBUG: Login success for username: {}, isRegistrationCompleted: {}",
                oauth2User.getUsername(), oauth2User.isRegistrationCompleted());

        // 1. JWT Access Token 생성
        String accessToken = jwtProvider.generateAccessToken(oauth2User.getUserId(), oauth2User.getUsername(), oauth2User.getRole().name());

        // 2. JWT Refresh Token 생성 및 DB 저장
        String refreshToken = jwtProvider.generateRefreshToken(oauth2User.getUserId());

        // 3. JWT Access Token을 HTTP Only 쿠키에 담아 전송
        Cookie jwtAccessTokenCookie = new Cookie(jwtAccessTokenCookieName, accessToken);
        jwtAccessTokenCookie.setHttpOnly(true);
        jwtAccessTokenCookie.setSecure(false);
        jwtAccessTokenCookie.setPath("/");
        jwtAccessTokenCookie.setMaxAge(jwtProvider.getAccessTokenValidityInSeconds());
        response.addCookie(jwtAccessTokenCookie);

        // 4. JWT Refresh Token을 HTTP Only 쿠키에 담아 전송
        Cookie jwtRefreshTokenCookie = new Cookie(jwtRefreshTokenCookieName, refreshToken);
        jwtRefreshTokenCookie.setHttpOnly(true);
        jwtRefreshTokenCookie.setSecure(false);
        jwtRefreshTokenCookie.setPath("/");
        jwtRefreshTokenCookie.setMaxAge(jwtProvider.getRefreshTokenValidityInSeconds());
        response.addCookie(jwtRefreshTokenCookie);

        // 5. 회원가입 완료 여부에 따라 프론트엔드로 리다이렉트
        String redirectUrl;
        if (!oauth2User.isRegistrationCompleted()) {
            redirectUrl = frontendBaseUrl + signupPath;
            log.info("Redirecting to signup page: {}", redirectUrl);
        } else {
            String queryParam = "?login_success=true";
            redirectUrl = frontendBaseUrl + mainPath + queryParam;
            log.info("Redirecting to main page: {}", redirectUrl);
        }

        response.sendRedirect(redirectUrl);
    }
}