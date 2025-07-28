package com.bookbook.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class securityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 비밀번호 암호화를 위해 BCryptPasswordEncoder를 사용
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (REST API에서는 토큰 방식 사용 시 비활성화 권장)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/favicon.ico").permitAll() // 파비콘 접근 허용
                        .requestMatchers("/h2-console/**").permitAll() // H2 콘솔 접근 허용
                        .requestMatchers("/api/admin/login", "/api/dev/login", "/api/social/callback").permitAll() // 로그인 관련 경로는 모두 허용
                        .requestMatchers("/bookbook/rent/create").permitAll() // Rent 페이지 생성은 인증 필요, (임시)
                        .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
                )
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin()) // H2 콘솔을 사용하기 위해 동일 출처 프레임 옵션 설정
                );


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
        source.registerCorsConfiguration("/api", configuration);

        return source;
    }
}
