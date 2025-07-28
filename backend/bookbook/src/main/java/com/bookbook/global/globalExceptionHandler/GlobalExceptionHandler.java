package com.bookbook.global.globalExceptionHandler;

import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.exception.ServiceException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Comparator;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<RsData<Void>> handle(NoSuchElementException ex) {
        return new ResponseEntity<>(
                new RsData<>(
                        "404-1",
                        "해당 데이터가 존재하지 않습니다.",
                        null
                ),
                NOT_FOUND
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<RsData<Void>> handle(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations()
                .stream()
                .map(violation -> {
                    String field = violation.getPropertyPath().toString().split("\\.", 2)[1];
                    String[] messageTemplateBits = violation.getMessageTemplate()
                            .split("\\.");
                    String code = messageTemplateBits[messageTemplateBits.length - 2];
                    String _message = violation.getMessage();

                    return "%s-%s-%s".formatted(field, code, _message);
                })
                .sorted(Comparator.comparing(String::toString))
                .collect(Collectors.joining("\n"));

        return new ResponseEntity<>(
                new RsData<>(
                        "400-1",
                        message,
                        null
                ),
                BAD_REQUEST
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RsData<Void>> handle(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .filter(error -> error instanceof FieldError)
                .map(error -> (FieldError) error)
                .map(error -> error.getField() + "-" + error.getCode() + "-" + error.getDefaultMessage())
                .sorted(Comparator.comparing(String::toString))
                .collect(Collectors.joining("\n"));

        return new ResponseEntity<>(
                new RsData<>(
                        "400-1",
                        message
                        , null
                ),
                BAD_REQUEST
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RsData<Void>> handle(HttpMessageNotReadableException ex) {
        return new ResponseEntity<>(
                new RsData<>(
                        "400-1",
                        "요청 본문이 올바르지 않습니다."
                        ,null
                ),
                BAD_REQUEST
        );
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<RsData<Void>> handle(MissingRequestHeaderException ex) {
        return new ResponseEntity<>(
                new RsData<>(
                        "400-1",
                        "%s-%s-%s".formatted(
                                ex.getHeaderName(),
                                "NotBlank",
                                ex.getLocalizedMessage()
                        ),
                        null
                ),
                BAD_REQUEST
        );
    }

    @ExceptionHandler(ServiceException.class)
    public RsData<Void> handle(ServiceException ex, HttpServletResponse response) {
        RsData<Void> rsData = ex.getRsData();

        response.setStatus(rsData.getStatusCode());

        return rsData;
    }
}