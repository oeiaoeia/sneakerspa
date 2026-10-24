package com.sneakerspa.service;

import com.sneakerspa.dto.ReviewDto;
import com.sneakerspa.entity.ReviewEntity;
import com.sneakerspa.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> new ReviewDto(r.getId(), r.getName(), r.getRating(), r.getText(), r.getTimeAgo(), r.getAvatar(), r.getHelpfulCount()))
                .toList();
    }

    @Transactional
    public ReviewDto toggleHelpful(Long reviewId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));
        review.incrementHelpful();
        ReviewEntity saved = reviewRepository.save(review);
        return new ReviewDto(saved.getId(), saved.getName(), saved.getRating(), saved.getText(), saved.getTimeAgo(), saved.getAvatar(), saved.getHelpfulCount());
    }
}
