package com.bookbook.global.security; // 적절한 패키지로 변경하세요

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component // 스프링 빈으로 등록하기 위함
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${frontend.base-url}${frontend.signup-path}")
    private String signupRedirectUrl;

    @Value("${frontend.base-url}${frontend.main-path}")
    private String mainRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        // 로그인한 사용자 정보 가져오기
        CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();

        // 첫 로그인 여부 확인
        if (oauth2User.isNewUser()) {
            // 첫 로그인인 경우 회원가입 정보 입력 페이지로 리다이렉트
            response.sendRedirect(signupRedirectUrl);
        } else {
            // 첫 로그인이 아닌 경우 메인 페이지로 리다이렉트
            response.sendRedirect(mainRedirectUrl);
        }
    }
}