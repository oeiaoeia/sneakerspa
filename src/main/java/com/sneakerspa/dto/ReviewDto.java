package com.sneakerspa.dto;

public class ReviewDto {
    private Long id;
    private String name;
    private int rating;
    private String text;
    private String time;
    private String avatar;
    private int helpfulCount;

    public ReviewDto() {}

    public ReviewDto(Long id, String name, int rating, String text, String time, String avatar, int helpfulCount) {
        this.id = id;
        this.name = name;
        this.rating = rating;
        this.text = text;
        this.time = time;
        this.avatar = avatar;
        this.helpfulCount = helpfulCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public int getHelpfulCount() {
        return helpfulCount;
    }

    public void setHelpfulCount(int helpfulCount) {
        this.helpfulCount = helpfulCount;
    }
}
