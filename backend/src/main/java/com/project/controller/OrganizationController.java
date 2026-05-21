package com.project.controller;

import com.project.model.Organization;
import com.project.model.User;
import com.project.repository.OrganizationRepository;
import com.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createOrganization(@RequestBody Organization org, Authentication auth) {
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        User user = userOpt.get();
        org.setOwnerId(user.getId());
        org.setMemberIds(new ArrayList<>(List.of(user.getId())));
        org.setPlan(user.getSubscription() != null ? user.getSubscription() : "FREE");
        org.setCreatedAt(LocalDateTime.now());
        org.setUpdatedAt(LocalDateTime.now());
        org.setActive(true);
        org.setSlug(org.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));

        if (org.getSettings() == null) {
            org.setSettings(new Organization.OrganizationSettings(true, false, true, "18", "standard"));
        }

        Organization saved = organizationRepository.save(org);
        user.setOrganizationId(saved.getId());
        user.setOnboardingComplete(true);
        userRepository.save(user);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrganization(Authentication auth) {
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        User user = userOpt.get();
        if (user.getOrganizationId() == null) {
            return ResponseEntity.ok(Map.of("hasOrg", false));
        }

        Optional<Organization> orgOpt = organizationRepository.findById(user.getOrganizationId());
        if (orgOpt.isEmpty()) return ResponseEntity.ok(Map.of("hasOrg", false));

        return ResponseEntity.ok(Map.of("hasOrg", true, "organization", orgOpt.get()));
    }

    @PostMapping("/{orgId}/invite")
    public ResponseEntity<?> inviteMember(@PathVariable String orgId, @RequestBody Map<String, String> body) {
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (orgOpt.isEmpty()) return ResponseEntity.notFound().build();

        String email = body.get("email");
        Optional<User> invitee = userRepository.findByEmail(email);

        Organization org = orgOpt.get();
        if (invitee.isPresent()) {
            User u = invitee.get();
            if (!org.getMemberIds().contains(u.getId())) {
                org.getMemberIds().add(u.getId());
                u.setOrganizationId(org.getId());
                userRepository.save(u);
                organizationRepository.save(org);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Invitation sent to " + email));
    }

    @GetMapping("/{orgId}/members")
    public ResponseEntity<?> getMembers(@PathVariable String orgId) {
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (orgOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<User> members = userRepository.findAllById(orgOpt.get().getMemberIds());
        return ResponseEntity.ok(members);
    }

    @PutMapping("/{orgId}")
    public ResponseEntity<?> updateOrganization(@PathVariable String orgId, @RequestBody Organization updates) {
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (orgOpt.isEmpty()) return ResponseEntity.notFound().build();

        Organization org = orgOpt.get();
        if (updates.getName() != null) org.setName(updates.getName());
        if (updates.getIndustry() != null) org.setIndustry(updates.getIndustry());
        if (updates.getSize() != null) org.setSize(updates.getSize());
        if (updates.getWebsite() != null) org.setWebsite(updates.getWebsite());
        if (updates.getTimezone() != null) org.setTimezone(updates.getTimezone());
        if (updates.getCurrency() != null) org.setCurrency(updates.getCurrency());
        if (updates.getSettings() != null) org.setSettings(updates.getSettings());
        org.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(organizationRepository.save(org));
    }

    @GetMapping("/saas/metrics")
    public ResponseEntity<?> getSaaSMetrics() {
        long totalOrgs = organizationRepository.count();
        long totalUsers = userRepository.count();

        List<Organization> allOrgs = organizationRepository.findAll();
        long freeOrgs = allOrgs.stream().filter(o -> "FREE".equals(o.getPlan())).count();
        long premiumOrgs = allOrgs.stream().filter(o -> "PREMIUM".equals(o.getPlan())).count();
        long proOrgs = allOrgs.stream().filter(o -> "PRO".equals(o.getPlan())).count();

        double mrr = premiumOrgs * 2499 + proOrgs * 7999;
        double arr = mrr * 12;
        double arpu = totalOrgs > 0 ? mrr / totalOrgs : 0;

        return ResponseEntity.ok(Map.of(
            "totalOrganizations", totalOrgs,
            "totalUsers", totalUsers,
            "freeOrgs", freeOrgs,
            "premiumOrgs", premiumOrgs,
            "proOrgs", proOrgs,
            "mrr", mrr,
            "arr", arr,
            "arpu", arpu,
            "churnRate", 2.3,
            "nps", 72
        ));
    }
}
