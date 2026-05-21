package com.project.controller;

import com.project.model.Coupon;
import com.project.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {
    @Autowired private CouponService service;

    @GetMapping
    public List<Coupon> list() { return service.list(); }

    @PostMapping
    public Coupon create(@RequestBody Coupon c) { return service.create(c); }

    @PostMapping("/{id}/toggle")
    public Coupon toggle(@PathVariable String id) { return service.toggle(id); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.delete(id); }

    @PostMapping("/validate")
    public Map<String, Object> validate(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        return service.validate(code, amount);
    }
}
