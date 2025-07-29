package com.bookbook.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // customOAuth2UserService를 생성자 주입하기 위한 어노테이션
public class securityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, LoginSuccessHandler loginSuccessHandler) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // REST API에서는 CSRF 비활성화 (토큰 기반 인증 시)
                .authorizeHttpRequests(authorize -> authorize
                        // 로그인 관련 경로는 모두 허용
                        .requestMatchers("/api/admin/login", "api/v1/bookbook/users/login/dev", "api/v1/bookbook/users/social/callback", "/login/**", "/bookbook/home", "/api/v1/bookbook/login/oauth2/code/**","/api/v1/users/dev/login", "/api/v1/bookbook/home", "/api/v1/bookbook/user/**", "api/v1/bookbook/users/signup", "api/v1/bookbook/users/check-nickname").permitAll()
                        .requestMatchers("/favicon.ico").permitAll() // 파비콘 접근 허용
                        .requestMatchers("/h2-console/**").permitAll() // H2 콘솔 접근 허용
                        .requestMatchers("/bookbook/rent/create").permitAll() // Rent 페이지 생성은 인증 필요, (임시)
                        .requestMatchers("/api/v1/bookbook/upload-image").permitAll() //  이미지 업로드 API 경로 허용
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // OPTIONS 메서드 요청은 모든 경로에 대해 허용 (Preflight 요청)
                        .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService) // 사용자 정보를 가져온 후 처리할 서비스 지정
                        )
                        .successHandler(loginSuccessHandler) // OAuth2 로그인 성공 후 처리할 핸들러 지정
                )
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())); // H2 Console 사용을 위함
        return http.build();
    }

    // --- CORS 설정을 위한 Bean을 추가합니다 ---
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 오리진 설정: 당신의 프론트엔드 URL과 cdpn.io (필요하다면)
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://cdpn.io")); // Java 9 이상 사용 가능

        // 허용할 HTTP 메서드 설정 (OPTIONS는 Preflight 요청에 필수)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 자격 증명 (쿠키 등) 허용 설정
        configuration.setAllowCredentials(true);

        // 허용할 헤더 설정 (모든 헤더 허용)
        configuration.setAllowedHeaders(Arrays.asList("*")); // 모든 헤더 허용

        // Preflight 요청 캐싱 시간 (초)
        configuration.setMaxAge(3600L); // Long 타입으로 명시

        // CORS 설정을 소스에 등록
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/bookbook/**", configuration);
        source.registerCorsConfiguration("/api/**", configuration); // 이 부분을 /api/** 로 수정했습니다.

        return source;
    }
}
