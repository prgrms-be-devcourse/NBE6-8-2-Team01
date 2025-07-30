package com.bookbook.global.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${frontend.base-url}${frontend.signup-path}")
    private String signupRedirectUrl;

    @Value("${frontend.base-url}${frontend.main-path}")
    private String mainRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();

        log.info("DEBUG: Login success for username: {}, isRegistrationCompleted: {}",
                oauth2User.getUsername(), oauth2User.isRegistrationCompleted());

        if (!oauth2User.isRegistrationCompleted()) {
            log.info("Redirecting to signup page: {}", signupRedirectUrl);
            response.sendRedirect(signupRedirectUrl);
        } else {
            log.info("Redirecting to main page: {}", mainRedirectUrl);
            response.sendRedirect(mainRedirectUrl);
        }
    }
}