package com.project.service;

import com.project.model.Coupon;
import com.project.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CouponService {
    @Autowired private CouponRepository repo;

    public List<Coupon> list() { return repo.findAll(); }

    public Coupon create(Coupon c) {
        if (c.getUsageCount() == null) c.setUsageCount(0);
        return repo.save(c);
    }

    public Coupon toggle(String id) {
        Coupon c = repo.findById(id).orElseThrow();
        c.setActive(!c.isActive());
        return repo.save(c);
    }

    public void delete(String id) { repo.deleteById(id); }

    public Map<String, Object> validate(String code, BigDecimal orderAmount) {
        Map<String, Object> result = new HashMap<>();
        Optional<Coupon> opt = repo.findByCode(code);
        if (opt.isEmpty()) {
            result.put("valid", false); result.put("reason", "Invalid code");
            return result;
        }
        Coupon c = opt.get();
        if (!c.isActive()) { result.put("valid", false); result.put("reason", "Inactive"); return result; }
        if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(LocalDate.now())) {
            result.put("valid", false); result.put("reason", "Expired"); return result;
        }
        if (c.getUsageLimit() != null && c.getUsageCount() >= c.getUsageLimit()) {
            result.put("valid", false); result.put("reason", "Usage limit reached"); return result;
        }
        BigDecimal discount = "PERCENT".equals(c.getType())
            ? orderAmount.multiply(c.getValue()).divide(new BigDecimal("100"))
            : c.getValue();
        result.put("valid", true);
        result.put("discount", discount);
        result.put("code", code);
        return result;
    }
}
