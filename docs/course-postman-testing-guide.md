# Hướng Dẫn Test Tạo Khóa Học trên Postman

## 📋 API Endpoint

```
POST http://localhost:8050/api/courses
```

## 🔐 Authentication

**Yêu cầu:** JWT Token với role `ADMIN` hoặc `LECTURER`

**Headers:**
```
Authorization: Bearer {your-jwt-token}
Content-Type: application/json
```

---

## 📝 Request Body

### Body Tối Thiểu (Required Fields)

```json
{
  "title": "Khóa học tiếng Nhật N5",
  "price": 500000,
  "jlptLevel": "N5"
}
```

### Body Đầy Đủ (Tất Cả Fields)

```json
{
  "title": "Khóa học tiếng Nhật N5 - Cơ bản",
  "type": "vod",
  "description": "Khóa học tiếng Nhật N5 dành cho người mới bắt đầu. Học từ bảng chữ cái đến ngữ pháp cơ bản.",
  "shortDescription": "Khóa học N5 cho người mới bắt đầu",
  "jlptLevel": "N5",
  "price": 500000,
  "discountPrice": 400000,
  "isFree": false,
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "previewVideoUrl": "https://example.com/preview.mp4",
  "durationWeeks": 12,
  "tags": ["N5", "Cơ bản", "Ngữ pháp"],
  "learningOutcomes": [
    "Nắm vững bảng chữ cái Hiragana và Katakana",
    "Hiểu và sử dụng ngữ pháp cơ bản N5",
    "Giao tiếp cơ bản trong cuộc sống hàng ngày"
  ],
  "requirements": [
    "Không cần kiến thức trước",
    "Có thời gian học 2-3 giờ/tuần"
  ],
  "aiMetadata": {},
  "liveConfig": null
}
```

---

## 📋 Các Field Chi Tiết

| Field | Type | Required | Mô Tả | Example |
|-------|------|----------|-------|---------|
| `title` | string | ✅ Yes | Tên khóa học | "Khóa học tiếng Nhật N5" |
| `price` | number | ✅ Yes | Giá khóa học (VND) | 500000 |
| `jlptLevel` | enum | ✅ Yes | Cấp độ JLPT | "N5", "N4", "N3", "N2", "N1" |
| `type` | enum | No | Loại khóa học | "vod" (default) hoặc "live" |
| `description` | string | No | Mô tả chi tiết | "Khóa học..." |
| `shortDescription` | string | No | Mô tả ngắn (max 500 chars) | "Khóa học N5..." |
| `discountPrice` | number | No | Giá giảm | 400000 |
| `isFree` | boolean | No | Miễn phí? | false (default) |
| `thumbnailUrl` | string | No | URL ảnh thumbnail | "https://..." |
| `previewVideoUrl` | string | No | URL video preview | "https://..." |
| `durationWeeks` | number | No | Số tuần học | 12 |
| `tags` | string[] | No | Tags | ["N5", "Cơ bản"] |
| `learningOutcomes` | array | No | Mục tiêu học tập | ["Nắm vững..."] |
| `requirements` | array | No | Yêu cầu | ["Không cần..."] |
| `aiMetadata` | object | No | Metadata cho AI | {} |
| `liveConfig` | object | No | Config cho live course | null |

---

## ✅ Test Cases

### Test Case 1: Tạo Khóa Học Cơ Bản

**Request:**
```
POST http://localhost:8050/api/courses
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Khóa học tiếng Nhật N5",
  "price": 500000,
  "jlptLevel": "N5"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "course": {
      "id": "abc-123-def-456",
      "title": "Khóa học tiếng Nhật N5",
      "slug": "khoa-hoc-tieng-nhat-n5",
      "price": 500000,
      "jlptLevel": "N5",
      "status": "draft",
      "type": "vod",
      "isFree": false,
      ...
    }
  }
}
```

**✅ Verify:**
- Status code: 201
- Response có `course.id`
- `slug` được tự động generate từ `title`
- `status` = "draft" (mặc định)
- `type` = "vod" (mặc định)

---

### Test Case 2: Tạo Khóa Học Live

**Body:**
```json
{
  "title": "Khóa học Live N4",
  "price": 800000,
  "jlptLevel": "N4",
  "type": "live",
  "durationWeeks": 16,
  "liveConfig": {
    "schedule": "Thứ 2, 4, 6 - 19:00-21:00",
    "maxStudents": 30
  }
}
```

**Expected:**
- `type` = "live"
- `liveConfig` được lưu đúng

---

### Test Case 3: Tạo Khóa Học Miễn Phí

**Body:**
```json
{
  "title": "Khóa học miễn phí N5",
  "price": 0,
  "jlptLevel": "N5",
  "isFree": true
}
```

**Expected:**
- `isFree` = true
- `price` = 0

---

### Test Case 4: Tạo Khóa Học Đầy Đủ Thông Tin

