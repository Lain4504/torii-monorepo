# Kế hoạch triển khai LMS (Mobile + Backend + Web Admin) — Deadline 2 tháng (8 tuần)

> Mục tiêu: triển khai một hệ thống LMS mới (khác `torii-monorepo` hiện tại), có **mobile app** cho học viên + **backend** + **web-admin** quản trị LMS, hoàn thành trong **tối đa 2 tháng**, team **4 người (bao gồm TL/PM)**.  
> Cơ sở phạm vi: schema trong `auth_flow_schema.sql` + `lms_core_schema.sql`.

---

## 1) Phạm vi MVP theo schema (để chốt với khách)

### 1.1 Auth & Quyền (RBAC)
- `users`, `user_identities`, `sessions`, `two_factor_auth`
- `roles`, `permissions`, `role_permissions`, `user_roles`
- `audit_logs` (log thao tác quan trọng)

### 1.2 Nội dung học tập (Content Core)
- `programs`, `courses`, `program_courses`
- `modules`, `lessons`, `assignments`

### 1.3 Mở lớp / vận hành lớp học (Course Delivery)
- `course_runs`, `course_run_instructors`, `course_run_enrollments`
- `live_sessions`, `live_session_slots`

### 1.4 Thông báo
- `notifications`, `notification_templates`

### 1.5 Gamification / Growth
- `daily_checkins`, `user_streaks`
- `levels`, `user_levels`, `gamification_events`
- `achievements`, `user_achievements`

### 1.6 Chứng chỉ
- `certificate_templates`, `user_certificates`

### 1.7 Thanh toán In-App Purchase (IAP) + Quyền truy cập (Entitlements)
- `store_products`, `orders`, `order_items`, `iap_transactions`
- `entitlements` (source of truth để check quyền học/khóa học/chương trình)

### 1.8 Bổ sung cần thiết cho MVP (khuyến nghị)
Schema hiện chưa có bảng tiến độ học theo lesson. Để mobile làm được “tiếp tục học/đã hoàn thành/% tiến độ”, nên bổ sung:
- `lesson_progress` (hoặc `user_lesson_progress`): lưu trạng thái học/hoàn thành/last_seen, phục vụ UI & logic hoàn thành.

---

## 2) Đề xuất phân vai (Team 4 người)

- **Bạn (TL/PM/Full-stack backup)**: chốt scope, milestone, review kiến trúc/API, điều phối, nghiệm thu theo tuần, quản trị rủi ro, hỗ trợ các điểm nghẽn.
- **Dev A — Backend**: DB/migration, Auth/RBAC, API, Payment/IAP verify, Notifications/Audit logs, dịch vụ core.
- **Dev B — Mobile (Flutter)**: app học viên, auth, browsing content, flow học, thanh toán, thông báo, growth.
- **Dev C — Web Admin**: web quản trị LMS, CRUD nội dung, mở lớp, user/enrollment, sản phẩm/đơn hàng, RBAC trên UI.

---

## 3) Chiến lược bàn giao (đúng kiểu dự án thực tế)

**Mỗi 2 tuần có một bản demo/acceptance** (để khách theo dõi & giảm rủi ro):
- **W2**: Auth + RBAC basic + Admin tạo content cơ bản + Mobile xem được danh sách/chi tiết
- **W4**: Flow học MVP + mở lớp/enroll + entitlement check
- **W6**: Thanh toán/IAP + growth + thông báo + chứng chỉ (MVP)
- **W8**: Hardening + UAT + go-live + tài liệu bàn giao

---

## 4) Timeline 8 tuần (Milestones & Deliverables)

| Tuần | Mục tiêu giai đoạn | Deliverable nghiệm thu với khách |
|---|---|---|
| W1 | Kickoff + nền tảng kỹ thuật | Scope MVP + “không làm” list, luồng nghiệp vụ, API draft, môi trường dev/staging |
| W2 | Thông tuyến hệ thống | Login/RBAC chạy, Admin CRUD content cơ bản, Mobile browse content (đọc dữ liệu thật) |
| W3 | MVP học tập | Mobile học Video/Reading + đánh dấu hoàn thành + next lesson, Backend lưu progress |
| W4 | Mở lớp & quyền học | Admin tạo course_run, enroll; Mobile “My courses/runs”; entitlement check chặn học khi chưa mua/quyền |
| W5 | Payment/IAP đóng vòng | Store products/SKU, tạo order, verify transaction, cấp entitlement; Mobile purchase flow demo (sandbox) |
| W6 | Growth/Notifications/Certificates | checkin/streak, levels/achievements (MVP), inbox thông báo, chứng chỉ phát hành (MVP) |
| W7 | Ổn định & chuẩn bị go-live | RBAC “khóa chặt”, audit logs, QA/regression, tối ưu trải nghiệm, UAT |
| W8 | Go-live & bàn giao | Deploy production, tài liệu vận hành + hướng dẫn sử dụng admin, fix bug window |

