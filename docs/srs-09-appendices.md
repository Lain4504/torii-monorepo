# Software Requirements Specification (SRS)
## Section 10: Appendices

---

## 10.1 Glossary

### A
- **Achievement:** Thành tựu trong hệ thống gamification, được unlock khi user đạt được mục tiêu nhất định
- **API:** Application Programming Interface - Giao diện lập trình ứng dụng
- **Argon2:** Thuật toán hash password hiện đại và an toàn
- **Assignment:** Bài tập được giảng viên giao cho học viên

### B
- **Badge:** Huy hiệu trong hệ thống gamification
- **Blog Post:** Bài viết blog trong phần community

### C
- **CDN:** Content Delivery Network - Mạng phân phối nội dung
- **Coupon:** Mã giảm giá cho khóa học
- **Course:** Khóa học có thể là VOD (video) hoặc Live (WebRTC)
- **CSRF:** Cross-Site Request Forgery - Tấn công giả mạo yêu cầu liên trang

### D
- **Deck:** Bộ flashcard
- **Discount:** Giảm giá

### E
- **Enrollment:** Đăng ký khóa học của học viên
- **ERD:** Entity Relationship Diagram - Sơ đồ quan hệ thực thể

### F
- **FastMCP:** Fast Model Context Protocol - Giao thức cho AI agents
- **Flashcard:** Thẻ học từ vựng với mặt trước và mặt sau

### G
- **GDPR:** General Data Protection Regulation - Quy định bảo vệ dữ liệu chung
- **Gamification:** Hệ thống điểm thưởng, badges để khuyến khích học tập

### H
- **HTTPS:** HTTP Secure - Giao thức HTTP với mã hóa SSL/TLS

### J
- **JLPT:** Japanese Language Proficiency Test - Kỳ thi năng lực tiếng Nhật
- **JWT:** JSON Web Token - Token xác thực dạng JSON

### L
- **Lesson:** Bài học cụ thể trong module
- **Live Class:** Lớp học trực tuyến real-time sử dụng WebRTC
- **LiveKit:** Công nghệ WebRTC infrastructure

### M
- **Module:** Chương/phần trong khóa học
- **MVP:** Minimum Viable Product - Sản phẩm tối thiểu khả thi

### N
- **NATS:** NATS Message Broker - Message broker cho microservices

### O
- **OAuth:** Open Authorization - Giao thức xác thực mở
- **ORM:** Object-Relational Mapping - Ánh xạ đối tượng-quan hệ

### P
- **PCI-DSS:** Payment Card Industry Data Security Standard - Tiêu chuẩn bảo mật dữ liệu ngành thẻ thanh toán
- **Payment Gateway:** Cổng thanh toán (VNPay, MoMo, ZaloPay)
- **Prisma:** ORM framework cho Node.js

### Q
- **Quiz:** Bài kiểm tra có thể là practice test hoặc JLPT mock exam
- **Question Bank:** Ngân hàng câu hỏi

### R
- **RBAC:** Role-Based Access Control - Kiểm soát truy cập dựa trên vai trò
- **Room:** Phòng học ảo trong LiveKit (WebRTC)

### S
- **S3:** Amazon Simple Storage Service - Dịch vụ lưu trữ đám mây
- **SRS:** Spaced Repetition System - Hệ thống lặp lại ngắt quãng (thuật toán học flashcard)
- **Session:** Phiên làm việc của user

### T
- **2FA:** Two-Factor Authentication - Xác thực hai yếu tố
- **TOTP:** Time-based One-Time Password - Mật khẩu một lần dựa trên thời gian

### U
- **UUID:** Universally Unique Identifier - Định danh duy nhất toàn cầu
- **User Wallet:** Ví tiền ảo của học viên (credits/points)

### V
- **VOD:** Video on Demand - Video theo yêu cầu

### W
- **WCAG:** Web Content Accessibility Guidelines - Hướng dẫn về khả năng truy cập nội dung web
- **WebRTC:** Web Real-Time Communication - Giao tiếp thời gian thực trên web
- **Webhook:** HTTP callback để nhận events từ external services

### X
- **XSS:** Cross-Site Scripting - Tấn công script liên trang

---

## 10.2 Abbreviations

