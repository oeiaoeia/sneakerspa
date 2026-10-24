package com.sneakerspa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ============================================================================
 * OOP PRINCIPLE: COMPOSITION
 * Represents one of the photos uploaded for sneaker condition assessment:
 * stored directly in the database as a binary BLOB with content-type metadata.
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

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "photo_data", nullable = false)
    @JsonIgnore
    private byte[] data;

    @Column(nullable = false)
    private String contentType; // e.g. "image/jpeg", "image/png"

    private String originalFilename;

    private Long fileSize;

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public OrderPhotoEntity() {}

    public OrderPhotoEntity(int slotNumber, String slotLabel, byte[] data, String contentType, String originalFilename, Long fileSize) {
        this.slotNumber = slotNumber;
        this.slotLabel = slotLabel;
        this.data = data;
        this.contentType = contentType != null ? contentType : "image/jpeg";
        this.originalFilename = originalFilename != null ? originalFilename : slotLabel.toLowerCase() + ".jpg";
        this.fileSize = fileSize != null ? fileSize : (data != null ? (long) data.length : 0L);
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

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
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
