package com.smartcampus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.service.BookingService;
import java.util.List;
import java.util.Map;

@RestController
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // --- USER ENDPOINTS ---

    @PostMapping("/api/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, Authentication authentication) {
        try {
            // In a real app, we get the ID from the authentication principal.
            // For now, we'll assume the frontend sends the user details or we fetch from auth.
            if (authentication != null) {
                booking.setUserId(authentication.getName());
            }
            
            Booking created = bookingService.createBooking(booking);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/bookings/my")
    public List<Booking> getMyBookings(Authentication authentication) {
        String userId = (authentication != null) ? authentication.getName() : "anonymous";
        return bookingService.getBookingsByUserId(userId);
    }

    @PostMapping("/api/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id, Authentication authentication) {
        try {
            String userId = (authentication != null) ? authentication.getName() : "anonymous";
            bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok("Booking successfully cancelled and deleted.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/api/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/admin/api/bookings/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String id, 
            @RequestBody Map<String, String> payload) {
        try {
            BookingStatus status = BookingStatus.valueOf(payload.get("status").toUpperCase());
            String reason = payload.getOrDefault("reason", "");
            
            Booking updated = bookingService.updateBookingStatus(id, status, reason);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
