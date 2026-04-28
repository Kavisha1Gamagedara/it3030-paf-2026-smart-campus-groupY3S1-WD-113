package com.smartcampus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        } else {
            if (booking.getAttendeeCount() == null || booking.getAttendeeCount() <= 0) {
                throw new RuntimeException("Expected number of attendees is required for this facility");
            }
            // Strict Capacity Check
            if (booking.getAttendeeCount() > resource.getCapacity()) {
                throw new RuntimeException("Capacity exceeded! This resource only has " + resource.getCapacity() + " seats.");
            }
        }

        // Validation: End time must be after Start time
        LocalTime start = booking.getLocalStartTime();
        LocalTime end = booking.getLocalEndTime();
        if (end.isBefore(start) || end.equals(start)) {
            throw new RuntimeException("End time must be after the start time.");
        }

        // 2. Prevent overlapping bookings based on capacity
        String conflictMsg = checkCapacityConflicts(booking, resource);
        if (conflictMsg != null) {
            throw new RuntimeException(conflictMsg);
        }

        // 3. Set metadata
        booking.setResourceName(resource.getName());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    /**
     * Checks if the new booking exceeds the resource's capacity at any point in its time range.
     * Returns an error message if there's a conflict, or null if it's safe to book.
     */
    private String checkCapacityConflicts(Booking newBooking, Resource resource) {
        int capacity = resource.getCapacity();
        int newAttendees = (newBooking.getAttendeeCount() != null) ? newBooking.getAttendeeCount() : 1;
        LocalTime newStart = newBooking.getLocalStartTime();
        LocalTime newEnd = newBooking.getLocalEndTime();

        // 1. Get all relevant bookings (Approved or Pending) for the same resource and date
        List<Booking> existing = bookingRepository.findByResourceIdAndDateAndStatusNot(
                newBooking.getResourceId(), newBooking.getDate(), BookingStatus.REJECTED);

        // 2. Filter for those that overlap in time and are not cancelled
        List<Booking> overlaps = existing.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .filter(b -> {
                    LocalTime bStart = b.getLocalStartTime();
                    LocalTime bEnd = b.getLocalEndTime();
                    return bStart.isBefore(newEnd) && bEnd.isAfter(newStart);
                })
                .collect(Collectors.toList());

        // 3. Check occupancy at all "critical time points" within the new booking's range
        java.util.Set<LocalTime> criticalPoints = new java.util.HashSet<>();
        criticalPoints.add(newStart);
        for (Booking b : overlaps) {
            criticalPoints.add(b.getLocalStartTime());
        }

        for (LocalTime time : criticalPoints) {
            // Only check points that fall within our new booking's window
            if (!time.isBefore(newStart) && time.isBefore(newEnd)) {
                int occupancy = 0;
                for (Booking b : overlaps) {
                    LocalTime bStart = b.getLocalStartTime();
                    LocalTime bEnd = b.getLocalEndTime();
                    if (!time.isBefore(bStart) && time.isBefore(bEnd)) {
                        occupancy += (b.getAttendeeCount() != null) ? b.getAttendeeCount() : 1;
                    }
                }

                if (occupancy + newAttendees > capacity) {
                    if (occupancy > 0) {
                        return "Capacity exceeded! Only " + (capacity - occupancy) + " seats available during this time slot.";
                    } else {
                        return "Capacity exceeded! This resource only has " + capacity + " seats.";
                    }
                }
            }
        }

        return null;
    }

    public Booking cancelBooking(String id, String userId) {
        System.out.println("DEBUG: Attempting to cancel booking ID: " + id + " for user: " + userId);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            System.out.println("DEBUG: Unauthorized! Booking user: " + booking.getUserId() + " vs provided: " + userId);
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        // Check if the booking has already started
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bookingStart = java.time.LocalDateTime.of(booking.getLocalDate(), booking.getLocalStartTime());

        if (now.isAfter(bookingStart)) {
            throw new RuntimeException("Cannot cancel a booking that has already started");
        }

        bookingRepository.deleteById(id);
        return null; 
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
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
