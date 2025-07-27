package com.bookbook.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserLoginRequestDto { // 로그인 요청 DTO(어드민 로그인, 임시 개발자 로그인용)
    private String username;
    private String password;
}
