package com.project.controller;

import com.project.model.AuditLog;
import com.project.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditController {
    @Autowired private AuditService service;

    @GetMapping
    public List<AuditLog> recent() { return service.recent(); }

    @GetMapping("/entity/{type}")
    public List<AuditLog> byEntity(@PathVariable String type) { return service.byEntity(type); }
}
