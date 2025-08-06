package com.bookbook.global.exception;

import com.bookbook.global.rsdata.RsData;

public class ServiceException extends RuntimeException {
    private final String resultCode;
    private final String msg;

    public ServiceException(String resultCode, String msg) {
        super(resultCode + " : " + msg);
        this.resultCode = resultCode;
        this.msg = msg;
    }

    // 단순 메시지만으로 생성하는 생성자 추가
    public ServiceException(String msg) {
        this("400", msg);
    }
    
    public RsData<Void> getRsData() {
        return new RsData<>(resultCode, msg, null);
    }
}