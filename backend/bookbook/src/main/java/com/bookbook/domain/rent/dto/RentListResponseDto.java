package com.bookbook.domain.rent.dto;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 책 빌리러 가기 목록에서 사용할 Rent 응답 DTO
 * 프론트엔드 BookCard 컴포넌트에 맞춰 설계됨
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentListResponseDto {

    // 기본 정보
    private Integer id;                 // Rent ID (프론트: id)
    private String bookTitle;           // 책 제목 (프론트: bookTitle)
    private String author;              // 저자 (프론트: author)
    private String publisher;           // 출판사 (프론트: publisher)
    private String bookCondition;       // 책 상태 (프론트: bookCondition)
    private String bookImage;           // 책 이미지 URL (프론트: bookImage)
    private String address;             // 위치 정보 (프론트: address)
    private String category;            // 카테고리 (프론트: category)
    private String rentStatus;          // 대여 상태 (프론트: rentStatus)
    private Long lenderUserId;          // 책 소유자 ID (프론트: lenderUserId)

    // 상세 정보 (카드에서는 표시 안하지만 필요시 사용)
    private String title;               // 대여글 제목 (프론트: title?)
    private String contents;            // 대여 설명 (프론트: contents?)

    /**
     * Rent 엔티티를 RentListResponseDto로 변환
     */
    public static RentListResponseDto from(Rent rent) {
        return RentListResponseDto.builder()
                .id(Integer.valueOf(rent.getId())) // int -> Integer 변환
                .bookTitle(rent.getBookTitle())
                .author(rent.getAuthor())
                .publisher(rent.getPublisher())
                .bookCondition(rent.getBookCondition())
                .bookImage(normalizeImageUrl(rent.getBookImage()))
                .address(rent.getAddress())
                .category(rent.getCategory())
                .rentStatus(rent.getRentStatus() != null ? rent.getRentStatus().getDescription() : "대여 가능")
                .lenderUserId(rent.getLenderUserId())
                .title(rent.getTitle())
                .contents(rent.getContents())
                .build();
    }

    /**
     * 이미지 URL 정규화 및 검증
     * - 상대 경로를 절대 경로로 변환
     * - uploads 경로 정규화
     * - 파일 존재 여부 확인 (선택적)
     */
    private static String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return "/book-placeholder.png"; // 기본 이미지
        }

        // 이미 완전한 URL인 경우 그대로 반환
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }

        // 상대 경로인 경우 절대 경로로 변환
        if (imageUrl.startsWith("/")) {
            return imageUrl; // 프론트에서 처리하도록 상대 경로 유지
        }

        // 그 외의 경우 uploads 경로로 처리
        return "/uploads/" + imageUrl;
    }

    /**
     * 파일 존재 여부 확인 (개발용)
     * 실제 운영에서는 성능상 사용하지 않는 것을 권장
     */
    private static boolean fileExists(String imagePath) {
        try {
            if (imagePath.startsWith("/uploads/")) {
                String fileName = imagePath.substring("/uploads/".length());
                java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", fileName);
                return java.nio.file.Files.exists(filePath);
            }
            return true; // 다른 경로는 존재한다고 가정
        } catch (Exception e) {
            return false;
        }
    }
}
