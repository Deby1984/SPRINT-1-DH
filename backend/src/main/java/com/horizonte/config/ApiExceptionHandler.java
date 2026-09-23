package com.horizonte.config;

import com.horizonte.product.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({DuplicateProductException.class, IllegalArgumentException.class})
    ResponseEntity<Map<String,String>> badRequest(RuntimeException ex) { return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage())); }
    @ExceptionHandler(ProductNotFoundException.class)
    ResponseEntity<Map<String,String>> notFound(ProductNotFoundException ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage())); }
}
