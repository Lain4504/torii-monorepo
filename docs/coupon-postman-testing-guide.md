# Hướng Dẫn Test Coupon API trên Postman

## 📋 Mục Lục
1. [Chuẩn Bị](#chuẩn-bị)
2. [Import Collection](#import-collection)
3. [Cấu Hình Variables](#cấu-hình-variables)
4. [Lấy JWT Token](#lấy-jwt-token)
5. [Test Workflow](#test-workflow)
6. [Test Cases Chi Tiết](#test-cases-chi-tiết)

---

## 🔧 Chuẩn Bị

### 1. Đảm Bảo Services Đang Chạy

**Chạy tất cả services:**
```bash
cd apps/server
pnpm dev
```

Hoặc chạy riêng:
```bash
# Terminal 1: Gateway
pnpm dev:gateway

# Terminal 2: Identity Service (để login)
pnpm dev:identity

# Terminal 3: Learning Service (để test coupon)
pnpm dev:learning
```

### 2. Kiểm tra Services Đã Chạy

- Gateway: `http://localhost:8050`
- Identity Service: Log có `📡 Identity Service NATS microservice listening`
- Learning Service: Log có `📡 Learning Service NATS microservice listening`

---

## 📥 Import Collection

### Bước 1: Mở Postman
1. Mở Postman application
2. Click **Import** (góc trên bên trái)
3. Chọn file: `docs/Coupon_API.postman_collection.json`
4. Click **Import**

### Bước 2: Kiểm tra Collection
- Collection "Coupon API" sẽ xuất hiện trong sidebar
- Có 3 folders:
  - **Coupon CRUD**: Create, Read, Update, Delete
  - **Coupon Validation & Calculation**: Validate và tính discount
  - **Coupon Statistics**: Thống kê

---

## ⚙️ Cấu Hình Variables

### Bước 1: Mở Collection Variables
1. Right-click vào collection "Coupon API"
2. Chọn **Edit**
3. Vào tab **Variables**

### Bước 2: Set Variables

| Variable | Value | Mô Tả |
|----------|-------|-------|
| `base_url` | `http://localhost:8050` | ✅ Đã set sẵn |
| `token` | (để trống, sẽ set sau) | JWT token từ login |
| `coupon_id` | (để trống, tự động lưu) | ID của coupon (tự động lưu sau khi tạo) |
| `course_id` | (set thủ công) | UUID của một course có sẵn |
| `coupon_code` | `SUMMER2024` | ✅ Đã set sẵn |

**Lưu ý:** 
- `coupon_id` sẽ tự động được lưu sau khi tạo coupon thành công
- `course_id` cần set thủ công (lấy từ database hoặc API courses)

---

## 🔐 Lấy JWT Token

### Bước 1: Tạo Request Login (Nếu chưa có)

**Tạo request mới:**
```
POST http://localhost:8050/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### Bước 2: Copy Token

**Response sẽ có:**
```json
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

**Nếu platform là mobile**, response sẽ có:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "...",
    "user": {...}
  }
}
```

**Nếu platform là web**, token được set vào cookies. Để lấy token:
1. Mở DevTools (F12)
2. Vào tab **Application** > **Cookies**
3. Copy giá trị của cookie `access_token`

### Bước 3: Set Token vào Collection Variable

1. Right-click collection "Coupon API" > **Edit**
2. Tab **Variables**
3. Paste token vào `token` variable
4. Click **Save**

---

## 🧪 Test Workflow

### Workflow 1: CRUD Cơ Bản

#### 1. Tạo Coupon (Percentage)
```
Request: Create Coupon (Percentage)
Method: POST
URL: {{base_url}}/api/coupons
```

**Body:**
```json
{
  "code": "SUMMER2024",
  "name": "Summer Sale 2024",
  "description": "Giảm giá mùa hè cho tất cả khóa học",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscountAmount": 500000,
  "minOrderAmount": 100000,
  "applicableCourseIds": [],
  "excludedCourseIds": [],
  "validFrom": "2024-06-01T00:00:00Z",
  "validUntil": "2024-08-31T23:59:59Z",
  "usageLimit": 100,
  "userUsageLimit": 1,
  "status": "active"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "coupon": {
      "id": "abc-123-def-456",
      "code": "SUMMER2024",
      ...
    }
  }
}
```

**✅ Sau khi thành công:**
- `coupon_id` sẽ tự động được lưu vào collection variable
- Xem trong Console: `✅ Coupon ID saved: abc-123-def-456`

#### 2. Lấy Coupon Theo ID
```
Request: Get Coupon by ID
Method: GET
URL: {{base_url}}/api/coupons/{{coupon_id}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "abc-123-def-456",
      "code": "SUMMER2024",
      ...
    }
  }
}
```

#### 3. Update Coupon
```
Request: Update Coupon
Method: PUT
URL: {{base_url}}/api/coupons/{{coupon_id}}
```

**Body:**
```json
{
  "name": "Summer Sale 2024 - Updated",
  "description": "Mô tả mới"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "coupon": {
      "id": "abc-123-def-456",
      "name": "Summer Sale 2024 - Updated",
      ...
    }
  }
}
```

#### 4. Lấy Danh Sách Coupons
```
Request: Get All Coupons
Method: GET
URL: {{base_url}}/api/coupons?page=1&limit=10&status=active&search=
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "abc-123-def-456",
        "code": "SUMMER2024",
        ...
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### 5. Delete Coupon (Soft Delete)
```
Request: Delete Coupon
Method: DELETE
URL: {{base_url}}/api/coupons/{{coupon_id}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Coupon deleted successfully",
  "data": {
    "message": "Coupon deleted successfully"
  }
}
```

