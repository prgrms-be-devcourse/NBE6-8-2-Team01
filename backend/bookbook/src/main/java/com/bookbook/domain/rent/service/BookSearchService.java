package com.bookbook.domain.rent.service;

import com.bookbook.domain.rent.dto.BookSearchResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookSearchService {

    @Value("${aladin.ttbkey}")
    private String ttbKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 알라딘 API를 호출해 책을 검색하고 결과를 리스트로 반환.
    public List<BookSearchResponseDto> searchBooks(String query, int start){
        // 알라딘 API URL 생성
        String apiUrl = UriComponentsBuilder.fromHttpUrl("http://www.aladin.co.kr/ttb/api/ItemSearch.aspx")
                .queryParam("ttbkey", ttbKey)
                .queryParam("Query", query)
                .queryParam("QueryType", "Title")
                .queryParam("MaxResults", 10)
                .queryParam("start", start)
                .queryParam("SearchTarget", "Book")
                .queryParam("Output", "JS")
                .queryParam("Version", "20131101")
                .build()
                .toUriString();

        String jsonResponse = restTemplate.getForObject(apiUrl, String.class);

        List<BookSearchResponseDto> books = new ArrayList<>();
        try{
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode itemNode = root.path("item");

            if(itemNode.isArray()){
                for(JsonNode item : itemNode){
                    String title = item.path("title").asText("");
                    String author = item.path("author").asText("");
                    String publisher = item.path("publisher").asText("");
                    String pubDate = item.path("pubDate").asText(""); // 필드명 수정: publishDate -> pubDate
                    String cover = item.path("cover").asText("");
                    String description = item.path("description").asText(""); // description 필드 추가
                    String categoryName = item.path("categoryName").asText(""); // categoryName 필드 추가

                    // 저자 정보 가공 : "지은이, 옮긴이, 감수 등 제거"
                    author = author.replaceAll("\\(지은이\\)|\\(옮긴이\\)|\\(감수\\)", "").trim();

                    // 카테고리 정보 가공: "국내도서>과학>기초과학/교양과학" -> "기초과학/교양과학" (가장 마지막 카테고리)
                    String category = "";
                    if (!categoryName.isEmpty()) {
                        String[] categories = categoryName.split(">");
                        if (categories.length > 0) {
                            category = categories[categories.length - 1].trim();
                        }
                    }

                    // DTO 생성 시 추가된 필드들 포함
                    books.add(new BookSearchResponseDto(title, author, publisher, pubDate, category, description, cover));
                }
            }
        } catch (Exception e) {
            e.printStackTrace(); // 스택 트레이스 출력
            throw new RuntimeException("알라딘 API 응답 파싱 중 오류 발생: " + e.getMessage(), e); // 더 명확한 메시지
        }
        return books;
    }



}
