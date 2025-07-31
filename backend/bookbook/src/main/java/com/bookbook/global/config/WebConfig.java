package com.bookbook.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 설정 - 정적 리소스 핸들링
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploads 폴더의 이미지 서빙 (메인)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/")
                .setCachePeriod(0); // 개발 환경에서는 캐시 비활성화
        
        // images 경로도 uploads 폴더로 리다이렉트 (호환성)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:./uploads/")
                .setCachePeriod(0);
        
        // 추가적인 정적 리소스 처리
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}
