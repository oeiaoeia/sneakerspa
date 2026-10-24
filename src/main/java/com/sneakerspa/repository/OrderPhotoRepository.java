package com.sneakerspa.repository;

import com.sneakerspa.entity.OrderPhotoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderPhotoRepository extends JpaRepository<OrderPhotoEntity, Long> {

    List<OrderPhotoEntity> findByOrderId(Long orderId);

    @Query("SELECT p FROM OrderPhotoEntity p WHERE (p.order.id = :orderId OR p.order.trackingNumber = :trackingNumber) AND LOWER(p.slotLabel) = LOWER(:angle)")
    Optional<OrderPhotoEntity> findByOrderIdOrTrackingNumberAndAngle(
            @Param("orderId") Long orderId,
            @Param("trackingNumber") String trackingNumber,
            @Param("angle") String angle
    );
}
