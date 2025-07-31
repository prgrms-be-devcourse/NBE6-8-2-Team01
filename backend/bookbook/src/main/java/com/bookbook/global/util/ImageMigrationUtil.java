package com.bookbook.global.util;

import java.io.IOException;
import java.nio.file.*;
import java.util.stream.Stream;

/**
 * 이미지를 적절한 위치로 복사하는 유틸리티
 */
public class ImageMigrationUtil {
    
    public static void copyFromStaticToUploads() {
        Path sourcePath = Paths.get("src/main/resources/static/images");
        Path targetPath = Paths.get("uploads");
        
        try {
            // uploads 경로가 없으면 생성
            if (!Files.exists(targetPath)) {
                Files.createDirectories(targetPath);
                System.out.println("uploads 폴더 생성: " + targetPath);
            }
            
            // 소스 폴더가 존재하는지 확인
            if (!Files.exists(sourcePath)) {
                System.out.println("소스 이미지 폴더가 존재하지 않습니다: " + sourcePath);
                return;
            }
            
            // src/main/resources/static/images의 모든 이미지 파일을 uploads 폴더로 복사
            try (Stream<Path> files = Files.list(sourcePath)) {
                files.filter(file -> {
                    String fileName = file.getFileName().toString().toLowerCase();
                    return fileName.endsWith(".png") || fileName.endsWith(".jpg") || 
                           fileName.endsWith(".jpeg") || fileName.endsWith(".gif");
                }).forEach(file -> {
                    try {
                        Path targetFile = targetPath.resolve(file.getFileName());
                        // 파일이 이미 존재하면 덮어쓰기
                        Files.copy(file, targetFile, StandardCopyOption.REPLACE_EXISTING);
                        System.out.println("이미지 복사 완료: " + file.getFileName() + " -> uploads/");
                    } catch (IOException e) {
                        System.err.println("파일 복사 실패: " + file.getFileName() + " - " + e.getMessage());
                    }
                });
            }
            
            System.out.println("이미지 복사 완료!");
            
        } catch (IOException e) {
            System.err.println("복사 중 오류 발생: " + e.getMessage());
        }
    }
    
    // 테스트용 main 메소드
    public static void main(String[] args) {
        System.out.println("=== static/images에서 uploads로 이미지 복사 ===");
        copyFromStaticToUploads();
    }
}
