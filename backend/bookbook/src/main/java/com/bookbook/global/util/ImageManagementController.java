package com.bookbook.global.util;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 개발 환경에서만 사용할 수 있는 이미지 관리 API
 */
@RestController
@RequestMapping("/api/dev/images")
@Profile("dev") // 개발 환경에서만 활성화
public class ImageManagementController {

    /**
     * uploads 폴더의 모든 이미지 파일 목록 조회
     */
    @GetMapping("/list")
    public ResponseEntity<List<String>> listImages() {
        try {
            Path uploadsPath = Paths.get("uploads");
            
            if (!Files.exists(uploadsPath)) {
                return ResponseEntity.ok(List.of());
            }
            
            List<String> imageFiles = Files.list(uploadsPath)
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        String fileName = path.getFileName().toString().toLowerCase();
                        return fileName.endsWith(".png") || fileName.endsWith(".jpg") || 
                               fileName.endsWith(".jpeg") || fileName.endsWith(".gif");
                    })
                    .map(path -> path.getFileName().toString())
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(imageFiles);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 이미지 파일이 존재하는지 확인
     */
    @GetMapping("/exists/{fileName}")
    public ResponseEntity<Boolean> checkImageExists(@PathVariable String fileName) {
        Path imagePath = Paths.get("uploads", fileName);
        boolean exists = Files.exists(imagePath);
        return ResponseEntity.ok(exists);
    }

    /**
     * 기존 이미지를 다른 이름으로 복사 (개발용)
     */
    @PostMapping("/copy")
    public ResponseEntity<String> copyImage(
            @RequestParam String sourceFileName,
            @RequestParam String targetFileName
    ) {
        try {
            Path sourcePath = Paths.get("uploads", sourceFileName);
            Path targetPath = Paths.get("uploads", targetFileName);
            
            if (!Files.exists(sourcePath)) {
                return ResponseEntity.badRequest().body("Source file not found: " + sourceFileName);
            }
            
            Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            
            return ResponseEntity.ok("Image copied: " + sourceFileName + " -> " + targetFileName);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Copy failed: " + e.getMessage());
        }
    }

    /**
     * 누락된 이미지 파일들을 기본 이미지로 생성
     */
    @PostMapping("/create-missing")
    public ResponseEntity<String> createMissingImages(@RequestBody List<String> missingFileNames) {
        try {
            Path uploadsPath = Paths.get("uploads");
            
            // uploads 폴더가 없으면 생성
            if (!Files.exists(uploadsPath)) {
                Files.createDirectories(uploadsPath);
            }
            
            // 기존 이미지 파일 중 하나를 템플릿으로 사용
            List<Path> existingImages = Files.list(uploadsPath)
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        String fileName = path.getFileName().toString().toLowerCase();
                        return fileName.endsWith(".png") || fileName.endsWith(".jpg") || 
                               fileName.endsWith(".jpeg") || fileName.endsWith(".gif");
                    })
                    .collect(Collectors.toList());
            
            if (existingImages.isEmpty()) {
                return ResponseEntity.badRequest().body("No existing images to use as template");
            }
            
            Path templateImage = existingImages.get(0);
            int copiedCount = 0;
            
            for (String fileName : missingFileNames) {
                Path targetPath = Paths.get("uploads", fileName);
                if (!Files.exists(targetPath)) {
                    Files.copy(templateImage, targetPath, StandardCopyOption.REPLACE_EXISTING);
                    copiedCount++;
                }
            }
            
            return ResponseEntity.ok("Created " + copiedCount + " missing image files using template: " + templateImage.getFileName());
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to create missing images: " + e.getMessage());
        }
    }
}
