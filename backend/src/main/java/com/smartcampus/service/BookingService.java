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
        // Fetch the resource to get its total capacity
        Resource resource = resourceService.getResourceById(newBooking.getResourceId()).orElse(null);
        if (resource == null) return false;

        // Fetch all active (Approved/Pending) bookings for this resource on the same date
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDateAndStatusNot(
                newBooking.getResourceId(), 
                newBooking.getDate(), 
                BookingStatus.REJECTED
        );

        // We need to check if the peak occupancy exceeds capacity during the NEW booking's time range
        int newAttendees = (newBooking.getAttendeeCount() != null) ? newBooking.getAttendeeCount() : 1;
        int capacity = resource.getCapacity();

        // Check every minute (or every start/end time) within the requested range
        // A simple way is to check the occupancy at the start time of every overlapping booking
        for (Booking b : existingBookings) {
            if (b.getStatus() == BookingStatus.CANCELLED) continue;

            // Calculate occupancy at the moment this existing booking (or the new one) starts
            int occupancyAtStart = getOccupancyAt(newBooking.getResourceId(), newBooking.getDate(), b.getStartTime(), existingBookings);
            int occupancyAtNewStart = getOccupancyAt(newBooking.getResourceId(), newBooking.getDate(), newBooking.getStartTime(), existingBookings);

            if (occupancyAtStart + newAttendees > capacity && isTimeWithin(b.getStartTime(), newBooking)) return true;
            if (occupancyAtNewStart + newAttendees > capacity) return true;
        }

        // If no existing bookings, just check if the new booking itself exceeds capacity
        return newAttendees > capacity;
    }

    private int getOccupancyAt(String resourceId, java.time.LocalDate date, java.time.LocalTime time, List<Booking> bookings) {
        return bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .filter(b -> !time.isBefore(b.getStartTime()) && time.isBefore(b.getEndTime()))
                .mapToInt(b -> (b.getAttendeeCount() != null) ? b.getAttendeeCount() : 1)
                .sum();
    }

    private boolean isTimeWithin(java.time.LocalTime time, Booking booking) {
        return !time.isBefore(booking.getStartTime()) && time.isBefore(booking.getEndTime());
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
