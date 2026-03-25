# Academy Resource & My Folders - Mobile Integration Guide

Tài liệu này cung cấp các thông tin cần thiết để tích hợp tính năng "Tài nguyên học tập" và "Thư mục của tôi" vào ứng dụng Torii Mobile.

---

## 1. Cấu trúc dữ liệu (Data Structure)

### Các Model chính
Hệ thống được xây dựng dựa trên hai thực thể chính: `AcademyFolder` và `AcademyResource`.

- **AcademyFolder**: Thư mục chứa tài nguyên. Có thể thuộc sở hữu của một Lớp học (`LiveClass`), Giảng viên (`Lecturer`), hoặc Hệ thống (`System`).
- **AcademyResource**: Một mục cụ thể trong thư mục (có thể là File hoặc Link).

### Các Enum quan trọng
```typescript
enum AcademyFolderType {
  LIVE_CLASS_SHARED // Chia sẻ trong lớp học live
  GENERAL           // Thư mục chung
  SHARED            // Được chia sẻ thủ công
  PRIVATE           // Thư mục riêng tư của user
}

enum AcademyResourceType {
  FILE              // File vật lý (PDF, Image, v.v.)
  LINK              // Đường dẫn bên ngoài (Youtube, Webpage)
}

enum AcademyResourceVisibility {
  ENROLLED_ONLY     // Chỉ học viên trong lớp mới thấy
  PUBLIC            // Công khai cho tất cả mọi người
  PRIVATE           // Chỉ người tạo mới thấy
}
```

---

## 2. Các API Endpoints (Gateway)

Tất cả các endpoint yêu cầu truyền `Bearer Token` hợp lệ trong header `Authorization`.

### A. Lấy danh sách Folder cho Học viên
Lấy tất cả các thư mục từ các lớp học mà học viên hiện đang đăng ký.

- **URL**: `GET /api/academy/my-folders/live-classes`
- **Query Params**:
  - `classId` (Tùy chọn): Lọc theo ID lớp học cụ thể.
- **Response**: `SuccessResponse<AcademyFolder[]>`

### B. Lấy nhanh tài nguyên theo Lớp (Quick View)
Lấy toàn bộ tài nguyên từ tất cả các thư mục thuộc một lớp học cụ thể.

- **URL**: `GET /api/academy/my-folders/live-classes/:classId/resources`
- **Response**: `SuccessResponse<AcademyResource[]>`

### C. Lấy danh sách tài nguyên trong một Folder cụ thể
Lấy các tài nguyên thuộc về một `folderId` nhất định.

- **URL**: `GET /api/academy/folders/:folderId/resources`
- **Response**: `SuccessResponse<AcademyResource[]>`

### D. Get Resource Detail / Download
Lấy thông tin chi tiết của một tài nguyên, bao gồm URL file nếu là loại `FILE`.

- **URL**: `GET /api/academy/resources/:resourceId`
- **Response**: `SuccessResponse<AcademyResource>`

---

## 3. Quy trình tích hợp cho Mobile (Workflow)

### Bước 1: Hiển thị "Thư mục của tôi"
1. Gọi API `GET /api/academy/my-folders/live-classes`.
2. Nhóm kết quả theo `liveClass.name` để hiển thị các thư mục theo từng lớp (ví dụ: "Tiếng Nhật N3", "Business Japanese").
3. Hiển thị icon thư mục và tên thư mục.

### Bước 2: Mở một thư mục
1. Khi người dùng chạm vào một thư mục, gọi `GET /api/academy/folders/{folderId}/resources`.
2. Hiển thị danh sách tài nguyên. Sử dụng icon khác nhau cho `FILE` (icon tài liệu) và `LINK` (icon liên kết ngoài).

### Bước 3: Xem/Tải tài nguyên
1. Khi người dùng chạm vào một tài nguyên, gọi `GET /api/academy/resources/{resourceId}`.
2. Nếu `resourceType === 'LINK'`: Mở `externalUrl` bằng trình duyệt hoặc Webview.
3. Nếu `resourceType === 'FILE'`: Sử dụng `fileAsset.publicUrl` để cho phép người dùng xem trước hoặc tải về.

---

## 4. Quy tắc phân quyền (Authorization)
- Gateway sẽ tự động kiểm tra xem người dùng (Học viên) có **đã đăng ký** (`Enrolled`) vào lớp học tương ứng với thư mục đó hay chưa.
- Nếu chưa đăng ký, API sẽ trả về lỗi `403 Forbidden`.
- Các tài nguyên có `visibility: 'PRIVATE'` sẽ không bao giờ được trả về cho học viên.

---

## 5. Flutter Implementation Example

Dưới đây là ví dụ triển khai bằng Flutter (sử dụng package `dio`).

### Models (Dart)
```dart
class AcademyFolder {
  final String id;
  final String name;
  final String? classCode;
  final int resourceCount;

  AcademyFolder({required this.id, required this.name, this.classCode, required this.resourceCount});

  factory AcademyFolder.fromJson(Map<String, dynamic> json) {
    return AcademyFolder(
      id: json['folderId'],
      name: json['folderName'],
      classCode: json['liveClass']?['code'],
      resourceCount: json['resourceCount'] ?? 0,
    );
  }
}

class AcademyResource {
  final String id;
  final String title;
  final String type; // 'FILE' | 'LINK'
  final String? url;

  AcademyResource({required this.id, required this.title, required this.type, this.url});

  factory AcademyResource.fromJson(Map<String, dynamic> json) {
    return AcademyResource(
      id: json['id'],
      title: json['title'],
      type: json['resourceType'],
      url: json['resourceType'] == 'FILE' ? json['downloadUrl'] : json['externalUrl'],
    );
  }
}
```

### Service Class
```dart
class AcademyService {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'YOUR_GATEWAY_URL'));

  Future<List<AcademyFolder>> getMyFolders() async {
    final response = await _dio.get('/api/academy/my-folders/live-classes');
    final List data = response.data['data'];
    return data.map((e) => AcademyFolder.fromJson(e)).toList();
  }

  Future<List<AcademyResource>> getResources(String folderId) async {
    final response = await _dio.get('/api/academy/folders/$folderId/resources');
    final List data = response.data['data'];
    return data.map((e) => AcademyResource.fromJson(e)).toList();
  }
}
```
