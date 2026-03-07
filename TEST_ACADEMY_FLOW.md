# Test Data - Academy Complete Flow

Tài liệu này cung cấp dữ liệu mẫu để test luồng tạo hoàn chỉnh từ **Course Profile** → **Course Edition** → **Class** → **Course Offering**.

## 📋 Flow Overview

```
Course Profile (Khóa học trừu tượng)
    ↓
Course Edition (Phiên bản cụ thể)
    ↓
Class (Lớp học thực tế)
    ↓
Course Offering (Gói bán khóa học)
```

---

## 1. Course Profile (Khóa học trừu tượng)

**Endpoint:** `POST /api/academy/course-profiles`

### ✅ Dữ liệu tạo mới

```json
{
  "code": "JLPT_N5_2024",
  "title": "Japanese Language Proficiency Test N5",
  "shortTitle": "JLPT N5",
  "description": "{\"blocks\":[{\"type\":\"paragraph\",\"data\":{\"text\":\"Khóa học tiếng Nhật cơ bản, chuẩn bị cho kỳ thi JLPT N5. Học viên sẽ nắm vững 800 từ vựng, 100 Kanji cơ bản và ngữ pháp nền tảng.\"}}]}",
  "subject": "Japanese",
  "level": "N5",
  "defaultLanguage": "vi",
  "thumbnailUrl": "https://example.com/jlpt-n5-thumbnail.jpg"
}
```

### 📝 Ghi chú
- `code`: Mã định danh duy nhất, không thể thay đổi sau khi tạo
- `description`: JSON string từ Editor.js hoặc HTML
- `thumbnailUrl`: URL ảnh đại diện (optional)

---

## 2. Course Edition (Phiên bản khóa học)

**Endpoint:** `POST /api/academy/course-editions`

### ✅ Dữ liệu tạo mới

```json
{
  "courseProfileId": "<COURSE_PROFILE_ID_FROM_STEP_1>",
  "editionTag": "2024_Q1",
  "status": "active",
  "syllabusSnapshot": {
    "chapters": [
      {
        "title": "Chương 1: Hiragana & Katakana",
        "order": 1,
        "lessons": ["Bài 1: Hiragana あ-の", "Bài 2: Hiragana は-ん"]
      },
      {
        "title": "Chương 2: Ngữ pháp cơ bản",
        "order": 2,
        "lessons": ["Bài 3: です・ます", "Bài 4: Trợ từ は・が・を"]
      }
    ],
    "totalHours": 60
  },
  "changelog": "Phiên bản Q1/2024: Cập nhật giáo trình mới, thêm bài tập tương tác"
}
```

### 📝 Ghi chú
- `courseProfileId`: UUID lấy từ response của bước 1
- `editionTag`: Tên tag/phiên bản (vd: "2024_Q1", "v1.0", "spring_2024")
- `syllabusSnapshot`: Cấu trúc giáo trình (JSON object)
- `status`: "draft", "active", "archived"

---

## 3. Class (Lớp học thực tế)

**Endpoint:** `POST /api/academy/classes`

### ✅ Dữ liệu tạo mới

```json
{
  "courseProfileId": "<COURSE_PROFILE_ID_FROM_STEP_1>",
  "courseEditionId": "<COURSE_EDITION_ID_FROM_STEP_2>",
  "code": "JLPT_N5_2024_CLASS_01",
  "name": "JLPT N5 - Lớp sáng Thứ 2,4,6",
  "mode": "online",
  "term": "Q1 2024",
  "batch": "Batch 01",
  "startDate": "2024-04-01T00:00:00.000Z",
  "endDate": "2024-06-30T23:59:59.999Z",
  "enrollmentOpenAt": "2024-03-01T00:00:00.000Z",
  "enrollmentCloseAt": "2024-03-25T23:59:59.999Z",
  "minStudents": 10,
  "maxStudents": 30,
  "status": "scheduled",
  "primaryTeacherId": "<TEACHER_UUID>",
  "companyId": null,
  "settings": {
    "timezone": "Asia/Ho_Chi_Minh",
    "schedulePattern": "Mon,Wed,Fri 9:00-11:00",
    "allowLateEnrollment": true,
    "requireApproval": false
  }
}
```

