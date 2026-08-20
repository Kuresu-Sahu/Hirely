package com.hirely.Controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.CompanyRequest;
import com.hirely.Entity.Company;
import com.hirely.Service.CompanyService;

@RestController
@RequestMapping("/api/companies")
// @CrossOrigin(origins = "http://localhost:5173")
public class CompanyController {
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<?> createCompany(
            @Valid @RequestBody CompanyRequest request,
            Authentication authentication) {
        try {
            Company company = companyService.createCompany(
                        request,
                        authentication.getName()
                );

            return ResponseEntity.status(HttpStatus.CREATED).body(company);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyCompany(
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                companyService.getMyCompany(
                        authentication.getName()
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}