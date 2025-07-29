package com.bookbook.domain.rent.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageUploadService {

    public static String uploadImage(MultipartFile file) throws IOException {

        // 파일명 중복 방지를 위해 UUDI 사용
        String originalFilename = file.getOriginalFilename(); // 원본 파일 이름 가져오기
        String fileExtension = "";
        if(originalFilename != null && originalFilename.contains(".")){ // 파일 이름에 확장자가 있는지 확인
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")); // 확장자 추출
        }
        String newFilename = UUID.randomUUID().toString() + fileExtension;

        // 파일 저장 경로 설정
        Path uploadPath = Paths.get("src/main/resources/static/images/");
        if (!Files.exists(uploadPath)) { // 디렉토리가 존재하지 않으면 생성
            Files.createDirectories(uploadPath); // 디렉토리 생성
        }

        Path filePath = uploadPath.resolve(newFilename); // 파일 경로 설정
        Files.copy(file.getInputStream(), filePath); // 파일 저장

        // 저장된 이미지의 URL 반환
        // 프론트엔드에서 사용할 URL, 이후 클라우드 스토리지 URL로 변경 필요
        return "http://localhost:8080/images/" + newFilename;
    }
}