### 📝 Ghi chú
- `mode`: "online", "offline", "hybrid"
- `status`: "draft", "scheduled", "active", "completed", "cancelled"
- `primaryTeacherId`: UUID của giáo viên chính (optional)
- `companyId`: UUID công ty (nếu là corporate training)
- Dates được định dạng ISO 8601

### ✅ Ví dụ khác (Lớp offline)

```json
{
  "courseProfileId": "<COURSE_PROFILE_ID_FROM_STEP_1>",
  "courseEditionId": "<COURSE_EDITION_ID_FROM_STEP_2>",
  "code": "JLPT_N5_2024_CLASS_02",
  "name": "JLPT N5 - Lớp tối Thứ 3,5,7",
  "mode": "offline",
  "term": "Q2 2024",
  "batch": "Batch 02",
  "startDate": "2024-07-01T00:00:00.000Z",
  "endDate": "2024-09-30T23:59:59.999Z",
  "enrollmentOpenAt": "2024-06-01T00:00:00.000Z",
  "enrollmentCloseAt": "2024-06-25T23:59:59.999Z",
  "minStudents": 15,
  "maxStudents": 25,
  "status": "scheduled",
  "settings": {
    "location": "Trung tâm Quận 1, TP.HCM",
    "room": "Phòng A203",
    "schedulePattern": "Tue,Thu,Sat 18:30-20:30"
  }
}
```

---

## 4. Course Offering (Gói bán khóa học)

**Endpoint:** `POST /api/academy/course-offerings`

### ✅ Dữ liệu tạo mới

```json
{
  "code": "JLPT_N5_2024_Q1_OFFER",
  "title": "Khóa học JLPT N5 - Khai giảng Q1 2024",
  "description": "<p>🎓 Học JLPT N5 cùng giáo viên Nhật Bản</p><p>✅ Cam kết đầu ra</p><p>🎁 Tặng kèm tài liệu học tập</p>",
  "type": "standard",
  "originalPrice": 3500000,
  "currency": "VND",
  "status": "available",
  "salesStartAt": "2024-03-01T00:00:00.000Z",
  "salesEndAt": "2024-03-25T23:59:59.999Z",
  "metadata": {
    "discountPrice": 2999000,
    "earlyBirdDeadline": "2024-03-10T23:59:59.999Z",
    "includes": [
      "60 giờ học trực tiếp",
      "Tài liệu độc quyền",
      "Thi thử 3 lần",
      "Hỗ trợ online 24/7"
    ],
    "installmentOptions": true,
    "maxInstallments": 3
  },
  "classIds": [
    "<CLASS_ID_01_FROM_STEP_3>",
    "<CLASS_ID_02_FROM_STEP_3>"
  ],
  "courseProfileId": "<COURSE_PROFILE_ID_FROM_STEP_1>",
  "courseEditionId": "<COURSE_EDITION_ID_FROM_STEP_2>"
}
```

### 📝 Ghi chú
- `type`: "standard", "premium", "bundle"
- `status`: "draft", "available", "soldout", "expired"
- `originalPrice`: Giá gốc (số nguyên)
- `currency`: "VND", "USD", "JPY"
- `classIds`: Array các class UUID thuộc offering này
- `metadata`: Thông tin mở rộng (discount, installment, benefits...)

### ✅ Ví dụ khác (Gói Premium)

```json
{
  "code": "JLPT_N5_2024_PREMIUM",
  "title": "JLPT N5 Premium - Luyện thi chuyên sâu",
  "description": "<h3>Gói Premium All-in-One</h3><ul><li>1-on-1 coaching</li><li>Học không giới hạn</li><li>Cam kết đậu 100%</li></ul>",
  "type": "premium",
  "originalPrice": 8500000,
  "currency": "VND",
  "status": "available",
  "salesStartAt": "2024-03-01T00:00:00.000Z",
  "salesEndAt": "2024-12-31T23:59:59.999Z",
  "metadata": {
    "vipSupport": true,
    "personalCoach": true,
    "unlimitedRetake": true,
    "certificateGuarantee": true
  },
  "courseProfileId": "<COURSE_PROFILE_ID_FROM_STEP_1>",
  "courseEditionId": "<COURSE_EDITION_ID_FROM_STEP_2>"
}
```

