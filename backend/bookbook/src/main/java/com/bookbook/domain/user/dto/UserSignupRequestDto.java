package com.bookbook.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

@Getter
@Service
@NoArgsConstructor
public class UserSignupRequestDto {
    private String nickname;
    private String address;
}
