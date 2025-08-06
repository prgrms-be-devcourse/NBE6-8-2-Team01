package com.bookbook.global.util;

import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@RequiredArgsConstructor
public class NicknameGenerator {

    private final UserRepository userRepository;
    private static final Random random = new Random();

    public String generateUniqueNickname(String baseNickname) {
        String uniqueNickname = baseNickname;
        int attempt = 0;

        while (userRepository.existsByNickname(uniqueNickname)) {
            if (attempt >= 999) {
                throw new RuntimeException("고유한 닉네임을 생성할 수 없습니다.");
            }
            uniqueNickname = baseNickname + "#" + String.format("%04d", random.nextInt(1000));
            attempt++;
        }
        return uniqueNickname;
    }
}