---

### Workflow 2: Validation & Calculation

#### 1. Validate Coupon
```
Request: Validate Coupon
Method: POST
URL: {{base_url}}/api/coupons/validate
```

**Body:**
```json
{
  "code": "SUMMER2024",
  "courseId": "{{course_id}}"
}
```

**Expected Response - Valid (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "coupon": {...},
    "discountAmount": 20000,
    "message": null
  }
}
```

**Expected Response - Invalid (200):**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "coupon": {...},
    "discountAmount": null,
    "message": "Coupon đã hết số lượng"
  }
}
```

#### 2. Calculate Discount
```
Request: Calculate Discount
Method: POST
URL: {{base_url}}/api/coupons/calculate-discount
```

**Body:**
```json
{
  "couponId": "{{coupon_id}}",
  "courseId": "{{course_id}}",
  "basePrice": 500000
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "discountAmount": 100000,
    "finalPrice": 400000,
    "isValid": true,
    "message": null
  }
}
```

#### 3. Get Available Coupons
```
Request: Get Available Coupons for Course
Method: GET
URL: {{base_url}}/api/coupons/available/{{course_id}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "abc-123-def-456",
        "code": "SUMMER2024",
        ...
      }
    ]
  }
}
```

---

### Workflow 3: Statistics

#### Get Statistics
```
Request: Get Statistics
Method: GET
URL: {{base_url}}/api/coupons/statistics
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalCoupons": 10,
      "activeCoupons": 5,
      "expiredCoupons": 3,
      "totalUsage": 150,
      "totalDiscountGiven": 0
    }
  }
}
```

---

## ✅ Test Cases Chi Tiết

### Test Case 1: Tạo Coupon Percentage với Max Discount Cap

**Request:** Create Coupon (Percentage)

**Body:**
```json
{
  "code": "PERCENT50_MAX100K",
  "name": "Giảm 50% tối đa 100K",
  "discountType": "percentage",
  "discountValue": 50,
  "maxDiscountAmount": 100000,
  "minOrderAmount": 50000,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "usageLimit": 50,
  "userUsageLimit": 1
}
```

**Verify:**
- ✅ Status code: 201
- ✅ Response có `coupon.id`
- ✅ `coupon_id` được tự động lưu

**Test Calculate Discount:**
```json
{
  "couponId": "{{coupon_id}}",
  "courseId": "{{course_id}}",
  "basePrice": 500000
}
```

**Expected:** `discountAmount` = 100000 (không phải 250000 vì có max cap)

---

### Test Case 2: Tạo Coupon Fixed Amount

**Request:** Create Coupon (Fixed Amount)

**Body:**
```json
{
  "code": "FIXED50K",
  "name": "Giảm 50K",
  "discountType": "fixed_amount",
  "discountValue": 50000,
  "minOrderAmount": 200000,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "usageLimit": null,
  "userUsageLimit": 2
}
```

**Verify:**
- ✅ Status code: 201
- ✅ Không có `maxDiscountAmount` (chỉ dành cho percentage)

---

### Test Case 3: Test Usage Limit

**Steps:**
1. Tạo coupon với `usageLimit: 1`
2. Validate coupon lần 1 → ✅ Success
3. Validate coupon lần 2 → ❌ Should fail với message "Coupon đã hết số lượng"

**Request:** Validate Coupon
```json
{
  "code": "LIMITED1",
  "courseId": "{{course_id}}"
}
```

**Expected lần 2:**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "message": "Coupon đã hết số lượng"
  }
}
```

---

### Test Case 4: Test User Usage Limit

**Steps:**
1. Tạo coupon với `userUsageLimit: 1`
2. Validate với `userId: "user-123"` → ✅ Success
3. Validate lại với cùng `userId: "user-123"` → ❌ Should fail

**Request:** Validate Coupon
```json
{
  "code": "USERLIMIT1",
  "courseId": "{{course_id}}",
  "userId": "user-123"
}
```

**Expected lần 2:**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "message": "Bạn đã sử dụng coupon này 1 lần (giới hạn: 1 lần)"
  }
}
```

---

### Test Case 5: Test Expired Coupon

