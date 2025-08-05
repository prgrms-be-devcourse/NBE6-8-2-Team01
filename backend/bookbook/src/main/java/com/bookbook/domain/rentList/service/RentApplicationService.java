package com.bookbook.domain.rentList.service;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.rentList.dto.RentApplicationRequestDto;
import com.bookbook.domain.rentList.dto.RentApplicationResponseDto;
import com.bookbook.domain.rentList.entity.RentApplication;
import com.bookbook.domain.rentList.repository.RentApplicationRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// 대여 신청 및 수락을 처리하는 서비스
// 25.08.05 현준
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RentApplicationService {

    private final RentApplicationRepository rentApplicationRepository;
    private final UserRepository userRepository;
    private final RentRepository rentRepository;
    private final RentListService rentListService; // 기존 대여 기록 생성 서비스
    
//    /**
//     * 사용자가 대여한 도서 목록 조회
//     *
//     * @param borrowerUserId 대여받은 사용자 ID
//     * @return 대여한 도서 목록
//     */
//    public List<RentListResponseDto> getRentListByUserId(Long borrowerUserId) {
//        return rentListRepository.findByBorrowerUserId(borrowerUserId).stream()
//                .map(rentList -> {
//                    String lenderNickname = userRepository.findById(rentList.getRent().getLenderUserId())
//                            .map(user -> user.getNickname())
//                            .orElse("알 수 없음");
//                    return RentListResponseDto.from(rentList, lenderNickname);
//                })
//                .collect(Collectors.toList());
//    }

    // 도서 대여 신청 등록
    public void createRentApplication(RentApplicationRequestDto request) {
        // 신청 사용자를 조회
        User borrowerUser = userRepository.findById(request.getBorrowerUserId())
                .orElseThrow(() -> new IllegalArgumentException("신청 사용자를 찾을 수 없습니다. userId: " + request.getBorrowerUserId()));

        // 대여 게시글을 조회
        Rent rentPost = rentRepository.findById(request.getRentId())
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + request.getRentId()));

        RentApplication rentApplication = RentApplication.builder()
                .loanDate(request.getLoanDate())
                .borrowerUser(borrowerUser)
                .rentPost(rentPost)
                .status("PENDING") // 초기 상태는 대기중
                .message(request.getMessage())
                .build();

        rentApplicationRepository.save(rentApplication);
    }

    // 게시글에 대한 PENDING 상태의 대여 신청 목록 조회
    public List<RentApplicationResponseDto> getRentApplications(Long lenderUserId) {
        List<RentApplication> rentApplications = rentApplicationRepository.findAll();

        return rentApplications.stream()
                .map(app -> new RentApplicationResponseDto(
                        app.getId(), // 대여 신청 ID
                        app.getRentPost().getTitle(), // 대여 게시글 제목
                        app.getBorrowerUser().getNickname(), // 대여 신청자 닉네임
                        app.getLoanDate(), // 대여 시작일
                        app.getStatus(), // 대여 신청 상태
                        app.getMessage() // 대여 신청 메시지
                        // 필요한 다른 필드 추가
                ))
                .collect(Collectors.toList());

    }



//    /**
//     * 도서 대여 신청 등록
//     *
//     * 사용자가 원하는 도서에 대해 대여 신청을 등록합니다.
//     * 반납일은 대여일로부터 자동으로 14일 후로 설정됩니다.
//     *
//     * @param borrowerUserId 대여받을 사용자 ID
//     * @param request 대여 신청 정보
//     * @return 생성된 대여 기록 정보
//     * @throws IllegalArgumentException 사용자나 게시글을 찾을 수 없는 경우
//     */
//    @Transactional
//    public void createRentList(Long borrowerUserId, RentListCreateRequestDto request) {
//        // User 엔티티 조회; 로그인하지 않은 사용자, 정지된 사용자 등
//        User borrowerUser = userRepository.findById(borrowerUserId)
//                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + borrowerUserId));
//
//        // Rent 엔티티 조회
//        Rent rent = rentRepository.findById(request.getRentId())
//                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다. rentId: " + request.getRentId()));
//
//        // 새로운 대여 기록 객체 생성
//        RentList rentList = new RentList();
//
//        // 대여일 설정 - 요청에서 받은 날짜 (사용자가 언제부터 빌릴지 지정)
//        rentList.setLoanDate(request.getLoanDate());
//
//        // 반납일 자동 계산 - 대여일로부터 14일 후
//        // plusDays(14): LocalDateTime에 14일을 더하는 메서드
//        rentList.setReturnDate(request.getLoanDate().plusDays(14));
//        // 연관관계 설정
//        rentList.setBorrowerUser(borrowerUser);
//        rentList.setRent(rent);
//
//        RentList savedRentList = rentListRepository.save(rentList);
//    }
}