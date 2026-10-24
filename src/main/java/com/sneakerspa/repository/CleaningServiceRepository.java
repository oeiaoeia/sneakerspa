package com.sneakerspa.repository;

import com.sneakerspa.model.service.CleaningService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CleaningServiceRepository extends JpaRepository<CleaningService, String> {
}
