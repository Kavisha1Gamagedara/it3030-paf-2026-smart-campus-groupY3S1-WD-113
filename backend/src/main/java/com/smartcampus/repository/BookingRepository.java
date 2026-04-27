package com.smartcampus.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByResourceIdAndDateAndStatusNot(String resourceId, LocalDate date, BookingStatus status);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