---

## 5) Kế hoạch theo người (tuần nào làm gì)

### 5.1 Bạn (TL/PM/Backup)
| Tuần | Việc chính | Output |
|---|---|---|
| W1 | Chốt MVP + acceptance criteria, chuẩn hoá API/error codes, kiến trúc tổng thể | PRD-lite + bảng nghiệm thu + API guideline |
| W2 | Review RBAC, thống nhất permission codes theo menu admin, plan demo W2 | RBAC matrix + user test accounts |
| W3 | Review flow học + UX “Continue learning”, điều phối fix blockers | Demo end-to-end học xong 1 lesson |
| W4 | Review mở lớp/enroll + entitlement gating, plan demo W4 | Checklist nghiệm thu W4 |
| W5 | Review payment (idempotency, retry, refund hook), plan demo W5 | Payment flow spec + risk list |
| W6 | Chốt rule growth/achievement/certificate, plan demo W6 | Rule sheet + acceptance script |
| W7 | UAT, go-live checklist, release plan | Go-live checklist + release notes draft |
| W8 | Deploy & bàn giao & training | Delivery package + training admin |

### 5.2 Dev A (Backend)
| Tuần | Việc chính | Output |
|---|---|---|
| W1 | Setup service + migration + import schema, chuẩn auth token | Service chạy + migration scripts |
| W2 | Auth API + RBAC middleware + audit logs cơ bản | Login/refresh + guard quyền |
| W3 | **Bổ sung progress** + API học (lesson complete/continue) | API progress + endpoints content/lesson |
| W4 | course_runs + enrollments + entitlement middleware | API mở lớp/enroll + check quyền học |
| W5 | Orders + IAP verify + cấp entitlements (idempotent) | Payment backend đóng vòng |
| W6 | checkin/streak + gamification events + achievements + certificates + notifications inbox | Growth/notify/cert APIs |
| W7 | Hardening: security, indexes, logging, rate limit (nếu có), bugfix | Backend ổn định staging |
| W8 | Prod support + hotfix | Prod ready |

### 5.3 Dev B (Mobile Flutter)
| Tuần | Việc chính | Output |
|---|---|---|
| W1 | Kiến trúc app, routing/state, auth UI | App login chạy |
| W2 | Browse program/course/module/lesson | List + detail + outline |
| W3 | Learning player (video/reading), complete/next, progress UI | Flow học MVP |
| W4 | My course runs/enrollment, gating theo entitlement | My learning + access control |
| W5 | Purchase flow (sandbox/mock) + order status UI | Demo mua hàng |
| W6 | Checkin/streak, achievements/levels UI, notifications inbox, certificate view | Growth/notify/cert UI |
| W7 | UX polish, caching/offline (tối thiểu), error handling, regression fixes | Release candidate |
| W8 | Build release + hỗ trợ go-live | App go-live |

### 5.4 Dev C (Web Admin)
| Tuần | Việc chính | Output |
|---|---|---|
| W1 | Setup admin shell, layout, auth guard, role-based routing | Admin khung chạy |
| W2 | CRUD Programs/Courses/Modules/Lessons | Quản trị content MVP |
| W3 | Editor cải thiện (video/reading fields), sắp xếp (nếu kịp) | Content editor usable |
| W4 | Quản trị course_runs/instructors/enrollments | Mở lớp & quản lý học viên |
| W5 | Quản trị store_products, orders, iap_transactions (view) | Payment admin |
| W6 | Levels/achievements/cert templates + notification templates | Growth/ops tools |
| W7 | RBAC hoàn chỉnh (menu/button level), audit logs view | Kiểm soát & audit |
| W8 | Tài liệu hướng dẫn, training support | Bàn giao admin |

---

## 6) Backlog (bảng task kiểu Excel, có ID — copy sang Excel được)

> Cột `Dep` = phụ thuộc; `DoD` = Definition of Done (tiêu chí hoàn thành).

