package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.CompanyRequest;
import com.hirely.Entity.Company;
import com.hirely.Entity.User;
import com.hirely.Repository.CompanyRepository;
import com.hirely.Repository.UserRepository;

@Service
public class CompanyService {
        private final CompanyRepository companyRepository;
        private final UserRepository userRepository;

        public CompanyService(
                CompanyRepository companyRepository,
                UserRepository userRepository
        ) {
                this.companyRepository = companyRepository;
                this.userRepository = userRepository;
        }

        public Company createCompany(CompanyRequest request, String recruiterEmail) {
                User recruiter = userRepository
                        .findByEmail(recruiterEmail)
                        .orElseThrow(() -> new RuntimeException("Recruiter not found"));
                if (!"RECRUITER".equals(recruiter.getRole())) {
                        throw new RuntimeException("Only recruiters can create companies");
                }

                if (recruiter.getCompany() != null) {
                        throw new RuntimeException("Recruiter already has a company");
                }

                Company company = new Company();

                company.setName(request.getName());
                company.setDescription(request.getDescription());
                company.setWebsite(request.getWebsite());
                company.setLocation(request.getLocation());

                Company savedCompany = companyRepository.save(company);

                recruiter.setCompany(savedCompany);

                userRepository.save(recruiter);

                return savedCompany;
        }

        public Company getMyCompany(String recruiterEmail) {
                User recruiter = userRepository
                        .findByEmail(recruiterEmail)
                        .orElseThrow(() -> new RuntimeException("Recruiter not found"));

                if (recruiter.getCompany() == null) {
                        throw new RuntimeException("You have not created a company yet");
                }
                return recruiter.getCompany();
        }
}