package com.hirely.Exception;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
        // VALIDATION ERRORS
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationException(
                MethodArgumentNotValidException exception,
                HttpServletRequest request
        ) {
                String message = exception.getBindingResult().getFieldErrors().stream()
                        .map(error -> error.getField()+ ": "+ error.getDefaultMessage())
                        .collect(Collectors.joining(", "));

                ErrorResponse response = createErrorResponse(HttpStatus.BAD_REQUEST, message, request);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // INVALID PATH VARIABLE / REQUEST PARAMETER
        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ErrorResponse> handleTypeMismatchException(
                MethodArgumentTypeMismatchException exception,
                HttpServletRequest request
        ) {
                String message = "Invalid value for parameter: "+ exception.getName();
                ErrorResponse response = createErrorResponse(HttpStatus.BAD_REQUEST,message,request);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // ILLEGAL ARGUMENT
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
                IllegalArgumentException exception,
                HttpServletRequest request
        ) {
                ErrorResponse response = createErrorResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // RUNTIME EXCEPTION
        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntimeException(
                RuntimeException exception,
                HttpServletRequest request
        ) {
                String message = exception.getMessage();
                if (message == null || message.isBlank()) {
                        message = "An unexpected error occurred";
                }
                ErrorResponse response = createErrorResponse(HttpStatus.BAD_REQUEST, message, request);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // UNEXPECTED EXCEPTION
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleException(
                Exception exception,
                HttpServletRequest request
        ) {
                ErrorResponse response = createErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "An unexpected server error occurred",
                        request
                );

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        // CREATE ERROR RESPONSE
        private ErrorResponse createErrorResponse(
                HttpStatus status,
                String message,
                HttpServletRequest request
        ) {
                return new ErrorResponse(
                        LocalDateTime.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI()
                );
        }
}