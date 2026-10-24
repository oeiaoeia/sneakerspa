package com.sneakerspa.dto;

public class UploadedPhotoDto {
    private int slotNumber;
    private String slotLabel;
    private String photoUrl;
    private String originalFilename;
    private Long fileSize;

    public UploadedPhotoDto() {}

    public UploadedPhotoDto(int slotNumber, String slotLabel, String photoUrl, String originalFilename, Long fileSize) {
        this.slotNumber = slotNumber;
        this.slotLabel = slotLabel;
        this.photoUrl = photoUrl;
        this.originalFilename = originalFilename;
        this.fileSize = fileSize;
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
}
