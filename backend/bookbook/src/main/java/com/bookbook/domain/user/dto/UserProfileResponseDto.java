package com.bookbook.domain.user.dto;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String address;
    private float rating;
    private Role role;
    private UserStatus userStatus;
    private LocalDateTime createAt;
    private boolean registrationCompleted;
    private double mannerScore;        // 매너 점수 (리뷰 평균)
    private int mannerScoreCount;      // 리뷰 개수

    // User 엔티티와 매너 점수 정보로부터 DTO 생성
    public static UserProfileResponseDto from(User user, double mannerScore, int mannerScoreCount) {
        return UserProfileResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .address(user.getAddress())
                .rating(user.getRating())
                .role(user.getRole())
                .userStatus(user.getUserStatus())
                .createAt(user.getCreateAt())
                .registrationCompleted(user.isRegistrationCompleted())
                .mannerScore(mannerScore)
                .mannerScoreCount(mannerScoreCount)
                .build();
    }
}
