package com.bookbook.domain.rentList.service;

import com.bookbook.domain.notification.enums.NotificationType;
import com.bookbook.domain.notification.service.NotificationService;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.rentList.dto.RentListCreateRequestDto;
import com.bookbook.domain.rentList.dto.RentListResponseDto;
import com.bookbook.domain.rentList.dto.RentRequestDecisionDto;
import com.bookbook.domain.rentList.entity.RentList;
import com.bookbook.domain.rentList.entity.RentRequestStatus;
import com.bookbook.domain.rentList.repository.RentListRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 내가 빌린 도서 목록 관리 서비스
 * 
 * 사용자의 도서 대여 신청, 대여 목록 조회 등의 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RentListService {
    
    private final RentListRepository rentListRepository;
    private final UserRepository userRepository;
    private final RentRepository rentRepository;
    private final NotificationService notificationService;
    
    /**
     * 사용자가 대여한 도서 목록 조회
     * 
     * @param borrowerUserId 대여받은 사용자 ID
     * @return 대여한 도서 목록
     */
    public List<RentListResponseDto> getRentListByUserId(Long borrowerUserId) {
        return rentListRepository.findByBorrowerUserId(borrowerUserId).stream()
                .map(rentList -> {
                    String lenderNickname = userRepository.findById(rentList.getRent().getLenderUserId())
                            .map(user -> user.getNickname())
                            .orElse("알 수 없음");
                    return RentListResponseDto.from(rentList, lenderNickname);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자가 대여한 도서 목록 검색
     * 
     * @param borrowerUserId 대여받은 사용자 ID
     * @param searchKeyword 검색어 (책 제목, 저자, 출판사, 게시글 제목에서 검색)
     * @return 검색된 대여한 도서 목록
     */
    public List<RentListResponseDto> searchRentListByUserId(Long borrowerUserId, String searchKeyword) {
        List<RentList> rentLists = rentListRepository.findByBorrowerUserId(borrowerUserId);
        
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            return rentLists.stream()
                    .map(rentList -> {
                        String lenderNickname = userRepository.findById(rentList.getRent().getLenderUserId())
                                .map(user -> user.getNickname())
                                .orElse("알 수 없음");
                        return RentListResponseDto.from(rentList, lenderNickname);
                    })
                    .collect(Collectors.toList());
        }
        
        String searchLower = searchKeyword.toLowerCase().trim();
        
        return rentLists.stream()
                .filter(rentList -> {
                    Rent rent = rentList.getRent();
                    return rent.getBookTitle().toLowerCase().contains(searchLower) ||
                           rent.getAuthor().toLowerCase().contains(searchLower) ||
                           rent.getPublisher().toLowerCase().contains(searchLower) ||
                           rent.getTitle().toLowerCase().contains(searchLower);
                })
                .map(rentList -> {
                    String lenderNickname = userRepository.findById(rentList.getRent().getLenderUserId())
                            .map(user -> user.getNickname())
                            .orElse("알 수 없음");
                    return RentListResponseDto.from(rentList, lenderNickname);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 도서 대여 신청 등록
     * 
     * 사용자가 원하는 도서에 대해 대여 신청을 등록합니다.
     * 반납일은 대여일로부터 자동으로 14일 후로 설정됩니다.
     * 
     * @param borrowerUserId 대여받을 사용자 ID
     * @param request 대여 신청 정보
     * @return 생성된 대여 기록 정보
     * @throws IllegalArgumentException 사용자나 게시글을 찾을 수 없는 경우
     */
    @Transactional
    public void createRentList(Long borrowerUserId, RentListCreateRequestDto request) {
        // User 엔티티 조회; 로그인하지 않은 사용자, 정지된 사용자 등
        User borrowerUser = userRepository.findById(borrowerUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + borrowerUserId));
        
        // Rent 엔티티 조회
        Rent rent = rentRepository.findById(request.getRentId())
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + request.getRentId()));
        
        // 새로운 대여 기록 객체 생성
        RentList rentList = new RentList();
        
        // 대여일 설정 - 요청에서 받은 날짜 (사용자가 언제부터 빌릴지 지정)
        rentList.setLoanDate(request.getLoanDate());
        
        // 반납일 자동 계산 - 대여일로부터 14일 후
        // plusDays(14): LocalDateTime에 14일을 더하는 메서드
        rentList.setReturnDate(request.getLoanDate().plusDays(14));
        // 연관관계 설정
        rentList.setBorrowerUser(borrowerUser);
        rentList.setRent(rent);

        RentList savedRentList = rentListRepository.save(rentList);
        
        // 책 소유자에게 대여 신청 알림 발송
        User lender = userRepository.findById(rent.getLenderUserId())
                .orElseThrow(() -> new IllegalArgumentException("책 소유자를 찾을 수 없습니다."));
        
        String requestMessage = String.format("'%s'에 대여 요청이 도착했어요!", rent.getBookTitle());
        notificationService.createNotification(
                lender,
                borrowerUser,
                NotificationType.RENT_REQUEST,
                requestMessage,
                rent.getBookTitle(),
                rent.getBookImage(),
                (long) rent.getId()
        );
        
        log.info("대여 신청 완료 및 알림 발송 - 책: {}, 신청자: {}, 소유자: {}", 
                rent.getBookTitle(), borrowerUser.getNickname(), lender.getNickname());
    }
    
    /**
     * 대여 신청 수락/거절 처리
     * 
     * @param rentListId 대여 신청 ID
     * @param decision 수락/거절 결정 정보
     * @param currentUser 현재 로그인한 사용자 (책 소유자)
     * @return 처리 결과 메시지
     */
    @Transactional
    public String decideRentRequest(Long rentListId, RentRequestDecisionDto decision, User currentUser) {
        // 대여 신청 조회
        RentList rentList = rentListRepository.findById(rentListId)
                .orElseThrow(() -> new RuntimeException("대여 신청을 찾을 수 없습니다."));
        
        Rent rent = rentList.getRent();
        
        // 권한 확인: 현재 사용자가 책 소유자인지 확인
        if (!rent.getLenderUserId().equals(currentUser.getId())) {
            throw new RuntimeException("해당 대여 신청을 처리할 권한이 없습니다.");
        }
        
        // 이미 처리된 신청인지 확인
        if (rentList.getStatus() != RentRequestStatus.PENDING) {
            throw new RuntimeException("이미 처리된 대여 신청입니다.");
        }
        
        User borrower = rentList.getBorrowerUser();
        
        if (decision.isApproved()) {
            // 수락 처리
            rentList.setStatus(RentRequestStatus.APPROVED);
            rent.setRentStatus(RentStatus.LOANED);
            
            rentListRepository.save(rentList);
            rentRepository.save(rent);
            
            // 신청자에게 수락 알림 발송
            String approveMessage = String.format("'%s' 대여 요청이 수락되었습니다!", rent.getBookTitle());
            notificationService.createNotification(
                    borrower,
                    null,
                    NotificationType.RENT_APPROVED,
                    approveMessage,
                    rent.getBookTitle(),
                    rent.getBookImage(),
                    (long) rent.getId()
            );
            
            log.info("대여 신청 수락 완료 - 책: {}, 대여자: {}, 신청자: {}", 
                    rent.getBookTitle(), currentUser.getNickname(), borrower.getNickname());
            
            return "대여 신청을 수락했습니다.";
            
        } else {
            // 거절 처리
            rentList.setStatus(RentRequestStatus.REJECTED);
            rentListRepository.save(rentList);
            
            // 신청자에게 거절 알림 발송
            String rejectMessage = String.format("'%s' 대여 요청이 거절되었습니다.", rent.getBookTitle());
            String detailMessage = decision.getRejectionReason() != null && !decision.getRejectionReason().trim().isEmpty()
                    ? decision.getRejectionReason()
                    : "죄송합니다. 대여 요청을 수락할 수 없습니다.";
            
            notificationService.createNotification(
                    borrower,
                    null,
                    NotificationType.RENT_REJECTED,
                    rejectMessage,
                    rent.getBookTitle(),
                    rent.getBookImage(),
                    (long) rent.getId()
            );
            
            log.info("대여 신청 거절 완료 - 책: {}, 대여자: {}, 신청자: {}, 사유: {}", 
                    rent.getBookTitle(), currentUser.getNickname(), borrower.getNickname(), detailMessage);
            
            return "대여 신청을 거절했습니다.";
        }
    }
}