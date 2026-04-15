# PROJECT ISSUES

> Dùng để theo dõi issue cấp dự án (scope/tech/process) ảnh hưởng nhiều module.
>
> Tham chiếu màn hình/chức năng: xem `FUNCTION_REPORT.md`.

| # | Issue | Potential Impact | Priority | Owner | Open Date | Close Date | Status | Notes |
|---:|---|---|---|---|---|---|---|---|
| 1 | Mobile app đã có trong workspace (`torri-mobile`) nhưng tên dự án/thư mục không đồng nhất (“torii” vs “torri”) | Rủi ro nhầm lẫn repo, CI/CD path, và tài liệu tham chiếu | Medium | HuyNMG | 2026-04-15 |  | Open | `FUNCTION_REPORT.md` #75 đã cập nhật theo route/screens trong `torri-mobile/lib/core/routing/app_router.dart` |
| 2 | Route Learner có group `(auth)/(dashboard)/(learning)` → cần chuẩn hoá mapping screen/URL khi viết testcases | Lệch route trong tài liệu/testcase gây fail UAT/QA | Medium | HuyNMG | 2026-04-15 |  | Open | Ví dụ learner có `/verify-request`, `/verify`, `/resend-verification`, `/verify-2fa`; chứng chỉ verify `/verify/[code]` |
| 3 | RBAC Admin phụ thuộc `RoutePermissionGuard` + permission strings | Rủi ro: thiếu permission mapping → “AccessDenied/Unauthorized” sai, blocker vận hành | High | HuyNG | 2026-04-15 |  | Open | Xem `apps/web-admin/src/App.tsx` (guard + permission) |
| 4 | Live session “instances/reschedule workflow” cần bám spec backend | Rủi ro mismatch UI lịch học / join theo `sessionId` / reschedule approve | High | HuyNG | 2026-04-15 |  | Open | Theo spec `apps/server/live-session-instances-spec.md` và admin route `academy/live-classes/reschedule-requests` |
| 5 | Commerce spec: coupon scope GLOBAL, Order/Enrollment flows | Rủi ro sai nghiệp vụ giảm giá/ghi nhận Enrollment/Order, ảnh hưởng doanh thu | High | HuyNG | 2026-04-15 |  | Open | Theo `apps/server/services/academy/live-class-commerce-spec.md` và screens: learner `/checkout/[courseId]`, admin `/coupons`, `/orders` |
| 6 | Meet app phụ thuộc nhiều module realtime (NATS/data message, protobuf APIs) | Rủi ro race condition/khó debug; QA cần checklist riêng cho whiteboard/polls/waiting-room | Medium | DucBH | 2026-04-15 |  | Open | Ví dụ polls gọi `/api/polls` (protobuf) ở `apps/meet/src/store/services/pollsApi.ts`; whiteboard sync ở `apps/meet/src/helpers/nats/HandleWhiteboard.ts` |
| 7 | Các mục Marketing “Posts/Sliders” hiện ghi “không thấy” | Nếu stakeholder kỳ vọng CMS marketing thật → lệch scope/thiếu feature | Medium | HuyLQ | 2026-04-15 |  | Open | `FUNCTION_REPORT.md` #9–#12: cần confirm nguồn khác (Azure/rep khác) hoặc remove khỏi scope chính thức |

