package com.bookbook.global.rsdata;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RsData<T> {
    private String resultCode;
    private String msg;
    private T data;
    
    public static <T> RsData<T> of(String resultCode, String msg, T data) {
        return new RsData<>(resultCode, msg, data);
    }
    
    public static <T> RsData<T> of(String resultCode, String msg) {
        return new RsData<>(resultCode, msg, null);
    }
    
    public boolean isSuccess() {
        return resultCode.startsWith("2");
    }
    
    public boolean isFail() {
        return !isSuccess();
    }
}
