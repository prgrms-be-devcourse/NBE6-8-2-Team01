package com.bookbook.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

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
                        .requestMatchers("/api/admin/login", "/api/dev/login", "/api/social/callback").permitAll() // 로그인 관련 경로는 모두 허용
                        .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
                );

        return http.build();
    }
}
