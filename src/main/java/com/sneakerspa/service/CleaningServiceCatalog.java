package com.sneakerspa.service;

import com.sneakerspa.dto.AddOnDto;
import com.sneakerspa.dto.ServiceDto;
import com.sneakerspa.entity.AddOnEntity;
import com.sneakerspa.exception.ResourceNotFoundException;
import com.sneakerspa.model.service.CleaningService;
import com.sneakerspa.repository.AddOnRepository;
import com.sneakerspa.repository.CleaningServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CleaningServiceCatalog {

    private final CleaningServiceRepository serviceRepository;
    private final AddOnRepository addOnRepository;

    public CleaningServiceCatalog(CleaningServiceRepository serviceRepository, AddOnRepository addOnRepository) {
        this.serviceRepository = serviceRepository;
        this.addOnRepository = addOnRepository;
    }

    public List<ServiceDto> getAllServices() {
        return serviceRepository.findAll().stream().map(this::toDto).toList();
    }

    public ServiceDto getServiceById(String id) {
        CleaningService entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cleaning service not found: " + id));
        return toDto(entity);
    }

    public List<AddOnDto> getAllAddOns() {
        return addOnRepository.findAll().stream()
                .map(a -> new AddOnDto(a.getId(), a.getName(), "+$" + a.getPrice().intValue(), a.getPrice()))
                .toList();
    }

    public List<ServiceDto> compareServices(String id1, String id2) {
        return List.of(getServiceById(id1), getServiceById(id2));
    }

    public ServiceDto toDto(CleaningService s) {
        ServiceDto dto = new ServiceDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setPrice("$" + s.getBasePrice().intValue());
        dto.setRawPrice(s.getBasePrice());
        dto.setTime(s.getDuration());
        dto.setDescription(s.getDescription());
        dto.setRating(s.getRating());
        dto.setReviews(s.getReviewsCount());
        dto.setPopular(s.isPopular());
        dto.setIcon(s.getIconName());
        dto.setColor(s.getColorGradient());
        dto.setIncludes(s.getIncludes());
        return dto;
    }
}
