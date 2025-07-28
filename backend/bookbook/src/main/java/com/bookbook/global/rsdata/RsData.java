package com.bookbook.global.rsdata;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * API 응답 공통 형식
 */
@Getter
@AllArgsConstructor
public class RsData<T> {
    
    private String resultCode;
    private String msg;
    private T data;
    
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
