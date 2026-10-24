package com.sneakerspa.controller;

import com.sneakerspa.dto.AuthRequest;
import com.sneakerspa.dto.AuthResponse;
import com.sneakerspa.dto.RegisterRequest;
import com.sneakerspa.entity.UserEntity;
import com.sneakerspa.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        UserEntity user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(new AuthResponse(null, user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
    }
}