**Steps:**
1. Tạo coupon với `validUntil` trong quá khứ
2. Validate coupon → ❌ Should fail

**Body tạo coupon:**
```json
{
  "code": "EXPIRED",
  "name": "Expired Coupon",
  "discountType": "percentage",
  "discountValue": 10,
  "validFrom": "2023-01-01T00:00:00Z",
  "validUntil": "2023-12-31T23:59:59Z"
}
```

**Expected khi validate:**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "message": "Coupon chưa đến/đã hết hạn"
  }
}
```

---

### Test Case 6: Test Update Restrictions

**Steps:**
1. Tạo coupon
2. Update coupon (chưa có usage) → ✅ Success
3. Tạo order với coupon này (giả lập `usageCount > 0`)
4. Update các field khác ngoài `name` và `description` → ❌ Should fail

**Request Update (khi usageCount > 0):**
```json
{
  "discountValue": 30
}
```

**Expected:**
```json
{
  "success": false,
  "message": "Cannot update fields discountValue after coupon has been used. Only name and description can be updated."
}
```

---

### Test Case 7: Test Search và Filter

**Request:** Get All Coupons
```
GET {{base_url}}/api/coupons?page=1&limit=10&status=active&search=SUMMER
```

**Verify:**
- ✅ Chỉ trả về coupons có status = "active"
- ✅ Chỉ trả về coupons có code/name/description chứa "SUMMER"
- ✅ Có pagination (page, limit, totalPages)

---

### Test Case 8: Test Get Available Coupons

**Request:** Get Available Coupons for Course
```
GET {{base_url}}/api/coupons/available/{{course_id}}
```

**Verify:**
- ✅ Chỉ trả về coupons có:
  - Status = "active"
  - Valid time (validFrom <= now <= validUntil)
  - usageCount < usageLimit (hoặc usageLimit = null)
  - Không bị excluded cho course này
  - Có thể apply cho course này (applicableCourseIds empty hoặc chứa courseId)

---

## 🐛 Troubleshooting

### Lỗi: "Empty response. There are no subscribers listening..."
**Nguyên nhân:** Learning service chưa chạy

**Giải pháp:**
```bash
cd apps/server
pnpm dev:learning
```

### Lỗi: "Only admins and staff can create coupons"
**Nguyên nhân:** Token không có role ADMIN hoặc STAFF

**Giải pháp:**
- Login với account có role ADMIN hoặc STAFF
- Copy token mới vào collection variable `token`

### Lỗi: "coupon_id is required"
**Nguyên nhân:** Chưa tạo coupon hoặc chưa set `coupon_id` variable

**Giải pháp:**
1. Tạo coupon trước (sẽ tự động lưu `coupon_id`)
2. Hoặc set thủ công: Right-click collection > Edit > Variables > Set `coupon_id`

### Lỗi: "Cannot PUT /api/coupons/"
**Nguyên nhân:** Thiếu coupon ID trong URL

**Giải pháp:**
- Đảm bảo URL là: `PUT /api/coupons/{{coupon_id}}`
- Không phải: `PUT /api/coupons/`

### Lỗi: "Coupon not found"
**Nguyên nhân:** 
- Coupon ID sai
- Coupon đã bị soft delete

**Giải pháp:**
- Kiểm tra `coupon_id` đúng chưa
- Tạo coupon mới và test lại

---

## 📝 Checklist Test

- [ ] ✅ Tạo coupon percentage thành công
- [ ] ✅ Tạo coupon fixed amount thành công
- [ ] ✅ Lấy danh sách coupons với pagination
- [ ] ✅ Lấy coupon theo ID
- [ ] ✅ Lấy coupon theo code
- [ ] ✅ Update coupon thành công
- [ ] ✅ Delete coupon (soft delete)
- [ ] ✅ Validate coupon thành công
- [ ] ✅ Validate coupon thất bại (expired, hết số lượng)
- [ ] ✅ Calculate discount đúng với percentage
- [ ] ✅ Calculate discount đúng với fixed amount
- [ ] ✅ Calculate discount với max discount cap
- [ ] ✅ Get available coupons cho course
- [ ] ✅ Get statistics thành công
- [ ] ✅ Test usage limit
- [ ] ✅ Test user usage limit
- [ ] ✅ Test update restrictions khi có usage

---

## 🎯 Quick Test Flow

**Flow nhanh để test toàn bộ:**

1. **Login** → Copy token → Set vào `token` variable
2. **Create Coupon** → `coupon_id` tự động lưu
3. **Get Coupon by ID** → Verify data
4. **Update Coupon** → Verify updated
5. **Validate Coupon** → Verify validation logic
6. **Calculate Discount** → Verify calculation
7. **Get Statistics** → Verify stats
8. **Delete Coupon** → Verify soft delete

---

## 📚 Tham Khảo

- [Coupon System Evaluation](./coupon-system-evaluation.md)
- [API Testing Guide](./coupon-api-testing-guide.md)
