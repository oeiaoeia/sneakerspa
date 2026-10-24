package com.sneakerspa.service;

import com.sneakerspa.dto.AuthRequest;
import com.sneakerspa.dto.AuthResponse;
import com.sneakerspa.dto.RegisterRequest;
import com.sneakerspa.entity.Role;
import com.sneakerspa.entity.UserEntity;
import com.sneakerspa.exception.BadRequestException;
import com.sneakerspa.exception.UnauthorizedException;
import com.sneakerspa.repository.UserRepository;
import com.sneakerspa.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }

        UserEntity user = new UserEntity(
                req.getName().trim(),
                email,
                passwordEncoder.encode(req.getPassword()),
                Role.CUSTOMER
        );
        user.setLoyaltyPoints(1250);
        user.setHasActiveSubscription(true);

        UserEntity saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name());

        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name());
    }

    public AuthResponse login(AuthRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));
    }
}
