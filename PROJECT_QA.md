# PROJECT Q&A

> Dùng để track câu hỏi / quyết định / clarification cho dự án.  
> Khi câu hỏi liên quan backend spec, trích dẫn file spec tương ứng (ví dụ: `apps/server/live-session-instances-spec.md`, `apps/server/services/academy/live-class-commerce-spec.md`).

| Date | Question | By | Priority | Status | Note (answer, other notes) |
|---|---|---|---|---|---|
| 2026-04-15 | Mobile learner app (Flutter) nằm ở đâu và mapping màn hình chính là gì để verify “learner parity”? |  | Medium | Answered | Có trong workspace: `torri-mobile` (Flutter + GoRouter). Router ở `torri-mobile/lib/core/routing/app_router.dart`; `FUNCTION_REPORT.md` #75 đã cập nhật theo route/screens thực tế |
| 2026-04-15 | Quy trình đăng ký/verify email của learner: trigger nào dẫn tới `/verify-request` và `/verify`? |  | Medium | Open | Screens tồn tại ở `apps/web-learner/app/(auth)/verify-request`, `.../verify`, `.../resend-verification` |
| 2026-04-15 | Flow 2FA: khi nào vào `/verify-2fa` (learner) và `/auth/verify-2fa` (admin)? temp token lưu ở đâu? |  | Medium | Open | Learner 2FA page dùng `sessionStorage` key `2fa_tempToken` (`apps/web-learner/app/(auth)/verify-2fa/page.tsx`) |
| 2026-04-15 | Coupon scope GLOBAL: áp dụng cho Cohort/LiveClass/VodPackage như thế nào? Có giới hạn theo user/đơn hàng không? |  | High | Open | Theo spec `apps/server/services/academy/live-class-commerce-spec.md` (coupon scope GLOBAL). Screens liên quan: learner `/dashboard/coupons`, `/checkout/[courseId]`; admin `/coupons` |
| 2026-04-15 | Enrollment/Order: quy tắc “mua” (Cohort vs LiveClass vs VodPackage) và trạng thái Enrollment là gì? |  | High | Open | Theo spec `apps/server/services/academy/live-class-commerce-spec.md` |
| 2026-04-15 | Lịch học live sessions: join theo `sessionId` hay theo instance? reschedule tạo instance mới hay update instance hiện tại? |  | High | Open | Theo spec `apps/server/live-session-instances-spec.md`; learner screen `/dashboard/schedule`, admin screen `academy/live-classes/reschedule-requests` |
| 2026-04-15 | Certificates: route public `/verify/[code]` hỗ trợ verify cho class/vod? có cần auth không? |  | Medium | Open | Learner page `apps/web-learner/app/(dashboard)/verify/[code]/page.tsx` có xử lý khi không login (nút quay về `/`) |
| 2026-04-15 | Meet: Polls API dùng protobuf, auth header là gì (token format)? ai cấp token? |  | Medium | Open | `apps/meet/src/store/services/pollsApi.ts` set `Authorization` từ `state.session.token`, baseUrl `${SERVER_URL}/api/polls` |
| 2026-04-15 | Meet: Waiting room approval rule (ai là presenter/admin)? metadata `waitForApproval` set từ đâu? |  | Medium | Open | UI ở `apps/meet/src/components/waiting-room/*` filter `participant.metadata.waitForApproval` |
| 2026-04-15 | Meet: Whiteboard sync qua data channel: ai được quyền presenter, có conflict resolution không? |  | Medium | Open | Handler ở `apps/meet/src/helpers/nats/HandleWhiteboard.ts` check `currentUser.metadata.isPresenter` |
| 2026-04-15 | Admin Academy Live Class detail: các tab (`schedule`, `assignments`, `students`, ...) map ra route nào và rule permission? |  | Medium | Open | Redirect tab ở `apps/web-admin/src/App.tsx` (`NavigateToClassTab`) và `RoutePermissionGuard` anyPermission `lms.delivery.*` |
| 2026-04-15 | Các mục Marketing “Posts/Sliders”: có nằm ở repo/nhánh khác hay đã bị thay bằng Blogs? |  | Medium | Open | `FUNCTION_REPORT.md` #9–#12 đang ghi “không thấy”; cần confirm stakeholder/Azure |
| 2026-04-15 | Định nghĩa “Planned/Iteration” trong report: dùng cho kế hoạch team hay trạng thái release? ai là owner source-of-truth? |  | Low | Open | Đề xuất: đồng bộ với sprint plan/Jira nếu có; hiện chỉ là placeholder trong docs |