**Body:**
```json
{
  "title": "Khóa học tiếng Nhật N5 - Đầy đủ",
  "type": "vod",
  "description": "Khóa học tiếng Nhật N5 dành cho người mới bắt đầu. Học từ bảng chữ cái đến ngữ pháp cơ bản.",
  "shortDescription": "Khóa học N5 cho người mới bắt đầu",
  "jlptLevel": "N5",
  "price": 500000,
  "discountPrice": 400000,
  "isFree": false,
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "previewVideoUrl": "https://example.com/preview.mp4",
  "durationWeeks": 12,
  "tags": ["N5", "Cơ bản", "Ngữ pháp", "Hiragana"],
  "learningOutcomes": [
    "Nắm vững bảng chữ cái Hiragana và Katakana",
    "Hiểu và sử dụng ngữ pháp cơ bản N5",
    "Giao tiếp cơ bản trong cuộc sống hàng ngày",
    "Đạt trình độ N5 JLPT"
  ],
  "requirements": [
    "Không cần kiến thức trước",
    "Có thời gian học 2-3 giờ/tuần",
    "Có máy tính hoặc điện thoại để học"
  ]
}
```

**Expected:**
- Tất cả fields được lưu đúng
- `slug` được generate tự động
- `status` = "draft"

---

## 🎯 Workflow Test Hoàn Chỉnh

### Bước 1: Login và Lấy Token
```
POST http://localhost:8050/api/auth/login
Body: {
  "email": "lecturer@example.com",
  "password": "password"
}
```
→ Copy `access_token` hoặc lấy từ cookies

### Bước 2: Tạo Khóa Học
```
POST http://localhost:8050/api/courses
Authorization: Bearer {token}
Body: {
  "title": "Test Course N5",
  "price": 500000,
  "jlptLevel": "N5"
}
```

### Bước 3: Lấy Course ID từ Response
```json
{
  "data": {
    "course": {
      "id": "course-id-here"
    }
  }
}
```

### Bước 4: Lưu Course ID vào Collection Variable (Để test coupon)
- Right-click collection > Edit > Variables
- Set `course_id` = course ID vừa tạo

### Bước 5: Test Các API Khác
- Get Course: `GET /api/courses/{course_id}`
- Update Course: `PUT /api/courses/{course_id}`
- Publish Course: `POST /api/courses/{course_id}/publish`
- Test Coupon với course này: `POST /api/coupons/validate`

---

## 🐛 Lỗi Thường Gặp

### Lỗi: "Only admins and lecturers can create courses"
**Nguyên nhân:** Token không có role ADMIN hoặc LECTURER

**Giải pháp:**
- Login với account có role ADMIN hoặc LECTURER
- Copy token mới

### Lỗi: "jlptLevel is required"
**Nguyên nhân:** Thiếu field `jlptLevel`

**Giải pháp:**
- Thêm `jlptLevel` vào body (phải là: "N5", "N4", "N3", "N2", hoặc "N1")

### Lỗi: "title is required"
**Nguyên nhân:** Thiếu field `title`

**Giải pháp:**
- Thêm `title` vào body

### Lỗi: "price must be >= 0"
**Nguyên nhân:** `price` < 0 hoặc không phải number

**Giải pháp:**
- Đảm bảo `price` >= 0 và là number

---

## 📝 Postman Collection Example

**Tạo request mới trong Postman:**

1. **Method:** POST
2. **URL:** `{{base_url}}/api/courses`
3. **Headers:**
   - `Authorization`: `Bearer {{token}}`
   - `Content-Type`: `application/json`
4. **Body (raw JSON):**
```json
{
  "title": "Khóa học tiếng Nhật N5",
  "price": 500000,
  "jlptLevel": "N5",
  "description": "Khóa học tiếng Nhật N5 dành cho người mới bắt đầu",
  "shortDescription": "Khóa học N5 cơ bản",
  "tags": ["N5", "Cơ bản"]
}
```

5. **Test Script (Optional - để tự động lưu course_id):**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.course && response.data.course.id) {
        pm.collectionVariables.set('course_id', response.data.course.id);
        console.log('✅ Course ID saved:', response.data.course.id);
    }
}
```

---

## ✅ Checklist

- [ ] ✅ Login thành công với role ADMIN hoặc LECTURER
- [ ] ✅ Set token vào collection variable
- [ ] ✅ Tạo course với body tối thiểu thành công
- [ ] ✅ Tạo course với body đầy đủ thành công
- [ ] ✅ Verify slug được tự động generate
- [ ] ✅ Verify status = "draft"
- [ ] ✅ Lưu course_id để test coupon
- [ ] ✅ Test tạo course với type = "live"
- [ ] ✅ Test tạo course miễn phí (isFree = true)

---

## 📚 Tham Khảo

- Course Controller: `apps/server/modules/gateway/src/modules/learning/controllers/course.controller.ts`
- Course Service: `apps/server/modules/learning/src/modules/course/course.service.ts`
- Course Schema: `packages/schemas/src/models/course.model.ts`
- Course DTO: `packages/schemas/src/dtos/course.dto.ts`
