package com.sneakerspa.repository;

import com.sneakerspa.entity.PromoCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCodeEntity, String> {
    Optional<PromoCodeEntity> findByCodeIgnoreCase(String code);
}
