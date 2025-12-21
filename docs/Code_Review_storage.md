## 📌 Summary
<!-- Tóm tắt ngắn gọn nội dung PR -->

- What does this PR do?
  - Implement Storage Microservice để quản lý file upload và operations sử dụng Supabase Storage
  - Tạo database schema `file_assets` làm Source of Truth cho tất cả files trong hệ thống
  - Triển khai Presigned URL pattern để giảm tải server, cho phép client upload trực tiếp lên Supabase Storage
  - Tích hợp Storage Service với Gateway qua NATS microservices communication

---

## 📁 Related Issues / Tickets
<!-- Ví dụ: Fixes #123 hoặc liên kết task trong Jira, Trello -->
- Issue/Ticket: #

---

## 🔍 Changes
<!-- Liệt kê những thay đổi chính -->
- [x] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] UI/UX update
- [ ] Performance improvement
- [ ] Config/Chore

**Details:**
- Tạo mới Storage Microservice tại `apps/server/modules/storage-service`
- Thêm database migration cho table `file_assets` với schema đầy đủ (id, fileName, fileKey, bucketName, provider, mimeType, fileSize, metadata JSONB, ownerId, moduleOrigin, status)
- Implement StorageService với các methods: `generatePresignedUploadUrl`, `confirmUpload`, `deleteFile`, `getFileUrl`
- Tích hợp Supabase Storage SDK với auto bucket creation
- Thêm Gateway endpoints: `POST /storage/upload-url`, `POST /storage/confirm`, `DELETE /storage/:id`
- Cấu hình NATS message patterns cho inter-service communication

---

## 🧪 How to Test
<!-- Hướng dẫn reviewer test PR -->
1. Step 1: Đảm bảo các services đang chạy (Gateway, Storage Service, NATS, PostgreSQL)
2. Step 2: Gọi `POST /storage/upload-url` với body: `{ "filename": "test.jpg", "contentType": "image/jpeg", "module": "USER", "ownerId": "uuid-optional" }`
3. Step 3: Sử dụng `uploadUrl` từ response để upload file trực tiếp lên Supabase Storage (PUT request)
4. Step 4: Gọi `POST /storage/confirm` với body: `{ "fileId": "file-id-from-step-2" }` để xác nhận upload
5. Expected result: File được upload thành công, record trong `file_assets` có status `UPLOADED`, có thể verify file trong Supabase Dashboard

---

## 📝 Notes (Optional)
<!-- Thông tin thêm nếu cần -->
- Cần set environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
- Bucket sẽ được tự động tạo nếu chưa tồn tại (yêu cầu SERVICE_ROLE_KEY)
- File key được generate theo pattern: `{module}/{uuid}.{extension}`

---

## 📷 Screenshots / API Request (Optional)
<!-- UI screenshots hoặc example API JSON nếu có -->

**Example Request:**
```json
POST /storage/upload-url
{
  "filename": "avatar.png",
  "contentType": "image/png",
  "module": "USER",
  "ownerId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Example Response:**
```json
{
  "uploadUrl": "https://...supabase.co/storage/v1/object/file-assets/USER/...png?token=...",
  "fileId": "uuid",
  "fileKey": "USER/uuid.png",
  "expiresIn": 3600
}
```

---

## ✔️ Checklist Before Requesting Review
- [x] My code follows the project coding standards
- [x] I have tested this code locally
- [ ] I added/updated unit tests if needed
- [x] I updated documentation (API docs, comments, README)
- [x] No console logs / debug code left
- [x] No unused imports / variables
- [x] Code is formatted (Prettier/ESLint)
