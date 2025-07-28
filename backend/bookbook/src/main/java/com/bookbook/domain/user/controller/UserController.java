package com.bookbook.domain.user.controller;

import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/bookbook/users")
public class UserController {
    private final UserService userService;

    @Profile("dev")
    @PostMapping("/login/dev")
    public ResponseEntity<?> devLogin(@RequestBody UserLoginRequestDto requestDto) {
       Optional<UserResponseDto> userResponse = userService.authenticateDevUser(requestDto);
        if (userResponse.isPresent()) {
            return ResponseEntity.ok(userResponse.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("개발자 로그인 실패");
        }

    }

}
