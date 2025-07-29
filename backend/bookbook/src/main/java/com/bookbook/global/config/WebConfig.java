package com.bookbook.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // CORS 설정을 위한 메서드, /bookbook/** 경로에 대해 CORS를 허용합니다.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/bookbook/**")
                .allowedOrigins("http://localhost:3000") // 프론트엔드 주소들
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
