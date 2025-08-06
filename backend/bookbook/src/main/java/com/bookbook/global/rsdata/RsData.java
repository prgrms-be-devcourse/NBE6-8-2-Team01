package com.bookbook.global.rsdata;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * API 응답 공통 형식
 */
@Getter
@AllArgsConstructor
public class RsData<T> {

    @JsonProperty("resultCode")
    private String resultCode;
    
    @JsonProperty("msg")
    private String msg;
    
    @JsonProperty("data")
    private T data;
    
    @JsonProperty("statusCode")
    private int statusCode;

    public RsData(String resultCode, String msg, T data) {
        this.resultCode = resultCode;
        this.msg = msg;
        this.data = data;
        this.statusCode = Integer.parseInt(resultCode.split("-", 2)[0]);
    }

    @JsonProperty("success")
    public boolean isSuccess() {
        return resultCode.startsWith("200");
    }

    public boolean isFail() {
        return !isSuccess();
    }

    // 성공 응답 생성 메서드
    public static <T> RsData<T> of(String resultCode, String msg, T data) {
        return new RsData<>(resultCode, msg, data);
    }

    // 실패 응답 생성 메서드
    public static <T> RsData<T> of(String resultCode, String msg) {
        return new RsData<>(resultCode, msg, null);
    }
}