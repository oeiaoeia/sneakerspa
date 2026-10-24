package com.sneakerspa.dto;

public class TrackingStepDto {
    private String label;
    private String time;
    private boolean done;
    private boolean active;
    private String detail;

    public TrackingStepDto() {}

    public TrackingStepDto(String label, String time, boolean done, boolean active, String detail) {
        this.label = label;
        this.time = time;
        this.done = done;
        this.active = active;
        this.detail = detail;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }
}
