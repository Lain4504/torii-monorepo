# Open-Source LMS Readiness Roadmap (90 Days)

## 1) Muc tieu

Bien he thong hien tai tu e-learning vertical thanh nen tang LMS co the open-source an toan, de cai dat, de mo rong, de dong gop.

Muc tieu ket qua sau 90 ngay:
- Co ban phat hanh `v0.1.0-oss` chay duoc bang Docker Compose.
- Co bo tai lieu setup + architecture + contribution + security.
- Co test gate bat buoc truoc merge/deploy.
- Khong con bi mat that (secret) trong repo.
- API contract learner/admin duoc dong bo voi backend thuc te.

---

## 2) Gap Checklist (Hien trang -> Muc tieu)

### A. Security va Open-source hygiene
- [ ] Go bo tat ca secret khoi repo (config.yaml, .env, key cloud/payment/email).
- [ ] Rotate toan bo key da lo (DB, JWT, OAuth, SMTP, PayOS, R2, Gemini, LiveKit).
- [ ] Them secret scanning trong CI (gitleaks/trufflehog).
- [ ] Chuan hoa `config-sample.yaml` + `.env.example` dung cho OSS.
- [ ] Tach profile `dev`, `self-hosted`, `production`.
- [ ] Bo sung `SECURITY.md` + quy trinh report lo hong.

### B. API Contract va Workflow nghiep vu
- [ ] Dong bo endpoint learner/admin voi gateway hien tai (`/api/academy/*` la nguon chinh).
- [ ] Loai bo endpoint legacy/placeholder (course-masters, wallet legacy, exam legacy).
- [ ] Xoa hardcoded mock response trong frontend.
- [ ] Chuan hoa payload/response bang `@workspace/schemas` cho tat ca app.
- [ ] Tao API compatibility matrix (frontend route -> gateway controller -> NATS cmd).

### C. Core LMS Feature Completeness
- [ ] Hoan thien learner exam flow (khong phu thuoc quyen admin `exam.manage`).
- [ ] Hoan thien certificate generation (PDF + signed URL + verify endpoint).
- [ ] Hoan thien payment webhook verification/signature (khong chi forward payload).
- [ ] Hoan thien enrollment/gift/check flow theo use-case that.
- [ ] Hoan thien quy trinh class completion -> certificate -> notification.

### D. Testing va Quality Gate
- [ ] Them test cho Academy service (order, enrollment, progress, exam attempt, certificate).
- [ ] Them integration test cho gateway critical endpoints.
- [ ] Dat quality gate trong CI: lint + typecheck + test + build.
- [ ] Dat baseline coverage (>=60% service critical; tang dan theo sprint).
- [ ] Bo sung contract test cho endpoint frontend su dung nhieu.

### E. Architecture va Operability
- [ ] Dong bo README voi code/compose thuc te (danh sach service dung).
- [ ] Chuan hoa docker-compose OSS (chi giu service co that).
- [ ] Tach infra optional (AI provider, payment gateway, SMTP) qua feature flags.
- [ ] Them healthcheck/readiness endpoint cho moi service.
- [ ] Them migration/seed script “one-command bootstrap”.

### F. Governance cho Open-source
- [ ] Chon va thong nhat license toan repo (khuyen nghi Apache-2.0 hoac AGPL-3.0).
- [ ] Them `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`.
- [ ] Them issue template/PR template/changelog policy.
- [ ] Dinh nghia module boundaries + extension points (plugin-style).

---

## 3) Roadmap 90 ngay

## Phase 0 (Ngay 1-3): Emergency Hardening
Deliverables:
- Secret purge + key rotation complete.
- `config-sample.yaml` va `.env.example` clean.
- Secret scan chay trong CI.

Definition of done:
- Khong con credential that trong git HEAD.
- Secret scanner pass 100%.

---

## Phase 1 (Tuan 1-2): Contract Stabilization
Deliverables:
- API inventory va mapping frontend-backend.
- Fix toan bo endpoint mismatch quan trong learner flow.
- Loai bo cac route hardcoded legacy hoac mock phat hien.

