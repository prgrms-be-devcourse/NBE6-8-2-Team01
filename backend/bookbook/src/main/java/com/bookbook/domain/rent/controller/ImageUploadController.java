package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.service.ImageUploadService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

// 실제 파일 업로드 시에는 파일 크기 제한, 파일 타입 검증(이미지 파일만 허용), 악성 코드 검사 등 추가적인 보안 조치
@RestController
@RequestMapping("/api/v1/bookbook")
@RequiredArgsConstructor
public class ImageUploadController {
    private final ImageUploadService imageUploadService;

    @PostMapping("/upload-image")
    @Operation(summary = "image 업로드")
    // 프론트에서 imageFormData.append('file', bookImage); 'file' 이름으로 File 객체 추가
    public ResponseEntity<?> uploadImage(@RequestParam("file")MultipartFile file) {

        if(file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 비어있습니다.");
        }

        try{
            String imageUrl = ImageUploadService.uploadImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e){
            // 서비스 계층에서 발생한 IOException을 처리
            e.printStackTrace();
            return ResponseEntity.status(500).body("이미지 업로드 실패" + e.getMessage());
        } catch (Exception e){ // 기타 예외 처리
            e.printStackTrace();
            return ResponseEntity.status(500).body("서버 오류: " + e.getMessage());
        }
    }
}
