package com.sneakerspa.controller;

import com.sneakerspa.dto.OrderDto;
import com.sneakerspa.dto.StatusUpdateRequest;
import com.sneakerspa.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderService orderService;

    public AdminController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }

    @PostMapping("/orders/{trackingNumber}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable String trackingNumber,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(
                trackingNumber,
                request.getNewStatus(),
                request.getNotes()
        ));
    }
}
