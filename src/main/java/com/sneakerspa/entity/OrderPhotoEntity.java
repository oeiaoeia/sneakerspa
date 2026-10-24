package com.sneakerspa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ============================================================================
 * OOP PRINCIPLE: COMPOSITION
 * Represents one of the 4 photos uploaded for sneaker condition assessment:
 * 1: Front, 2: Back, 3: Sole, 4: Side.
 * ============================================================================
 */
@Entity
@Table(name = "order_photos")
public class OrderPhotoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private OrderEntity order;

    @Column(nullable = false)
    private int slotNumber; // 1, 2, 3, 4

    @Column(nullable = false)
    private String slotLabel; // "Front", "Back", "Sole", "Side"

    @Column(nullable = false)
    private String photoUrl;

    private String originalFilename;

    private Long fileSize;

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public OrderPhotoEntity() {}

    public OrderPhotoEntity(int slotNumber, String slotLabel, String photoUrl, String originalFilename, Long fileSize) {
        this.slotNumber = slotNumber;
        this.slotLabel = slotLabel;
        this.photoUrl = photoUrl;
        this.originalFilename = originalFilename;
        this.fileSize = fileSize;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public int getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(int slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getSlotLabel() {
        return slotLabel;
    }

    public void setSlotLabel(String slotLabel) {
        this.slotLabel = slotLabel;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