| ID | Module | Task | Owner | Tuần | Dep | DoD (nghiệm thu) |
|---|---|---|---|---|---|---|
| FND-01 | Nền tảng | Tạo repo/service skeleton + env dev/staging | Backend + TL | W1 | - | Deploy staging OK, healthcheck OK |
| FND-02 | Nền tảng | Chuẩn hoá API response/error codes/logging | TL + Backend | W1 | FND-01 | Có spec + áp dụng tối thiểu cho auth |
| AUTH-01 | Auth | Login + refresh token (sessions) | Backend | W1-W2 | FND-01 | Login/logout, refresh hoạt động, revoke OK |
| RBAC-01 | RBAC | roles/permissions/user_roles + guard API | Backend | W2 | AUTH-01 | API chặn đúng theo role/permission |
| AUD-01 | Audit | audit_logs cho action quan trọng | Backend | W2 | AUTH-01 | Tạo log khi login/admin CRUD/payment |
| ADM-01 | Admin | Admin shell + auth + role routing | Web | W1-W2 | AUTH-01/RBAC-01 | User role khác nhau thấy menu khác |
| CNT-01 | Content | CRUD programs/courses | Backend+Web | W2 | RBAC-01 | Admin tạo/sửa/xoá, mobile đọc được |
| CNT-02 | Content | CRUD modules/lessons + ordering | Backend+Web | W2-W3 | CNT-01 | Thứ tự chuẩn, outline consistent |
| MOB-01 | Mobile | Browse program/course/outline | Mobile | W2 | CNT-01/CNT-02 | Xem list+detail+outline mượt |
| LRN-01 | Learning | **Thêm bảng lesson_progress + API** | Backend | W3 | CNT-02 | Lưu progress, complete, last_seen |
| LRN-02 | Learning | Mobile learning page (video/reading) + complete/next | Mobile | W3 | LRN-01 | End-to-end hoàn thành lesson |
| RUN-01 | Runs | CRUD course_runs + instructors | Backend+Web | W4 | CNT-01 | Tạo run, gán instructor, đổi status |
| ENR-01 | Enroll | API enrollments + mobile “My runs” | Backend+Mobile | W4 | RUN-01 | Join/leave run, list runs OK |
| ENT-01 | Entitlement | Middleware check quyền học theo entitlements | Backend | W4 | ENR-01 | Chưa mua => không xem lesson protected |
| PAY-01 | Payment | CRUD store_products (SKU mapping) | Backend+Web | W5 | ENT-01 | Set SKU iOS/Android cho course/program |
| PAY-02 | Payment | Create orders + order_items + idempotency | Backend | W5 | PAY-01 | Tạo order không bị trùng (idempotent) |
| PAY-03 | Payment | Verify iap_transactions + cấp entitlements | Backend | W5 | PAY-02 | Verify OK => order PAID + entitlement |
| PAY-04 | Payment | Mobile purchase flow (sandbox/mock) | Mobile | W5 | PAY-02/PAY-03 | Demo mua thành công + unlock |
| NTF-01 | Notify | notifications inbox API + mark read | Backend | W6 | AUTH-01 | Mobile đọc/đánh dấu đã đọc |
| NTF-02 | Notify | Mobile inbox UI | Mobile | W6 | NTF-01 | Unread badge + list/detail |
| GRW-01 | Growth | daily_checkins + streak snapshot | Backend+Mobile | W6 | AUTH-01 | Check-in đúng theo ngày, streak đúng |
| GRW-02 | Growth | levels/user_levels + gamification_events | Backend | W6 | GRW-01 | Rule cấp XP hoạt động (MVP) |
| ACH-01 | Achievement | achievements + user_achievements + rule phát hành MVP | Backend+Mobile | W6 | GRW-02 | Đạt điều kiện => nhận achievement |
| CERT-01 | Certificate | templates + issue user_certificates | Backend+Web+Mobile | W6 | ENR-01 | Hoàn thành => có certificate record |
| QA-01 | QA | Regression/UAT fix + hardening RBAC/audit | All | W7 | All | UAT pass, không lỗi blocker |
| REL-01 | Release | Go-live: deploy production + tài liệu bàn giao | TL + Backend + Web + Mobile | W8 | QA-01 | Release notes + docs + training |

---

## 7) Checklist nghiệm thu theo mốc (đưa khách ký)

### Demo W2 (Thông tuyến)
- Đăng nhập/đăng xuất/refresh token OK
- Admin tạo được Program/Course/Module/Lesson cơ bản
- Mobile xem được list & chi tiết khóa học (dữ liệu thật từ backend)

### Demo W4 (Học + Mở lớp)
- Mobile học được Video/Reading, bấm “Hoàn thành”, qua bài tiếp theo
- Admin tạo course_run, enroll học viên vào run
- Chặn học khi không có quyền/entitlement (gating hoạt động)

### Demo W6 (Payment + Growth)
- Tạo SKU, tạo order, verify transaction (sandbox/mock) thành công
- Mua xong unlock course/program (entitlement đúng)
- Check-in/streak + notifications inbox + chứng chỉ (MVP)

### Final W8 (Go-live)
- UAT pass, release production, tài liệu vận hành, training admin

---

## 8) Gợi ý rủi ro (để TL kiểm soát đúng deadline)

- IAP verify (Apple/Google) thường phát sinh edge cases (restore/refund/retry). Cần idempotency + logging tốt.
- Nếu scope “Live session” cần realtime/video call: schema chỉ mô tả lịch, chưa có RTC integration. Nên chốt rõ “MVP chỉ scheduling/link meeting”.
- Nếu yêu cầu “Quiz/Assignment chấm điểm”: schema có `assignments` nhưng chưa có submissions/grades. Nên đưa vào Phase 2 nếu khách yêu cầu sâu.

