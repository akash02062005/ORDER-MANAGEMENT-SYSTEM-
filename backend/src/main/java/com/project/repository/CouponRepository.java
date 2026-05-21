package com.project.repository;

import com.project.model.Coupon;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface CouponRepository extends MongoRepository<Coupon, String> {
    Optional<Coupon> findByCode(String code);
    List<Coupon> findByActiveTrue();
}
