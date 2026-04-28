package com.smartcampus.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.BookingRepository;

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

        // Validation: End time must be after Start time
        if (booking.getEndTime().isBefore(booking.getStartTime()) || booking.getEndTime().equals(booking.getStartTime())) {
            throw new RuntimeException("End time must be after the start time.");
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
        Resource resource = resourceService.getResourceById(newBooking.getResourceId()).orElse(null);
        if (resource == null) return false;

        int capacity = resource.getCapacity();
        int newAttendees = normalizeAttendeeCount(newBooking.getAttendeeCount());

        // 1. Get all relevant bookings (Approved or Pending)
        List<Booking> existing = bookingRepository.findByResourceIdAndDateAndStatusNot(
                newBooking.getResourceId(), newBooking.getDate(), BookingStatus.REJECTED);

        // 2. We only care about bookings that actually overlap with our new time range
        List<Booking> overlaps = existing.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .filter(b -> b.getStartTime().isBefore(newBooking.getEndTime()) && b.getEndTime().isAfter(newBooking.getStartTime()))
                .toList();

        // 3. Check every "Change Point" (whenever a booking starts or ends)
        // If the occupancy + our new attendees > capacity at any point, then it's a conflict.
        java.util.Set<java.time.LocalTime> checkPoints = new java.util.HashSet<>();
        checkPoints.add(newBooking.getStartTime());
        for (Booking b : overlaps) {
            checkPoints.add(b.getStartTime());
        }

        for (java.time.LocalTime time : checkPoints) {
            // Only check points that fall within our new booking's window
            if (!time.isBefore(newBooking.getStartTime()) && time.isBefore(newBooking.getEndTime())) {
                int occupancyAtTime = getOccupancyAt(time, overlaps);
                if (occupancyAtTime + newAttendees > capacity) {
                    return true;
                }
            }
        }

        return newAttendees > capacity;
    }

    private int getOccupancyAt(java.time.LocalTime time, List<Booking> overlaps) {
        return overlaps.stream()
                .filter(b -> !time.isBefore(b.getStartTime()) && time.isBefore(b.getEndTime()))
                .mapToInt(b -> normalizeAttendeeCount(b.getAttendeeCount()))
                .sum();
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
        java.time.LocalDateTime bookingStart = java.time.LocalDateTime.of(booking.getDate(), booking.getStartTime());

        if (now.isAfter(bookingStart)) {
            throw new RuntimeException("Cannot cancel a booking that has already started");
        }

        bookingRepository.deleteById(id);
        return null; // Return null or a dummy object as it's deleted
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

    private int normalizeAttendeeCount(Integer count) {
        return count != null ? count : 1;
    }
}
