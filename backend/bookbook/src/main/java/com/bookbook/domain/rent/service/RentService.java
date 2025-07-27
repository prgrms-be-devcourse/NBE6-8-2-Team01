package com.bookbook.domain.rent.service;

import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RentService {
    private final RentRepository rentRepository;

    // Rent POST 요청
    @Transactional
    public void createRentPage(RentRequestDto dto, long userId) {
        // 유저 정보 조회(추후 인증 기능 추가 필요)
//        User user = userRepository.findById(userId)
//                .orElseThrow(()->new IllegalIdentifierException("로그인 또는 회원가입을 해 주세요"));

        // Rent 엔티티 생성 (Builder 패턴 활용)
        Rent rent = Rent.builder()
                .lender_user_id(userId)
                .title(dto.title())
                .bookCondition(dto.bookCondition())
                .bookImage(dto.bookImage())
                .address(dto.address())
                .contents(dto.contents())
                .rent_status(dto.rentStatus())
                .bookTitle(dto.bookTitle())
                .author(dto.author())
                .publisher(dto.publisher())
                .category(dto.category())
                .build();

        // Rent에 추가
        rentRepository.save(rent);
    }

    @Transactional(readOnly = true) // 조회 기능이므로 readOnly=true 설정
    public RentResponseDto getRentPage(int id) {

        Rent rent = rentRepository.findById(id)
                .orElseThrow(()-> new ServiceException("404-2", "해당 대여글을 찾을 수 없습니다."));

        return new RentResponseDto(
                rent.getLender_user_id(),
                rent.getBookCondition(),
                rent.getBookImage(),
                rent.getAddress(),
                rent.getContents(),
                rent.getRent_status(),
                rent.getTitle(),
                rent.getAuthor(),
                rent.getPublisher(),
                rent.getCreatedDate(),
                rent.getModifiedDate()
        );
    }
}
