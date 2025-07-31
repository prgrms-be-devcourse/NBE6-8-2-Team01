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

    private final JwtProvider jwtProvider; // JwtProvider 주입

    @Value("${jwt.cookie.name}") // application.yml에 정의된 JWT 쿠키 이름
    private String jwtCookieName;

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

        // 1. JWT 토큰 생성
        String accessToken = jwtProvider.generateAccessToken(oauth2User.getUserId(), oauth2User.getUsername(), oauth2User.getRole().name());

        // 2. JWT를 HTTP Only 쿠키에 담아 전송
        Cookie jwtCookie = new Cookie(jwtCookieName, accessToken);
        jwtCookie.setHttpOnly(true); // JavaScript 접근 방지
        jwtCookie.setSecure(false);  // ⭐ HTTP 환경을 위해 false로 설정 (운영 시 반드시 true로 변경)
        jwtCookie.setPath("/");      // 모든 경로에서 쿠키 접근 가능
        jwtCookie.setMaxAge(jwtProvider.getAccessTokenValidityInSeconds()); // 토큰 만료 시간과 동일하게 설정

        response.addCookie(jwtCookie);

        // 3. 회원가입 완료 여부에 따라 프론트엔드로 리다이렉트
        String redirectUrl;
        if (!oauth2User.isRegistrationCompleted()) {
            redirectUrl = frontendBaseUrl + signupPath;
            log.info("Redirecting to signup page: {}", redirectUrl);
        } else {
            redirectUrl = frontendBaseUrl + mainPath;
            log.info("Redirecting to main page: {}", redirectUrl);
        }

        response.sendRedirect(redirectUrl);
    }
}