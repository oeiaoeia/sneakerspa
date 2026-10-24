package com.sneakerspa.controller;

import com.sneakerspa.dto.AddOnDto;
import com.sneakerspa.dto.ServiceDto;
import com.sneakerspa.service.CleaningServiceCatalog;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ServiceController {

    private final CleaningServiceCatalog serviceCatalog;

    public ServiceController(CleaningServiceCatalog serviceCatalog) {
        this.serviceCatalog = serviceCatalog;
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        return ResponseEntity.ok(serviceCatalog.getAllServices());
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceDto> getService(@PathVariable String id) {
        return ResponseEntity.ok(serviceCatalog.getServiceById(id));
    }

    @GetMapping("/services/compare")
    public ResponseEntity<List<ServiceDto>> compareServices(
            @RequestParam String first,
            @RequestParam String second
    ) {
        return ResponseEntity.ok(serviceCatalog.compareServices(first, second));
    }

    @GetMapping("/addons")
    public ResponseEntity<List<AddOnDto>> getAllAddOns() {
        return ResponseEntity.ok(serviceCatalog.getAllAddOns());
    }
}
