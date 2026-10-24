package com.sneakerspa.repository;

import com.sneakerspa.entity.OrderEntity;
import com.sneakerspa.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    Optional<OrderEntity> findByTrackingNumber(String trackingNumber);

    List<OrderEntity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT o FROM OrderEntity o WHERE o.customer.id = :customerId AND o.currentStatus NOT IN (:terminalStatuses) ORDER BY o.createdAt DESC")
    List<OrderEntity> findActiveOrders(@Param("customerId") Long customerId, @Param("terminalStatuses") List<OrderStatus> terminalStatuses);

    @Query("SELECT o FROM OrderEntity o WHERE o.customer.id = :customerId AND o.currentStatus IN (:terminalStatuses) ORDER BY o.createdAt DESC")
    List<OrderEntity> findPastOrders(@Param("customerId") Long customerId, @Param("terminalStatuses") List<OrderStatus> terminalStatuses);

    long countByCustomerIdAndCurrentStatusNotIn(Long customerId, List<OrderStatus> terminalStatuses);

    long countByCustomerId(Long customerId);

    List<OrderEntity> findAllByOrderByCreatedAtDesc();
}
