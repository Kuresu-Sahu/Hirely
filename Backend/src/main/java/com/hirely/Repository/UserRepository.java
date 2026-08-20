package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // FIND USER BY EMAIL
    Optional<User> findByEmail(String email);

    // CHECK EMAIL
    boolean existsByEmail(String email);

    // FIND RECRUITER BY COMPANY
    Optional<User> findByCompany_Id(Long companyId);
}