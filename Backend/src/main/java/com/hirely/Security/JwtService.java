package com.hirely.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
        /*
         * =========================================================
         * JWT CONFIGURATION
         * =========================================================
         *
         * Set this environment variable:
         *
         * JWT_SECRET=your-long-random-secret-at-least-32-characters
         *
         * The secret must be at least 32 bytes for HS256.
         *
         * DO NOT commit the secret to GitHub.
         */
        private final String secretKey;

        /*
         * Token expiration:
         *
         * 24 hours
         */
        private final long expirationTime = 1000L * 60 * 60 * 24;

        public JwtService() {
                String environmentSecret = System.getenv("JWT_SECRET");
                if (environmentSecret == null || environmentSecret.isBlank()) {
                        throw new IllegalStateException("JWT_SECRET environment variable is not configured");
                }

                if (environmentSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
                        throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes");
                }
                this.secretKey = environmentSecret;
        }

        // SIGNING KEY
        private SecretKey getSigningKey() {
                return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        }

        // GENERATE TOKEN
        public String generateToken(String email, String role) {
                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException("Email is required");
                }

                if (role == null || role.isBlank()) {
                        throw new IllegalArgumentException("Role is required");
                }

                Date issuedAt = new Date();
                Date expiration = new Date(System.currentTimeMillis()+ expirationTime);
                return Jwts.builder()
                        .subject(email)
                        .claim("role",role)
                        .issuedAt(issuedAt)
                        .expiration(expiration)
                        .signWith(getSigningKey())
                        .compact();
        }

        // EXTRACT EMAIL
        public String extractEmail(String token) {
                Claims claims = Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
                return claims.getSubject();
        }

        // VALIDATE TOKEN
        public boolean isTokenValid(String token) {
                if (token == null || token.isBlank()) {
                        return false;
                }

                try {
                        Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
                        return true;
                } catch (Exception e) {
                        return false;
                }
        }
}