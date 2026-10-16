package com.horizonte.security;

import com.horizonte.user.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(@Value("${app.jwt.secret:}") String configuredSecret,
                      @Value("${app.jwt.expiration-minutes:120}") long expirationMinutes) {
        this.expirationMinutes = expirationMinutes;
        if (configuredSecret == null || configuredSecret.isBlank()) {
            byte[] randomSecret = new byte[32];
            new SecureRandom().nextBytes(randomSecret);
            this.key = Keys.hmacShaKeyFor(randomSecret);
            log.warn("APP_JWT_SECRET no está configurada: se usará una clave temporal hasta reiniciar la aplicación.");
        } else {
            byte[] secret = configuredSecret.getBytes(StandardCharsets.UTF_8);
            if (secret.length < 32) throw new IllegalStateException("APP_JWT_SECRET debe tener al menos 32 caracteres.");
            this.key = Keys.hmacShaKeyFor(secret);
        }
    }

    public String generate(AppUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("ver", user.getTokenVersion())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    public String subject(String token) {
        return claims(token).getSubject();
    }

    public boolean isValid(String token, AppUser user) {
        Claims claims = claims(token);
        Object versionClaim = claims.get("ver");
        return user.getEmail().equalsIgnoreCase(claims.getSubject())
                && claims.getExpiration().after(new Date())
                && versionClaim instanceof Number version
                && version.longValue() == user.getTokenVersion();
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
