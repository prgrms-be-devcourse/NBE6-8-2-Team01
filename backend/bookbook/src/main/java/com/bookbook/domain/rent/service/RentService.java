package com.bookbook.domain.rent.service;

import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.dto.RentResponseDto;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.hibernate.boot.model.naming.IllegalIdentifierException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 25.07.31 현준
@Service
@RequiredArgsConstructor
public class RentService {
    private final RentRepository rentRepository;

    // Rent 페이지 등록 Post 요청
    // http://localhost:3000/bookbook/rent/create
    @Transactional
    public void createRentPage(RentRequestDto dto, long userId) {
//         유저 정보 조회(추후 인증 기능 추가 필요)
//         User user = userRepository.findById(userId)
//                 .orElseThrow(()-> new ServiceException("", "로그인을 해 주세요."));

        // Rent 엔티티 생성 (Builder 패턴 활용)
        Rent rent = Rent.builder()
                .lenderUserId(userId)
                .title(dto.title())
                .bookCondition(dto.bookCondition())
                .bookImage(dto.bookImage())
                .address(dto.address())
                .contents(dto.contents())
                .rentStatus(dto.rentStatus())
                .bookTitle(dto.bookTitle())
                .author(dto.author())
                .publisher(dto.publisher())
                .category(dto.category())
                .description(dto.description())
                .build();

        // Rent 테이블에 추가
        rentRepository.save(rent);
    }

    @Transactional(readOnly = true) // 조회 기능이므로 readOnly=true 설정
    public RentResponseDto getRentPage(int id) {

        Rent rent = rentRepository.findById(id)
                .orElseThrow(()-> new ServiceException("404-2", "해당 대여글을 찾을 수 없습니다."));

        return new RentResponseDto(
                rent.getLenderUserId(),
                rent.getBookCondition(),
                rent.getBookImage(),
                rent.getAddress(),
                rent.getContents(),
                rent.getRentStatus(),
                rent.getTitle(),
                rent.getAuthor(),
                rent.getPublisher(),
                rent.getCreatedDate(),
                rent.getModifiedDate()
        );
    }
}
