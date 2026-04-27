package com.smartcampus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceService resourceService;

    public Booking createBooking(Booking booking) {
        // 1. Fetch the resource and validate it
        Resource resource = resourceService.getResourceById(booking.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Validation: Resource must be ACTIVE
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new RuntimeException("This resource is currently not available for booking (" + resource.getStatus() + ")");
        }

        // Validation: Attendee count rule for equipment
        if (resource.getType() == ResourceType.EQUIPMENT) {
            booking.setAttendeeCount(null); // Equipment doesn't need attendee count
        } else if (booking.getAttendeeCount() == null || booking.getAttendeeCount() <= 0) {
            throw new RuntimeException("Expected number of attendees is required for this facility");
        }

        // 2. Prevent overlapping bookings
        boolean hasOverlap = checkOverlap(booking);
        if (hasOverlap) {
            throw new RuntimeException("The selected time slot is already booked for this resource.");
        }

        // 3. Set metadata
        booking.setResourceName(resource.getName());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    private boolean checkOverlap(Booking newBooking) {
        // Fetch all non-rejected bookings for this resource on the same date
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDateAndStatusNot(
                newBooking.getResourceId(), 
                newBooking.getDate(), 
                BookingStatus.REJECTED
        );

        return existingBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED) // Ignore cancelled bookings
                .anyMatch(b -> 
                    // Check if times overlap: (StartA < EndB) and (EndA > StartB)
                    newBooking.getStartTime().isBefore(b.getEndTime()) && 
                    newBooking.getEndTime().isAfter(b.getStartTime())
                );
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking updateBookingStatus(String id, BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(Instant.now());
        
        return bookingRepository.save(booking);
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }
}
