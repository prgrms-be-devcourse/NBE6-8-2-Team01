package com.bookbook.config;

import com.bookbook.global.util.ImageMigrationUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * 개발 환경에서만 실행되는 이미지 동기화 컴포넌트
 * 애플리케이션 시작 시 static/images의 이미지들을 uploads 폴더로 복사
 */
@Component
@Profile("dev") // 개발 환경에서만 실행
public class ImageSyncRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== 개발 환경: 이미지 동기화 시작 ===");
        ImageMigrationUtil.copyFromStaticToUploads();
        System.out.println("=== 이미지 동기화 완료 ===");
    }
}
