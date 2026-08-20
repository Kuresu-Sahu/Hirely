# Hirely — AI-Powered Recruitment Platform

Hirely is a full-stack recruitment platform that connects candidates and recruiters through a modern web application with authentication, job management, applications, resume analysis, AI-powered features, and role-based access control.

## 🚀 Live Application

**Frontend:**  
https://hirelyapp.vercel.app

**Backend API:**  
https://hirely-backend-j6bx.onrender.com

> Note: The backend is hosted on Render's free tier and may take some time to wake up after a period of inactivity.

---

## ✨ Features

### 👤 Candidate

- Candidate registration and authentication
- JWT-based authentication
- Browse available jobs
- Search jobs
- View job details
- Apply for jobs
- Upload resumes
- View uploaded resume
- Resume analysis
- AI-powered resume analysis
- AI interview functionality
- View application status
- Notifications

### 🏢 Recruiter

- Recruiter authentication
- Company management
- Create jobs
- Update jobs
- Delete jobs
- View posted jobs
- View applicants
- Review candidate applications
- View candidate resumes
- Update application status
- Recruiter dashboard
- Candidate evaluation
- AI-powered interview evaluation

### 🤖 AI Features

Hirely integrates OpenAI-powered functionality for:

- Resume analysis
- Resume-to-job analysis
- AI interview workflows
- Candidate evaluation
- Recruitment assistance

### 🔐 Security

- JWT authentication
- Role-based authorization
- Protected REST APIs
- Password hashing
- CORS configuration
- Input validation
- Stateless authentication
- Environment-based secrets

### 📧 Email

Resend API is integrated for OTP-based email functionality.

> The current deployed version uses Resend's testing sender, so email delivery is limited to the Resend account's authorized testing recipient. A verified custom domain can be configured for unrestricted production email delivery.

---

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │       Vercel         │
                         │   React + Vite       │
                         │   Hirely Frontend    │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS REST API
                                    ▼
                         ┌──────────────────────┐
                         │       Render         │
                         │   Spring Boot API    │
                         │      Docker          │
                         └──────────┬───────────┘
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼                         ▼
              ┌────────────────┐        ┌────────────────┐
              │   Aiven MySQL  │        │    OpenAI API  │
              │    Database    │        │   AI Features  │
              └────────────────┘        └────────────────┘
                                              
                                    ┌────────────────┐
                                    │  Resend API    │
                                    │  Email / OTP   │
                                    └────────────────┘
