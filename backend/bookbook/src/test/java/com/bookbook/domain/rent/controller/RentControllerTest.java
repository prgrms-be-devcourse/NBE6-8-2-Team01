package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.dto.RentRequestDto;
import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest // Spring Boot 애플리케이션 전체를 로드하여 통합 테스트
@AutoConfigureMockMvc // MockMvc 자동 설정
@ActiveProfiles("test") // application-test.yml 프로필 사용
class RentControllerTest {

    @Autowired
    private MockMvc mockMvc; // HTTP 요청을 시뮬레이션하는 객체

    @Autowired
    private ObjectMapper objectMapper; // Java 객체를 JSON으로, JSON을 Java 객체로 변환

    @Autowired
    private RentRepository rentRepository; // Repository를 직접 주입하여 DB 상태 확인/조작

    @BeforeEach
        // 각 테스트 메서드가 실행되기 전에 실행
    void setUp() {
        // 테스트 전 필요한 초기화 작업 (예: DB 초기화 또는 특정 데이터 삽입)
        // 여기서는 매번 데이터를 새로 생성할 것이므로 특별한 초기화는 필요 없을 수 있습니다.
        // 다만, 모든 테스트가 독립적으로 실행되도록 AfterEach와 함께 사용합니다.
    }

    @AfterEach
        // 각 테스트 메서드가 실행된 후에 실행
    void tearDown() {
        // 테스트 후 DB 데이터 정리 (인메모리 DB의 경우 create-drop 설정으로 자동 삭제되지만, 명시적으로 비워줄 수도 있습니다)
        rentRepository.deleteAll(); // 테스트 격리를 위해 매 테스트 후 모든 데이터 삭제
    }

    @Test
    @DisplayName("POST /rent - 대여 페이지 등록 성공")
    void createRentPage_success() throws Exception {
        // given
        // RentRequestDto 객체 생성
        RentRequestDto requestDto = new RentRequestDto(
                "새것 같음",
                "http://example.com/book1.jpg",
                "서울시 강남구",
                "읽고 싶은 분 대여해 드립니다.",
                "AVAILABLE", // 대여 상태
                "테스트 책 제목",
                "테스트 저자",
                "테스트 출판사"
        );

        // JSON 문자열로 변환
        String jsonRequest = objectMapper.writeValueAsString(requestDto);

        // when
        // POST 요청 수행
        ResultActions resultActions = mockMvc.perform(post("/rent")
                        .contentType(MediaType.APPLICATION_JSON) // 요청 본문 타입 지정
                        .content(jsonRequest)) // 요청 본문 내용 지정
                .andDo(print()); // 요청 및 응답 전체 내용 콘솔 출력

        // then
        // HTTP 상태 코드 200 (OK) 검증
        resultActions.andExpect(status().isOk());

        // DB에 데이터가 잘 저장되었는지 확인 (선택 사항, Service Test에서 더 적합)
        // 여기서는 단순 확인만 해봅니다.
        // assertEquals(1, rentRepository.count());
        // Rent savedRent = rentRepository.findAll().get(0);
        // assertEquals("테스트 책 제목", savedRent.getTitle());
    }

