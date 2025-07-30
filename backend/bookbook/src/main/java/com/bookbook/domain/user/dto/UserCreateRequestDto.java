package com.bookbook.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserCreateRequestDto {
    @NotBlank(message="아이디는 필수 입력값입니다.")
    private String nickname;
    @NotBlank(message="이메일은 필수 입력값입니다.")
    private String address;
}
