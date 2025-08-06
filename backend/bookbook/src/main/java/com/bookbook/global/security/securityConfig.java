package com.bookbook.global.security;
//08-06 유효상
import com.bookbook.global.security.jwt.JwtAuthenticationFilter;
import com.bookbook.global.security.jwt.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
    private String jwtAccessTokenCookieName;
    @Value("${jwt.cookie.refresh-name}")
    private String jwtRefreshTokenCookieName;

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
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .authenticationEntryPoint((request, response, authException) -> {
                                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                                })
                )
                .authorizeHttpRequests(authorize -> authorize

                        .requestMatchers(
                                "/api/*/admin/login",
                                "api/v1/bookbook/users/social/callback",
                                "/login/**",
                                "/bookbook/home",
                                "/api/v1/bookbook/login/oauth2/code/**",
                                "/api/v1/bookbook/home",
                                "/api/v1/bookbook/users/check-nickname",
                                "/api/v1/bookbook/users/signup",
                                "/api/v1/bookbook/users/isAuthenticated",
                                "/api/v1/bookbook/users/logout",
                                "/api/v1/bookbook/auth/refresh-token",
                                "/api/v1/bookbook/home/**", // 홈 관련 모든 API 허용
                                "/favicon.ico", // 파비콘 접근 허용
                                "/h2-console/**", // H2 콘솔 접근 허용
                                "/images/**", // 이미지 파일 접근 허용
                                "/uploads/**", // uploads 폴더의 이미지 파일 접근 허용
                                "/bookbook/rent/create", // Rent 페이지 생성은 인증 필요, (임시)
                                "/bookbook/rent/**", // Rent 페이지 조회 허용 추가
                                "/api/v1/bookbook/rent/**", // API 형태의 Rent 페이지 조회 허용 추가
                                "/api/v1/bookbook/upload-image", // 이미지 업로드 API 경로 허용 추가
                                "/api/v1/bookbook/searchbook", // 알라딘 책 검색 API 경로 허용 추가
                                "/api/v1/public/**", // public API는 모두 허용
                                "/ws/**", // WebSocket 엔드포인트 허용
                                "/swagger-ui/**", // Swagger UI 접근 허용
                                "/swagger-ui.html", // Swagger UI 메인 페이지 접근 허용
                                "/v3/api-docs/**", // OpenAPI 문서 접근 허용
                                "/swagger-resources/**", // Swagger 리소스 접근 허용
                                "/webjars/**" // WebJars 접근 허용
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // OPTIONS 메서드 요청은 모든 경로에 대해 허용 (Preflight 요청)
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookbook/users/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/user/**").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/user/*/rentlist/*/decision").authenticated() // 대여 신청 처리는 인증 필요
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookbook/users/me").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bookbook/users/me").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/bookbook/users/me").authenticated()
                        .requestMatchers("/api/*/admin/logout", "/api/*/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
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
                            // 액세스 토큰 쿠키 삭제
                            Cookie deleteAccessTokenCookie = new Cookie(jwtAccessTokenCookieName, null);
                            deleteAccessTokenCookie.setHttpOnly(true);
                            deleteAccessTokenCookie.setSecure(false);
                            deleteAccessTokenCookie.setPath("/");
                            deleteAccessTokenCookie.setMaxAge(0);
                            response.addCookie(deleteAccessTokenCookie);

                            // 리프레시 토큰 쿠키 삭제
                            Cookie deleteRefreshTokenCookie = new Cookie(jwtRefreshTokenCookieName, null);
                            deleteRefreshTokenCookie.setHttpOnly(true);
                            deleteRefreshTokenCookie.setSecure(false);
                            deleteRefreshTokenCookie.setPath("/");
                            deleteRefreshTokenCookie.setMaxAge(0);
                            response.addCookie(deleteRefreshTokenCookie);

                            // DB에서 리프레시 토큰 무효화
                            if (authentication != null && authentication.getPrincipal() instanceof CustomOAuth2User) {
                                CustomOAuth2User user = (CustomOAuth2User) authentication.getPrincipal();
                                jwtProvider.deleteRefreshToken(user.getUserId());
                            }

                            response.sendRedirect(frontendBaseUrl + mainPath);
                        })
                        .invalidateHttpSession(false)
                        .deleteCookies(jwtAccessTokenCookieName, jwtRefreshTokenCookieName)
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable())
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://cdpn.io", "https://nbe-6-8-2-team01.vercel.app"));
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