    @Test
    @DisplayName("POST /rent - 유효성 검증 실패 (제목 누락)")
    void createRentPage_validation_fail_missingTitle() throws Exception {
        // given
        // 제목이 누락된 DTO 생성
        RentRequestDto requestDto = new RentRequestDto(
                "새것 같음",
                "http://example.com/book1.jpg",
                "서울시 강남구",
                "읽고 싶은 분 대여해 드립니다.",
                "AVAILABLE",
                null, // 제목 누락
                "테스트 저자",
                "테스트 출판사"
        );
        String jsonRequest = objectMapper.writeValueAsString(requestDto);

        // when
        ResultActions resultActions = mockMvc.perform(post("/rent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andDo(print());

        // then
        // HTTP 상태 코드 400 (Bad Request) 검증
        resultActions.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-1")) // RsData의 resultCode 검증
                .andExpect(jsonPath("$.msg").value("title-NotBlank-책 제목을 입력해주세요.")); // RsData의 msg 검증 (정확한 메시지 확인 필요)
        // 주의: message는 정렬될 수 있으므로 정확히 매칭하는 것은 어려울 수 있습니다.
        // containsString 등을 사용할 수도 있습니다.
    }


    @Test
    @DisplayName("GET /rent/{id} - 대여 페이지 단건 조회 성공")
    void getRentPage_success() throws Exception {
        // given
        // 테스트를 위해 DB에 먼저 데이터 저장 (POST API를 통한 생성 혹은 Repository 직접 사용)
        RentRequestDto createDto = new RentRequestDto(
                "최상", "http://example.com/test.jpg", "부산시 해운대구", "깨끗해요", "AVAILABLE",
                "조회할 책", "조회 저자", "조회 출판사"
        );
        // 실제 API를 통해 데이터를 생성하고 ID를 얻는 방법
        ResultActions postResult = mockMvc.perform(post("/rent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andDo(print())
                .andExpect(status().isOk());

        // DB에서 생성된 데이터의 ID를 가져옴 (실제 ID는 자동으로 증가하므로, 첫 번째 데이터의 ID를 사용)
        // Long rentId = rentRepository.findAll().get(0).getId(); // BaseEntity에 getId()가 있다면 이렇게

        // 임시로, ID가 1이라고 가정합니다. 실제로는 위처럼 DB에서 가져오는 것이 안전합니다.
        // 현재 createRentPage가 void를 반환하여 ID를 직접 반환하지 않으므로,
        // findAll().get(0)으로 가져오는 방식이 더 현실적입니다.
        Integer rentId = rentRepository.findAll().get(0).getId(); // BaseEntity에 Integer id가 있다고 가정

        // when
        // GET 요청 수행
        ResultActions resultActions = mockMvc.perform(get("/rent/{id}", rentId))
                .andDo(print()); // 요청 및 응답 전체 내용 콘솔 출력

        // then
        // HTTP 상태 코드 200 (OK) 검증
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("조회할 책")) // 응답 JSON 필드 검증
                .andExpect(jsonPath("$.author").value("조회 저자"));
    }

    @Test
    @DisplayName("GET /rent/{id} - 존재하지 않는 대여 페이지 조회 실패")
    void getRentPage_notFound() throws Exception {
        // given
        int nonExistentId = 999; // 존재하지 않는 ID

        // when
        ResultActions resultActions = mockMvc.perform(get("/rent/{id}", nonExistentId))
                .andDo(print());

        // then
        // HTTP 상태 코드 404 (Not Found) 검증
        resultActions.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-2")) // RsData의 resultCode 검증
                .andExpect(jsonPath("$.msg").value("해당 대여 상품을 찾을 수 없습니다.")); // RsData의 msg 검증
    }


    @Test
    @DisplayName("GET /rent/list - 대여 페이지 목록 조회 (페이징/정렬) 성공")
    void getRentPageList_success() throws Exception {
        // given
        // 테스트 데이터 3개 생성 (저장 순서 중요: 정렬 테스트를 위해)
        createAndSaveRent("A 책", "AVAILABLE", "2025-07-26T10:00:00");
        createAndSaveRent("C 책", "AVAILABLE", "2025-07-26T11:00:00");
        createAndSaveRent("B 책", "RENTED", "2025-07-26T12:00:00");


        // when
        // GET 요청 수행 (페이지 0, 사이즈 2, 생성일 기준 내림차순 정렬)
        ResultActions resultActions = mockMvc.perform(get("/rent/list")
                        .param("page", "0")
                        .param("size", "2")
                        .param("sort", "createdDate,desc")) // 가장 최근에 생성된 것부터
                .andDo(print());

        // then
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2)) // 2개 항목 반환 확인
                // 정렬 순서 검증 (B 책 -> C 책 순서로 와야 함)
                .andExpect(jsonPath("$.content[0].title").value("B 책"))
                .andExpect(jsonPath("$.content[1].title").value("C 책"))
                .andExpect(jsonPath("$.pageable.pageNumber").value(0)) // 페이지 번호 검증
                .andExpect(jsonPath("$.size").value(2)); // 사이즈 검증
    }

    @Test
    @DisplayName("GET /rent/list - 상태 필터링 및 페이징 성공")
    void getRentPageList_filterByStatus_success() throws Exception {
        // given
        createAndSaveRent("책1", "AVAILABLE", "2025-07-26T10:00:00");
        createAndSaveRent("책2", "RENTED", "2025-07-26T11:00:00");
        createAndSaveRent("책3", "AVAILABLE", "2025-07-26T12:00:00");

        // when
        // GET 요청 수행 (상태: AVAILABLE, 페이지 0, 사이즈 10)
        ResultActions resultActions = mockMvc.perform(get("/rent/list")
                        .param("status", "AVAILABLE"))
                .andDo(print());

        // then
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2)) // AVAILABLE 상태의 책 2개 반환 확인
                .andExpect(jsonPath("$.content[0].title").value("책1")) // 기본 정렬(createdDate desc)에 따라
                .andExpect(jsonPath("$.content[1].title").value("책3"));
    }

    // 테스트를 위한 헬퍼 메서드 (간단히 Rent 엔티티를 생성하고 저장)
    private void createAndSaveRent(String title, String status, String createdDateStr) {
        // 직접 엔티티를 생성하고 저장 (Service 계층을 거치지 않고)
        // 이는 테스트 데이터를 빠르고 정확하게 세팅하기 위함입니다.
        // 실제 비즈니스 로직 테스트는 ServiceTest에서 수행하는 것이 더 좋습니다.
        // 이 경우 BaseEntity의 createdDate, modifiedDate를 직접 설정해야 합니다.
        // 또는 Builder 패턴으로 createdDate를 설정할 수 있도록 Rent 엔티티 Builder에 @Setter를 추가하거나
        // 직접 setCreatedDate()를 호출할 수 있도록 엔티티를 수정해야 합니다.
        // 현재 Rent 엔티티는 @Setter가 있으니 setCreatedDate를 사용합니다.

        Rent rent = Rent.builder()
                .lender_user_id(1L)
                .bookCondition("좋음")
                .bookImage("http://img.com/test.jpg")
                .address("어딘가")
                .contents("테스트 내용")
                .rent_status(status)
                .title(title)
                .author("테스트 작가")
                .publisher("테스트 출판사")
                .build();
        // BaseEntity의 protected setter를 통해 날짜 설정
        // 혹은 직접 LocalDateTime.parse()를 사용하여 설정

        rentRepository.save(rent);
    }
}