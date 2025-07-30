package com.bookbook.domain.user.dto;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String address;
    private float rating;
    private Role role;
    private UserStatus userStatus;
    private LocalDateTime createAt;

    // Entity를 DTO로 변환하는 생성자
    public UserResponseDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.address = user.getAddress();
        this.rating = user.getRating();
        this.role = user.getRole();
        this.userStatus = user.getUserStatus();
        this.createAt = user.getCreateAt();
    }
}