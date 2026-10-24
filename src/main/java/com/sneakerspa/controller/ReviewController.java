package com.sneakerspa.controller;

import com.sneakerspa.dto.ReviewDto;
import com.sneakerspa.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<ReviewDto> toggleHelpful(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.toggleHelpful(id));
    }
}
