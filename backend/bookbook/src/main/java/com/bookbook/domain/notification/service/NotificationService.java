package com.bookbook.domain.notification.service;

import com.bookbook.domain.notification.dto.NotificationResponseDto;
import com.bookbook.domain.notification.entity.Notification;
import com.bookbook.domain.notification.enums.NotificationType;
import com.bookbook.domain.notification.repository.NotificationRepository;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.rentList.entity.RentList;
import com.bookbook.domain.rentList.entity.RentRequestStatus;
import com.bookbook.domain.rentList.repository.RentListRepository;
import com.bookbook.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RentListRepository rentListRepository;
    private final RentRepository rentRepository;

    // 사용자별 알림 조회
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getNotificationsByUser(User user) {
        List<Notification> notifications = notificationRepository.findByReceiverOrderByCreateAtDesc(user);

        return notifications.stream()
                .map(NotificationResponseDto::from)
                .toList();
    }

    // 읽지 않은 알림 개수
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByReceiverAndIsReadFalse(user);
    }

    // 특정 알림 읽음 처리
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 알림입니다. ID: " + notificationId));

        // 본인의 알림인지 확인
        if (!notification.getReceiver().equals(user)) {
            throw new RuntimeException("다른 사용자의 알림에 접근할 수 없습니다.");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    // 모든 알림 읽음 처리
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByReceiver(user);
    }

    // 새 알림 생성 (다른 서비스에서 호출용)
    @Transactional
    public Notification createNotification(User receiver, User sender, NotificationType type,
                                           String message, String bookTitle, String bookImageUrl, Long relatedId) {
        Notification notification = Notification.createNotification(
                receiver, sender, type, message, bookTitle, bookImageUrl, relatedId
        );

        return notificationRepository.save(notification);
    }

    // 알림 삭제
    @Transactional
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 알림입니다. ID: " + notificationId));

        // 본인의 알림인지 확인
        if (!notification.getReceiver().equals(user)) {
            throw new RuntimeException("다른 사용자의 알림을 삭제할 수 없습니다.");
        }

        notificationRepository.delete(notification);
    }
    
    /**
     * 대여 신청 상세 정보 조회
     * RENT_REQUEST 타입의 알림에 대한 상세 정보를 조회합니다.
     * 
     * @param notificationId 알림 ID
     * @param user 현재 로그인한 사용자
     * @return 대여 신청 상세 정보 (rentListId 포함)
     */
    @Transactional(readOnly = true)
    public Object getRentRequestDetail(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 알림입니다."));

        // 본인의 알림인지 확인
        if (!notification.getReceiver().equals(user)) {
            throw new RuntimeException("다른 사용자의 알림에 접근할 수 없습니다.");
        }

        // RENT_REQUEST 타입인지 확인
        if (notification.getType() != NotificationType.RENT_REQUEST) {
            throw new RuntimeException("대여 신청 알림이 아닙니다.");
        }

        // relatedId로 Rent 정보 조회 (relatedId는 rent.getId())
        Long rentId = notification.getRelatedId();
        log.info("알림의 relatedId (rentId): {}", rentId);
        
        if (rentId == null) {
            throw new RuntimeException("알림에 연결된 대여 게시글 ID가 없습니다.");
        }
        
        // Rent 정보 조회
        Rent rent = rentRepository.findById(rentId.intValue())
                .orElseThrow(() -> new RuntimeException("대여 게시글을 찾을 수 없습니다. ID: " + rentId));

        // 📝 수정된 부분: 특정 알림의 발송자(신청자)와 일치하는 RentList 조회
        User requester = notification.getSender(); // 알림을 발생시킨 사용자 (신청자)
        
        Map<String, Object> detail = new HashMap<>();
        detail.put("rentId", rent.getId());
        detail.put("bookTitle", rent.getBookTitle());
        detail.put("bookImage", rent.getBookImage());
        detail.put("rentStatus", rent.getRentStatus().getDescription());
        
        if (requester != null) {
            // 해당 신청자의 PENDING 상태 RentList 조회
            List<RentList> requesterRentLists = rentListRepository
                    .findByRentIdAndBorrowerUserIdAndStatus(rentId.intValue(), requester.getId(), RentRequestStatus.PENDING);
            
            if (!requesterRentLists.isEmpty()) {
                // 해당 신청자의 신청 정보 사용 (보통 하나일 것이지만, 혹시나 여러 개면 최신 것)
                RentList targetRentList = requesterRentLists.get(requesterRentLists.size() - 1);
                detail.put("rentListId", targetRentList.getId());
                detail.put("requesterNickname", requester.getNickname());
                detail.put("requestDate", targetRentList.getCreatedDate());
                detail.put("loanDate", targetRentList.getLoanDate());
                detail.put("returnDate", targetRentList.getReturnDate());
                
                log.info("특정 신청자의 대여 신청 정보 조회 완료 - 신청자: {}, RentList ID: {}", 
                        requester.getNickname(), targetRentList.getId());
            } else {
                // 해당 신청자의 PENDING 신청이 없는 경우 (이미 처리됨)
                log.warn("신청자 {}의 PENDING 상태 신청이 없음 - Rent ID: {}", requester.getNickname(), rentId);
                detail.put("rentListId", null);
                detail.put("requesterNickname", requester.getNickname());
                detail.put("requestDate", null);
                detail.put("loanDate", null);
                detail.put("returnDate", null);
            }
        } else {
            // 시스템 알림 등으로 sender가 없는 경우
            log.warn("알림에 발송자 정보가 없음 - 알림 ID: {}", notificationId);
            detail.put("rentListId", null);
            detail.put("requesterNickname", "알 수 없음");
            detail.put("requestDate", null);
            detail.put("loanDate", null);
            detail.put("returnDate", null);
        }
        
        log.info("대여 신청 상세 정보 조회 완료 - 알림 ID: {}, Rent ID: {}, 신청자: {}", 
                notificationId, rent.getId(), requester != null ? requester.getNickname() : "없음");

        return detail;
    }
}
