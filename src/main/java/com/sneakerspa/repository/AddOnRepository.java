package com.sneakerspa.repository;

import com.sneakerspa.entity.AddOnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddOnRepository extends JpaRepository<AddOnEntity, String> {
}
