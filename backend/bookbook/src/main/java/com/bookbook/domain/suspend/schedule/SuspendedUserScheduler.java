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

/**
 * 정지 관련 스케쥴러
*/
@Slf4j
@Component
@RequiredArgsConstructor
public class SuspendedUserScheduler {

    private final UserRepository userRepository;

    /**
     * 정지 자동 해제 스케쥴러
     *
     * <p>일정 주기마다 활동 재개 가능한 유저를 모두 조회하고,
     * 정지를 자동으로 해제합니다.
     *
     * <p>[25.08.05] 한 시간마다 확인
     */
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