Definition of done:
- Top 20 route learner/admin duoc goi thanh cong end-to-end.
- Khong con string endpoint “legacy” trong code path chinh.

---

## Phase 2 (Tuan 3-4): LMS Workflow Completion
Deliverables:
- Exam learner flow day du (start/save/submit/history/details) qua API hop nhat.
- Certificate PDF pipeline hoan thien.
- Payment webhook verify signature + idempotency.
- Enrollment va order flow hoat dong on dinh.

Definition of done:
- 5 workflow E2E pass:
  1) Dang ky -> Mua khoa hoc -> Enroll.
  2) Hoc bai -> Track progress -> Complete class.
  3) Thi quiz/exam -> cham diem -> lich su.
  4) Hoan thanh -> cap chung chi -> verify.
  5) Viet review -> moderation -> publish.

---

## Phase 3 (Tuan 5-8): Quality Gate + Reliability
Deliverables:
- Test suite Academy + Gateway critical.
- CI bat buoc lint/typecheck/test/build.
- Healthcheck/readiness + basic observability.

Definition of done:
- Coverage service critical >=60%.
- Pipeline merge block neu fail.
- Co runbook debug deployment co ban.

---

## Phase 4 (Tuan 9-12): OSS Packaging
Deliverables:
- License thong nhat.
- Tai lieu OSS: Quickstart, Architecture, Contribution, Security.
- Docker Compose OSS profile (min va full).
- First OSS tag/release notes.

Definition of done:
- Nguoi ngoai co the clone -> setup -> chay thanh cong theo docs trong <=30 phut.
- Co issue template + PR template + changelog.
- Release `v0.1.0-oss`.

---

## 4) KPI theo doi

- Security:
  - So secret bi lo trong repo: target = 0.
  - So canh bao secret scanner: target = 0.
- Product:
  - So workflow E2E pass: target >= 5 workflow critical.
  - Ty le endpoint frontend khop backend: target >= 95%.
- Engineering:
  - CI pass rate: target >= 90%.
  - Test coverage service critical: target >= 60% (giai doan dau).
- OSS:
  - Thoi gian setup trung binh cho contributor moi: target <= 30 phut.
  - So doc bat buoc (README, CONTRIBUTING, SECURITY, LICENSE): target = du 100%.

---

## 5) Priority Backlog (Top 12 viec can lam ngay)

1. Secret purge + rotate key.
2. Them secret scan CI.
3. Dong bo README + docker-compose voi service thuc te.
4. API mapping learner/admin va fix mismatch endpoint.
5. Xoa mock/legacy endpoint trong frontend.
6. Hoan thien learner exam API (bo phu thuoc quyen admin cho luong hoc vien).
7. Hoan thien certificate PDF + signed URL.
8. Verify webhook payment + idempotency key.
9. Them test cho `order.service`, `enrollment.service`, `learning-progress.service`.
10. Them integration test cho gateway critical routes.
11. Chon license OSS va cap nhat package metadata.
12. Them CONTRIBUTING/CODE_OF_CONDUCT/SECURITY.

---

## 6) De xuat mo hinh phat hanh

- `v0.1.0-oss` (self-hosted single tenant): course, class, enrollment, exam, review, certificate, meet basic.
- `v0.2.0-oss`: plugin cho payment/provider, LTI, import/export.
- `v0.3.0-oss`: multi-tenant + production hardening day du.

---

## 7) Decision can chot som

- License chien luoc:
  - Apache-2.0: than thien doanh nghiep, de duoc adopt.
  - AGPL-3.0: ep chia se sua doi neu deploy SaaS.
- Scope OSS:
  - Open core (module cot loi + plugin private).
  - Full open-source (tat ca module).
- Provider strategy:
  - Mac dinh mock provider (email/storage/payment/ai) cho local.
  - Provider that la optional qua env/config.

