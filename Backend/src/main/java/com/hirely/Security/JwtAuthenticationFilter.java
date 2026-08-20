package com.hirely.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.hirely.Entity.User;
import com.hirely.Repository.UserRepository;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
        private final JwtService jwtService;
        private final UserRepository userRepository;

        public JwtAuthenticationFilter(
                JwtService jwtService,
                UserRepository userRepository
        ) {
                this.jwtService = jwtService;
                this.userRepository = userRepository;
        }

        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain
        )throws ServletException, IOException {
                String authHeader = request.getHeader("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        filterChain.doFilter(request, response);
                        return;
                }
                String token = authHeader.substring(7);
                try {
                        if (jwtService.isTokenValid(token)) {
                                String email = jwtService.extractEmail(token);
                                User user = userRepository.findByEmail(email).orElse(null);
                                if (user != null) {
                                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());
                                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                                user.getEmail(),
                                                null,
                                                Collections.singletonList(authority)
                                        );
                                        SecurityContextHolder.getContext().setAuthentication(authentication);
                                }
                        }
                } catch (Exception e) {
                        System.out.println("JWT authentication failed: "+ e.getMessage());
                }
                filterChain.doFilter(request, response);
        }
}