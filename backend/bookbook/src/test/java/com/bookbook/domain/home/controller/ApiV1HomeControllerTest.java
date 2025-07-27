package com.bookbook.domain.home.controller;

import com.bookbook.domain.book.entity.Book;
import com.bookbook.domain.book.enums.BookStatus;
import com.bookbook.domain.book.repository.BookRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ApiV1HomeController 통합 테스트")
class ApiV1HomeControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // 테스트용 사용자 생성
        testUser = User.builder()
                .username("testuser")
                .password("password")
                .nickname("테스트유저")
                .email("test@test.com")
                .address("서울특별시 성북구 안암동 123-45")
                .role(Role.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();
        testUser = userRepository.save(testUser);

        // 테스트용 도서 생성
        for (int i = 1; i <= 7; i++) {
            Book book = Book.builder()
                    .title("테스트 도서 " + i)
                    .author("작가" + i)
                    .bookImage("image" + i + ".jpg")
                    .region("성북구")
                    .status(BookStatus.AVAILABLE)
                    .ownerId(testUser.getId())
                    .build();
            bookRepository.save(book);
        }

        // 이미지 없는 도서 생성 (제외되어야 함)
        Book bookWithoutImage = Book.builder()
                .title("이미지 없는 도서")
                .author("작가")
                .region("성북구")
                .status(BookStatus.AVAILABLE)
                .ownerId(testUser.getId())
                .build();
        bookRepository.save(bookWithoutImage);
    }

    @Test
    @DisplayName("로그인한 사용자의 메인페이지 데이터 조회 API 테스트")
    void getHomeData_withUserId() throws Exception {
        mockMvc.perform(get("/api/v1/home")
                        .param("userId", testUser.getId().toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("성북구에 최근 등록된 도서"))
                .andExpect(jsonPath("$.data.region").value("성북구"))
                .andExpect(jsonPath("$.data.bookImages", hasSize(5))) // 최대 5개
                .andExpect(jsonPath("$.data.totalBooksInRegion").value(7));
    }

    @Test
    @DisplayName("비로그인 사용자의 메인페이지 데이터 조회 API 테스트")
    void getHomeData_withoutUserId() throws Exception {
        mockMvc.perform(get("/api/v1/home"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("최근 등록된 도서"))
                .andExpect(jsonPath("$.data.region").value("전체"))
                .andExpect(jsonPath("$.data.bookImages", hasSize(5))) // 최대 5개
                .andExpect(jsonPath("$.data.totalBooksInRegion").value(7));
    }
}