| Abbreviation | Full Form |
|--------------|-----------|
| API | Application Programming Interface |
| CDN | Content Delivery Network |
| CSRF | Cross-Site Request Forgery |
| GDPR | General Data Protection Regulation |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | HTTP Secure |
| JLPT | Japanese Language Proficiency Test |
| JWT | JSON Web Token |
| MVP | Minimum Viable Product |
| NATS | NATS Message Broker |
| OAuth | Open Authorization |
| ORM | Object-Relational Mapping |
| PCI-DSS | Payment Card Industry Data Security Standard |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SRS | Spaced Repetition System / Software Requirements Specification |
| 2FA | Two-Factor Authentication |
| TOTP | Time-based One-Time Password |
| UUID | Universally Unique Identifier |
| VOD | Video on Demand |
| WCAG | Web Content Accessibility Guidelines |
| WebRTC | Web Real-Time Communication |
| XSS | Cross-Site Scripting |

---

## 10.3 References

### Internal Documents
1. `docs/database-design-overview.md` - Database ERD và overview
2. `docs/database-design-schema.md` - Database schema chi tiết (Part 1)
3. `docs/database-design-schema-part2.md` - Database schema chi tiết (Part 2)
4. `docs/database-design-user-stories.md` - User stories và business flows
5. `docs/database-design-README.md` - Database design tổng hợp
6. `docs/srs-outline.md` - SRS outline và checklist
7. `README.md` - Project setup và architecture overview
8. `docs/architecture-comparison.md` - Architecture comparison

### External Standards
1. IEEE 830-1998: Recommended Practice for Software Requirements Specifications
2. ISO/IEC 25010: Systems and software Quality Requirements and Evaluation
3. WCAG 2.1: Web Content Accessibility Guidelines Level AA
4. PCI-DSS: Payment Card Industry Data Security Standard v3.2.1
5. OWASP Top 10: Top 10 Web Application Security Risks

### Technology Documentation
1. NestJS Documentation: https://nestjs.com/
2. Prisma Documentation: https://www.prisma.io/docs
3. LiveKit Documentation: https://docs.livekit.io/
4. NATS Documentation: https://docs.nats.io/
5. Next.js Documentation: https://nextjs.org/docs
6. React Documentation: https://react.dev/
7. TypeScript Documentation: https://www.typescriptlang.org/docs/

### Payment Gateway Documentation
1. VNPay API Documentation: https://sandbox.vnpayment.vn/apis/
2. MoMo API Documentation: (Internal/External)
3. ZaloPay API Documentation: (Internal/External)

### OAuth Documentation
1. Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

---

## 10.4 Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-28 | Development Team | Initial SRS document creation |

---

## 10.5 Document Approval

| Role | Name | Signature | Date | Approval |
|------|------|-----------|------|----------|
| Project Manager | | | | ☐ |
| Technical Lead | | | | ☐ |
| Product Owner | | | | ☐ |
| QA Lead | | | | ☐ |
| Security Lead | | | | ☐ |

---

## 10.6 Related Documents

### Design Documents
- Database Design Documents (docs/database-design-*.md)
- Architecture Documents (README.md, docs/architecture-comparison.md)

### Development Documents
- API Documentation (OpenAPI/Swagger - to be generated)
- Code Documentation (Inline comments)
- Deployment Guide (to be created)

### Testing Documents
- Test Plan (to be created)
- Test Cases (Section 9)
- Test Reports (to be generated)

### User Documents
- User Manual (to be created)
- Admin Guide (to be created)
- API User Guide (to be created)

---

## 10.7 Contact Information

**Project Team:**
- **Project Manager:** [Name] - [Email]
- **Technical Lead:** [Name] - [Email]
- **Product Owner:** [Name] - [Email]

**Support:**
- **Email:** support@torii-nihongo.com
- **Documentation:** https://docs.torii-nihongo.com

---

## 10.8 Document Maintenance

**Review Schedule:**
- Monthly review during development
- Quarterly review after release
- Ad-hoc review when major changes occur

**Update Process:**
1. Document changes in Change History
2. Update version number
3. Get approval from stakeholders
4. Publish updated document

**Version Control:**
- Document stored in Git repository
- Tagged with version numbers
- Change tracking via Git history

---

**End of SRS Document**

---

## Quick Navigation

- [Section 1: Introduction](srs-01-introduction.md)
- [Section 2: Overall Description](srs-02-overall-description.md)
- [Section 3: System Architecture](srs-03-architecture.md)
- [Section 4: External Interface Requirements](srs-04-interfaces.md)
- [Section 5: Non-Functional Requirements](srs-05-non-functional.md)
- [Section 6: Use Cases](srs-06-use-cases.md)
- [Section 7: API Specifications](srs-07-api-specifications.md)
- [Section 8: Acceptance Criteria](srs-08-acceptance-criteria.md)
- [Section 9: Appendices](srs-09-appendices.md) (Current)

---

**Document Status:** ✅ Complete

