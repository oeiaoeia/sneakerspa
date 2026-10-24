package com.sneakerspa.controller;

import com.sneakerspa.dto.*;
import com.sneakerspa.entity.UserEntity;
import com.sneakerspa.service.AuthService;
import com.sneakerspa.service.OrderService;
import com.sneakerspa.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;
    private final PricingService pricingService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public OrderController(OrderService orderService, AuthService authService, PricingService pricingService) {
        this.orderService = orderService;
        this.authService = authService;
        this.pricingService = pricingService;
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            Authentication authentication,
            @Valid @RequestBody OrderCreateRequest request
    ) {
        return ResponseEntity.ok(orderService.createOrder(authentication.getName(), request));
    }

    @GetMapping("/active")
    public ResponseEntity<List<OrderDto>> getActiveOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getActiveOrders(authentication.getName()));
    }

    @GetMapping("/past")
    public ResponseEntity<List<OrderDto>> getPastOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getPastOrders(authentication.getName()));
    }

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<OrderDto> getOrder(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(orderService.getOrderByTrackingNumber(trackingNumber));
    }

    @PostMapping("/{trackingNumber}/rate")
    public ResponseEntity<OrderDto> rateOrder(
            Authentication authentication,
            @PathVariable String trackingNumber,
            @Valid @RequestBody RateOrderRequest request
    ) {
        return ResponseEntity.ok(orderService.rateOrder(trackingNumber, authentication.getName(), request.getRating()));
    }

    @PostMapping("/calculate-price")
    public ResponseEntity<Map<String, Object>> calculatePrice(
            Authentication authentication,
            @RequestBody Map<String, Object> payload
    ) {
        @SuppressWarnings("unchecked")
        List<String> serviceIds = (List<String>) payload.getOrDefault("serviceIds", Collections.emptyList());
        @SuppressWarnings("unchecked")
        List<String> addOnIds = (List<String>) payload.getOrDefault("addOnIds", Collections.emptyList());
        String promoCode = (String) payload.get("promoCode");

        UserEntity user = null;
        if (authentication != null && authentication.isAuthenticated()) {
            user = authService.getUserByEmail(authentication.getName());
        }

        PricingService.PricingCalculationResult result =
                pricingService.calculateOrderPricing(serviceIds, addOnIds, promoCode, user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("subtotal", result.subtotal().toIntDollars());
        resp.put("discount", result.discount().toIntDollars());
        resp.put("total", result.total().toIntDollars());
        resp.put("promoApplied", result.promoApplied());
        resp.put("strategyName", result.strategyUsed().getStrategyName());
        resp.put("description", result.strategyUsed().getDescription());

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<Map<String, Object>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "slotNumber", defaultValue = "1") int slotNumber,
            @RequestParam(value = "slotLabel", defaultValue = "Photo") String slotLabel
    ) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            extension = ".jpg";
        }

        String savedFilename = "sneaker_" + UUID.randomUUID() + extension;
        Path targetPath = uploadPath.resolve(savedFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String photoUrl = "/uploads/" + savedFilename;

        Map<String, Object> response = new HashMap<>();
        response.put("photoUrl", photoUrl);
        response.put("originalFilename", originalFilename);
        response.put("fileSize", file.getSize());
        response.put("slotNumber", slotNumber);
        response.put("slotLabel", slotLabel);

        return ResponseEntity.ok(response);
    }
}
