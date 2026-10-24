package com.sneakerspa.controller;

import com.sneakerspa.dto.AddressDto;
import com.sneakerspa.dto.UserProfileDto;
import com.sneakerspa.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> body
    ) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        Boolean notifications = (Boolean) body.get("notificationsEnabled");
        Boolean darkMode = (Boolean) body.get("darkModeEnabled");

        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), name, email, notifications, darkMode));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressDto>> getAddresses(Authentication authentication) {
        return ResponseEntity.ok(userService.getAddresses(authentication.getName()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressDto> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressDto dto
    ) {
        return ResponseEntity.ok(userService.addAddress(authentication.getName(), dto));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<AddressDto> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressDto dto
    ) {
        return ResponseEntity.ok(userService.updateAddress(authentication.getName(), id, dto));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        userService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/addresses/{id}/default")
    public ResponseEntity<Void> setDefaultAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        userService.setDefaultAddress(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/subscription/toggle")
    public ResponseEntity<UserProfileDto> toggleSubscription(Authentication authentication) {
        return ResponseEntity.ok(userService.toggleSubscription(authentication.getName()));
    }
}
