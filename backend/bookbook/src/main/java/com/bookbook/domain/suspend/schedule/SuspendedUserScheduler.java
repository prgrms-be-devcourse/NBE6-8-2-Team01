package com.bookbook.domain.suspend.schedule;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuspendedUserScheduler {

    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 */1 * * *")
    @Transactional
    public void executeScheduledResumingUsers() {
        log.info("Suspending users suspended members");
        List<User> suspendedUsers = userRepository
                .findAllByUserStatusAndResumedAtBefore(UserStatus.SUSPENDED, LocalDateTime.now());

        for (User suspendedUser : suspendedUsers) {
            try {
                suspendedUser.resume();
                log.info("멤버: {} 정지 해제 완료", suspendedUser.getId());
            } catch (RuntimeException e) {
                log.warn("멤버: {} 정지 해제 실패", suspendedUser.getId());
            }
        }
    }
}
