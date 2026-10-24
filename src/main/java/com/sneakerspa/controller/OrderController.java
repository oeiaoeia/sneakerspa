package com.sneakerspa.controller;

import com.sneakerspa.dto.*;
import com.sneakerspa.entity.OrderPhotoEntity;
import com.sneakerspa.entity.UserEntity;
import com.sneakerspa.exception.BadRequestException;
import com.sneakerspa.service.AuthService;
import com.sneakerspa.service.OrderService;
import com.sneakerspa.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;
    private final PricingService pricingService;

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

    /**
     * Serves order photos stored as BLOBs in the database.
     * Accessible by Order ID (or tracking number) and angle label (e.g. front, back, sole, side).
     */
    @GetMapping("/{id}/photos/{angle}")
    public ResponseEntity<byte[]> getOrderPhoto(
            @PathVariable("id") String id,
            @PathVariable("angle") String angle
    ) {
        OrderPhotoEntity photo = orderService.getOrderPhoto(id, angle);
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(photo.getContentType());
        } catch (Exception e) {
            mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + photo.getOriginalFilename() + "\"")
                .body(photo.getData());
    }

    /**
     * Upload photo for an order.
     * Enforces:
     * - Limit uploads to 2 MB
     * - Image types only (image/jpeg, image/png, image/webp)
     * - Stored as BLOB in database (zero disk writes)
     */
    @PostMapping("/{id}/photos/{angle}")
    public ResponseEntity<Map<String, Object>> uploadOrderPhotoByAngle(
            @PathVariable("id") String id,
            @PathVariable("angle") String angle,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        validatePhotoUpload(file);

        int slotNumber = switch (angle.toLowerCase()) {
            case "front" -> 1;
            case "back" -> 2;
            case "sole" -> 3;
            case "side" -> 4;
            default -> 1;
        };
        String slotLabel = angle.substring(0, 1).toUpperCase() + angle.substring(1).toLowerCase();

        OrderPhotoEntity photo = orderService.addPhotoToOrder(
                id,
                slotNumber,
                slotLabel,
                file.getBytes(),
                file.getContentType(),
                file.getOriginalFilename()
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("photoUrl", "/api/orders/" + id + "/photos/" + angle.toLowerCase());
        resp.put("slotNumber", photo.getSlotNumber());
        resp.put("slotLabel", photo.getSlotLabel());
        resp.put("originalFilename", photo.getOriginalFilename());
        resp.put("fileSize", photo.getFileSize());
        resp.put("status", "UPLOADED_TO_DB_BLOB");

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<Map<String, Object>> uploadOrderPhoto(
            @PathVariable("id") String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "slotNumber", defaultValue = "1") int slotNumber,
            @RequestParam(value = "slotLabel", defaultValue = "Photo") String slotLabel
    ) throws IOException {
        validatePhotoUpload(file);

        OrderPhotoEntity photo = orderService.addPhotoToOrder(
                id,
                slotNumber,
                slotLabel,
                file.getBytes(),
                file.getContentType(),
                file.getOriginalFilename()
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("photoUrl", "/api/orders/" + id + "/photos/" + slotLabel.toLowerCase());
        resp.put("slotNumber", photo.getSlotNumber());
        resp.put("slotLabel", photo.getSlotLabel());
        resp.put("originalFilename", photo.getOriginalFilename());
        resp.put("fileSize", photo.getFileSize());
        resp.put("status", "UPLOADED_TO_DB_BLOB");

        return ResponseEntity.ok(resp);
    }

    private void validatePhotoUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }
        // Limit upload to 2 MB
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 2 MB limit (uploaded size: " + (file.getSize() / 1024) + " KB)");
        }
        // Image types only
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Only image uploads are permitted (e.g. image/jpeg, image/png, image/webp)");
        }
    }
}