---

## 🔄 Complete Test Flow

### Step-by-step với curl

#### 1. Tạo Course Profile
```bash
curl -X POST http://localhost:3000/api/academy/course-profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "JLPT_N5_2024",
    "title": "Japanese Language Proficiency Test N5",
    "shortTitle": "JLPT N5",
    "subject": "Japanese",
    "level": "N5",
    "defaultLanguage": "vi"
  }'
```

**Lưu lại:** `courseProfileId` từ response

#### 2. Tạo Course Edition
```bash
curl -X POST http://localhost:3000/api/academy/course-editions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "courseProfileId": "COURSE_PROFILE_ID_HERE",
    "editionTag": "2024_Q1",
    "status": "active"
  }'
```

**Lưu lại:** `courseEditionId` từ response

#### 3. Tạo Class (có thể tạo nhiều class)
```bash
curl -X POST http://localhost:3000/api/academy/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "courseProfileId": "COURSE_PROFILE_ID_HERE",
    "courseEditionId": "COURSE_EDITION_ID_HERE",
    "code": "JLPT_N5_2024_CLASS_01",
    "name": "JLPT N5 - Lớp sáng",
    "mode": "online",
    "startDate": "2024-04-01",
    "endDate": "2024-06-30",
    "maxStudents": 30,
    "status": "scheduled"
  }'
```

**Lưu lại:** `classId` từ response

#### 4. Tạo Course Offering
```bash
curl -X POST http://localhost:3000/api/academy/course-offerings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "JLPT_N5_2024_Q1_OFFER",
    "title": "Khóa học JLPT N5 - Q1 2024",
    "originalPrice": 3500000,
    "currency": "VND",
    "status": "available",
    "courseProfileId": "COURSE_PROFILE_ID_HERE",
    "courseEditionId": "COURSE_EDITION_ID_HERE",
    "classIds": ["CLASS_ID_HERE"]
  }'
```

---

## 📌 Tips & Notes

### Quan hệ giữa các entity:
- **1 Course Profile** → **N Course Editions** (1-nhiều)
- **1 Course Edition** → **N Classes** (1-nhiều)
- **1 Course Offering** → **N Classes** (nhiều-nhiều)
- **1 Course Offering** → **1 Course Profile + 1 Course Edition** (tham chiếu)

### Status workflow:
```
Course Profile: active
Course Edition: draft → active → archived
Class: draft → scheduled → active → completed/cancelled
Course Offering: draft → available → soldout/expired
```

### Common issues:
- ⚠️ Phải tạo Course Profile trước khi tạo Course Edition
- ⚠️ Class phải có cả `courseProfileId` và `courseEditionId`
- ⚠️ Course Offering có thể link nhiều classes
- ⚠️ Dates phải theo format ISO 8601
- ⚠️ UUIDs phải valid (lấy từ response của API)

---

## 🧪 Quick Test Scenarios

### Scenario 1: Khóa học online đơn giản
1. Tạo Course Profile: JLPT N5
2. Tạo Edition: 2024_Q1
3. Tạo 1 Class online
4. Tạo Offering cơ bản

### Scenario 2: Khóa học với nhiều lớp
1. Tạo Course Profile: JLPT N5
2. Tạo Edition: 2024_Q1
3. Tạo 3 Classes (sáng/chiều/tối)
4. Tạo 1 Offering bao gồm cả 3 classes

### Scenario 3: Offering Premium riêng biệt
1. Sử dụng Course Profile + Edition đã có
2. Không tạo Class mới
3. Tạo Offering Premium với metadata đặc biệt

---

## 📚 Related Documentation

- API Documentation: `/docs/api/academy`
- Database Schema: `/apps/server/prisma/schema.prisma`
- Frontend Forms: `/apps/web-admin/src/components/academy/`

---

**Last Updated:** March 7, 2026
**Maintainer:** Development Team
