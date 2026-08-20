package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}