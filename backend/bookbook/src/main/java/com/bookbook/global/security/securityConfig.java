package com.bookbook.global.security;

import com.bookbook.global.security.jwt.JwtAuthenticationFilter;
import com.bookbook.global.security.jwt.JwtProvider;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class securityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtProvider jwtProvider;
    private final LoginSuccessHandler loginSuccessHandler;

    @Value("${jwt.cookie.name}")
    private String jwtCookieName;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${frontend.main-path}")
    private String mainPath;


    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize
                        // ⭐ 로그아웃 경로도 permitAll()에 명시적으로 추가하여, 인증 없이 접근 가능하게 합니다.
                        .requestMatchers(
                                "/api/*/admin/login", "/api/*/admin/logout",
                                "api/v1/bookbook/users/social/callback",
                                "/login/**",
                                "/bookbook/home",
                                "/api/v1/bookbook/login/oauth2/code/**",
                                "/api/v1/bookbook/home",
                                "/api/v1/bookbook/users/check-nickname",
                                "/api/v1/bookbook/users/signup",
                                "/api/v1/bookbook/users/isAuthenticated",
                                "/api/v1/bookbook/users/logout" // ⭐ 로그아웃 경로 permitAll 추가
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookbook/users/me").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bookbook/users/me").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/bookbook/users/me").authenticated()

                        .requestMatchers("api/*/admin/**").hasRole("ADMIN")
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/bookbook/rent/create").permitAll()
                        .requestMatchers("/api/v1/bookbook/upload-image").permitAll()
                        .requestMatchers("/api/v1/bookbook/searchbook").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(loginSuccessHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .logout(logout -> logout
                                .logoutRequestMatcher(request -> {
                                    // 요청 URI와 메서드를 확인하여 매칭
                                    String uri = request.getRequestURI();
                                    String method = request.getMethod();
                                    return "/api/v1/bookbook/users/logout".equals(uri) && "GET".equals(method);
                                })
                                .logoutSuccessHandler((request, response, authentication) -> {
                                    // 쿠키 삭제 로직
                                    Cookie deleteCookie = new Cookie(jwtCookieName, null);
                                    deleteCookie.setHttpOnly(true);
                                    deleteCookie.setSecure(false);
                                    deleteCookie.setPath("/");
                                    deleteCookie.setMaxAge(0);
                                    response.addCookie(deleteCookie);
                                    response.sendRedirect(frontendBaseUrl + mainPath);
                                })
                                .invalidateHttpSession(false)
                                .deleteCookies(jwtCookieName)
                )
                // ⭐ 기본 로그인 페이지 사용 안함 (JWT 기반이므로)
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable())
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://cdpn.io"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/bookbook/**", configuration);
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}