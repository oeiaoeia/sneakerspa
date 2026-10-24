package com.sneakerspa.repository;

import com.sneakerspa.entity.CleaningServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CleaningServiceRepository extends JpaRepository<CleaningServiceEntity, String> {
}
