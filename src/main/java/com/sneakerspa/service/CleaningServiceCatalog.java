package com.sneakerspa.service;

import com.sneakerspa.dto.AddOnDto;
import com.sneakerspa.dto.ServiceDto;
import com.sneakerspa.entity.AddOnEntity;
import com.sneakerspa.entity.CleaningServiceEntity;
import com.sneakerspa.exception.ResourceNotFoundException;
import com.sneakerspa.model.service.CleaningService;
import com.sneakerspa.model.service.ServiceFactory;
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
        CleaningServiceEntity entity = serviceRepository.findById(id)
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

    public ServiceDto toDto(CleaningServiceEntity e) {
        ServiceDto dto = new ServiceDto();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setPrice("$" + e.getBasePrice().intValue());
        dto.setRawPrice(e.getBasePrice());
        dto.setTime(e.getDuration());
        dto.setDescription(e.getDescription());
        dto.setRating(e.getRating());
        dto.setReviews(e.getReviewsCount());
        dto.setPopular(e.isPopular());
        dto.setIcon(e.getIconName());
        dto.setColor(e.getColorGradient());
        dto.setIncludes(e.getIncludes());
        return dto;
    }
}
