package com.sneakerspa.dto;

public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private int loyaltyPoints;
    private boolean hasActiveSubscription;
    private String subscriptionNextBilling;
    private int cleaningsLeft;
    private boolean notificationsEnabled;
    private boolean darkModeEnabled;
    private long totalOrders;
    private String memberSince;

    public UserProfileDto() {}

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public int getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(int loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public boolean isHasActiveSubscription() {
        return hasActiveSubscription;
    }

    public void setHasActiveSubscription(boolean hasActiveSubscription) {
        this.hasActiveSubscription = hasActiveSubscription;
    }

    public String getSubscriptionNextBilling() {
        return subscriptionNextBilling;
    }

    public void setSubscriptionNextBilling(String subscriptionNextBilling) {
        this.subscriptionNextBilling = subscriptionNextBilling;
    }

    public int getCleaningsLeft() {
        return cleaningsLeft;
    }

    public void setCleaningsLeft(int cleaningsLeft) {
        this.cleaningsLeft = cleaningsLeft;
    }

    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public boolean isDarkModeEnabled() {
        return darkModeEnabled;
    }

    public void setDarkModeEnabled(boolean darkModeEnabled) {
        this.darkModeEnabled = darkModeEnabled;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public String getMemberSince() {
        return memberSince;
    }

    public void setMemberSince(String memberSince) {
        this.memberSince = memberSince;
    }
}
