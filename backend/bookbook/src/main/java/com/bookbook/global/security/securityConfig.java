package com.bookbook.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // customOAuth2UserService를 생성자 주입하기 위한 어노테이션
public class securityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 비밀번호 암호화를 위해 BCryptPasswordEncoder를 사용
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // REST API에서는 CSRF 비활성화 (토큰 기반 인증 시)
                .authorizeHttpRequests(authorize -> authorize
                        // 로그인 관련 경로는 모두 허용
                        .requestMatchers("/api/admin/login", "/bookbook/users/login/dev", "/bookbook/users/social/callback", "/login/**").permitAll()
                        // H2 Console (개발 시에만 활성화)
                        .requestMatchers("/h2-console/**").permitAll()
                        .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService) // 사용자 정보를 가져온 후 처리할 서비스 지정
                        )
                        .successHandler(oauth2AuthenticationSuccessHandler()) // OAuth2 로그인 성공 후 처리할 핸들러 지정
                )
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())); // H2 Console 사용을 위함

        return http.build();
    }

    // OAuth2 로그인 성공 후 리다이렉트할 URL을 설정하는 핸들러
    @Bean
    public AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        SimpleUrlAuthenticationSuccessHandler handler = new SimpleUrlAuthenticationSuccessHandler();
        handler.setDefaultTargetUrl("/"); // 로그인 성공 후 리다이렉트할 URL 설정
        handler.setAlwaysUseDefaultTargetUrl(true);
        return handler;
    }
}
