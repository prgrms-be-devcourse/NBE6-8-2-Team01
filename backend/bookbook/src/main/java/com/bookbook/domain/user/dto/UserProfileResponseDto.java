package com.bookbook.domain.user.dto;

import com.bookbook.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {

    private Long userId;
    private String nickname;
    private double mannerScore; // 매너점수
    private int mannerScoreCount; // 매너점수에 참여한 총 인원

    public static UserProfileResponseDto from(User user, double mannerScore, int mannerScoreCount) {
        return UserProfileResponseDto.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .mannerScore(mannerScore)
                .mannerScoreCount(mannerScoreCount)
                .build();
    }
}
