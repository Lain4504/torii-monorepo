# Hướng Dẫn Chạy và Test Coupon API trên Postman

## 📋 Mục Lục
1. [Chuẩn Bị Môi Trường](#chuẩn-bị-môi-trường)
2. [Chạy Server](#chạy-server)
3. [Cấu Hình Postman](#cấu-hình-postman)
4. [Test Cases](#test-cases)
5. [API Endpoints](#api-endpoints)

---

## 🔧 Chuẩn Bị Môi Trường

### 1. Kiểm tra Dependencies
```bash
# Từ root của monorepo
pnpm install
```

### 2. Kiểm tra Database
```bash
# Đảm bảo database đã có bảng coupons
cd apps/server
npx prisma generate
```

### 3. Kiểm tra NATS Server
```bash
# NATS server phải đang chạy (thường chạy trên port 4222)
# Kiểm tra trong .env: NATS_URL=nats://localhost:4222
```

---

## 🚀 Chạy Server

### Option 1: Chạy Tất Cả Services (Development)
```bash
# Từ root của monorepo
cd apps/server
pnpm dev
```

Lệnh này sẽ chạy:
- Gateway (port 8080)
- Learning Service (port 8082)
- Các services khác...

### Option 2: Chỉ Chạy Gateway và Learning Service
```bash
cd apps/server

# Terminal 1: Gateway
pnpm dev:gateway

# Terminal 2: Learning Service
pnpm dev:learning
```

### Kiểm tra Server Đã Chạy
```bash
# Health check
curl http://localhost:8080/health

# Hoặc trong browser
http://localhost:8080/health
```

---

## 📮 Cấu Hình Postman

### 1. Tạo Environment
Tạo một environment mới trong Postman với các variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8080` | `http://localhost:8080` |
| `token` | (để trống, sẽ lấy sau khi login) | |
| `coupon_id` | (để trống, sẽ lấy sau khi tạo coupon) | |
| `course_id` | (UUID của một course có sẵn) | |

### 2. Tạo Collection
Tạo collection mới tên "Coupon API" và thêm các requests như sau:

---

## 📝 API Endpoints

### Base URL
```
http://localhost:8080/api/coupons
```

### Authentication
Hầu hết endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Test Cases

### 1. **Tạo Coupon (Create Coupon)**

**Endpoint:** `POST /api/coupons`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
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

**Expected Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "coupon": {
      "id": "uuid-here",
      "code": "SUMMER2024",
      "name": "Summer Sale 2024",
      ...
    }
  }
}
```

**Test với Fixed Amount:**
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

---

### 2. **Lấy Danh Sách Coupons (Get All Coupons)**

**Endpoint:** `GET /api/coupons?page=1&limit=10&status=active&search=SUMMER`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 10)
- `status` (optional): Filter theo status (`active`, `inactive`, `expired`)
- `search` (optional): Tìm kiếm theo code, name, description

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3. **Lấy Coupon Theo ID**

**Endpoint:** `GET /api/coupons/:id`

**Headers:**
```
(Public endpoint - không cần token)
```

**Example:**
```
GET /api/coupons/123e4567-e89b-12d3-a456-426614174000
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "...",
      "code": "SUMMER2024",
      ...
    }
  }
}
```

---

### 4. **Lấy Coupon Theo Code**

**Endpoint:** `GET /api/coupons/code/:code`

**Headers:**
```
(Public endpoint - không cần token)
```

**Example:**
```
GET /api/coupons/code/SUMMER2024
```

---

### 5. **Cập Nhật Coupon**

**Endpoint:** `PUT /api/coupons/:id`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Summer Sale 2024 - Updated",
  "description": "Mô tả mới"
}
```

**Lưu ý:** Nếu coupon đã có `usageCount > 0`, chỉ có thể update `name` và `description`.

---

### 6. **Xóa Coupon (Soft Delete)**

**Endpoint:** `DELETE /api/coupons/:id`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
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

### 7. **Validate Coupon**

**Endpoint:** `POST /api/coupons/validate`

**Headers:**
```
Content-Type: application/json
(Public endpoint - không cần token)
```

**Body (JSON):**
```json
{
  "code": "SUMMER2024",
  "courseId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001"
}
```

**Expected Response (Valid):**
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

**Expected Response (Invalid):**
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

---

### 8. **Tính Toán Discount**

**Endpoint:** `POST /api/coupons/calculate-discount`

**Headers:**
```
Content-Type: application/json
(Public endpoint - không cần token)
```

**Body (JSON):**
```json
{
  "couponId": "123e4567-e89b-12d3-a456-426614174000",
  "courseId": "123e4567-e89b-12d3-a456-426614174000",
  "basePrice": 500000
}
```

**Expected Response:**
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

---

### 9. **Lấy Thống Kê Coupons**

**Endpoint:** `GET /api/coupons/statistics`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
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

### 10. **Lấy Coupons Khả Dụng Cho Course**

**Endpoint:** `GET /api/coupons/available/:courseId`

**Headers:**
```
(Public endpoint - không cần token)
```

**Example:**
```
GET /api/coupons/available/123e4567-e89b-12d3-a456-426614174000
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "...",
        "code": "SUMMER2024",
        ...
      }
    ]
  }
}
```

---

## 🔐 Lấy JWT Token (Để Test Protected Endpoints)

### 1. Login để lấy token

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  ...
}
```

### 2. Copy token và set vào environment variable `token` trong Postman

---

## ✅ Test Scenarios

### Scenario 1: Tạo và Validate Coupon
1. Tạo coupon với code "TEST2024"
2. Validate coupon với một courseId
3. Kiểm tra response có `isValid: true`

### Scenario 2: Test Usage Limit
1. Tạo coupon với `usageLimit: 1`
2. Validate coupon lần 1 → Success
3. Validate coupon lần 2 → Should fail với message "Coupon đã hết số lượng"

### Scenario 3: Test User Usage Limit
1. Tạo coupon với `userUsageLimit: 1`
2. Validate với userId A → Success
3. Validate lại với cùng userId A → Should fail

### Scenario 4: Test Expired Coupon
1. Tạo coupon với `validUntil` trong quá khứ
2. Validate coupon → Should fail với message "Coupon chưa đến/đã hết hạn"

### Scenario 5: Test Percentage Discount với Max Cap
1. Tạo coupon: `discountType: "percentage"`, `discountValue: 50`, `maxDiscountAmount: 100000`
2. Calculate discount với `basePrice: 500000`
3. Kiểm tra `discountAmount` = 100000 (không phải 250000)

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to NATS"
- Kiểm tra NATS server đang chạy: `nats server --config nats_server.conf`
- Kiểm tra `NATS_URL` trong `.env`

### Lỗi: "Coupon not found"
- Kiểm tra coupon ID/code đúng chưa
- Kiểm tra coupon đã bị soft delete chưa (`deletedAt`)

### Lỗi: "Only admins and staff can create coupons"
- Đảm bảo user đang login có role `ADMIN` hoặc `STAFF`
- Kiểm tra JWT token có đúng role không

### Lỗi: "Database connection error"
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` trong `.env`

---

## 📚 Tham Khảo

- [Coupon System Evaluation](./docs/coupon-system-evaluation.md)
- [API Specifications](./docs/srs-07-api-specifications.md)
