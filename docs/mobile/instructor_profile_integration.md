# 📱 Tài liệu Tích hợp Mobile: Hồ sơ & Điều hướng Giảng viên

Tài liệu này hướng dẫn đội ngũ Mobile tích hợp tính năng xem hồ sơ giảng viên và đảm bảo hiển thị nhất quán với phiên bản Web.

---

## 🏗 1. Cập nhật Model & API

Hệ thống đã làm giàu (enrich) dữ liệu giảng viên trong các API liên quan đến khóa học và đăng ký.

### A. Đối tượng Instructor (Model)
Mọi nơi hiển thị giảng viên cần sử dụng chung một model:
```dart
class Instructor {
  final String id;
  final String displayName;
  final String? avatarUrl;

  Instructor({required this.id, required this.displayName, this.avatarUrl});

  factory Instructor.fromJson(Map<String, dynamic> json) {
    return Instructor(
      id: json['id'],
      displayName: json['displayName'] ?? json['name'] ?? 'Giảng viên',
      avatarUrl: json['avatarUrl'],
    );
  }
}
```

### B. API Lấy hồ sơ công khai
Sử dụng endpoint sau để hiển thị trang chi tiết giảng viên:
- **Endpoint**: `GET /api/profiles/:id`
- **Mô tả**: Trả về thông tin cá nhân (bio, avatar) và các chỉ số thống kê (stats).

---

## 🎨 2. Quy tắc Hiển thị (UI/UX)

Để đảm bảo thiết kế "Premium" và nhất quán, hãy tuân thủ các quy tắc sau:

### A. Trên thẻ khóa học (Course Cards)
- **Hiển thị**: 1 dòng duy nhất gồm Icon người dùng + Tên giảng viên.
- **Icon**: Sử dụng `Lucide Icons: User` (hoặc tương đương trong Flutter). **Không** sử dụng avatar tròn chứa chữ cái ở cấp độ thẻ để tránh gây rối mắt.
- **Tiền tố**: Luôn đi kèm chữ "Giảng viên: " trước tên.
- **Tương tác**: Cả icon và tên đều phải click được để điều hướng sang trang Hồ sơ.

### B. Trang Hồ sơ Giảng viên (Profile Page)
- **Avatar**: Chỉ hiển thị nếu `avatarUrl != null`.
- **Logic ẩn**: Nếu không có ảnh đại diện, hãy ẩn hoàn toàn khối Avatar tròn. Không dùng ảnh mặc định hay chữ cái thay thế để giữ giao diện sạch sẽ (theo yêu cầu của Product).
- **Danh sách khóa học**: Hiển thị các khóa học của giảng viên đó (gọi API catalog với filter `instructorId`).

---

## 🔗 3. Logic Điều hướng (Navigation)

Khi người dùng nhấn vào giảng viên, điều hướng tới màn hình `InstructorProfile` với tham số:
1. `id`: ID của giảng viên (bắt buộc).
2. `name`: Tên giảng viên (dùng để hiển thị ngay lập tức trong khi chờ API load profile).

**Ví dụ (Flutter):**
```dart
void navigateToInstructor(BuildContext context, Instructor instructor) {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => InstructorProfileScreen(
        instructorId: instructor.id,
        fallbackName: instructor.displayName,
      ),
    ),
  );
}
```

---
**Torii Engineering Team**
 - *Cập nhật lần cuối: 16/04/2026*
