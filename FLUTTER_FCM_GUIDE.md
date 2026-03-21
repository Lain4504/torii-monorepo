# Hướng Dẫn Tích Hợp Firebase Cloud Messaging (FCM) Cho Flutter (Torii Project)

Tài liệu này cung cấp hướng dẫn chi tiết để kết nối ứng dụng Flutter của bạn với hệ thống Push Notification của Torii Server.

## 1. Chuẩn Bị (Prerequisites)

1.  **Firebase Project**: Dự án của bạn đã được cấu hình trên Firebase Console với ID `flutterapp-8448e`.
2.  **Flutter SDK**: Đã cài đặt phiên bản mới nhất.
3.  **Công cụ FlutterFire CLI**:
    ```bash
    dart pub global activate flutterfire_cli
    ```

## 2. Cấu Hình Firebase (Flutter Side)

Chạy lệnh sau tại thư mục gốc của dự án Flutter để tự động thiết lập các file liên kết:
```bash
flutterfire configure
```
*Chọn dự án `flutterapp-8448e` khi được nhắc.*

Thêm các thư viện cần thiết vào `pubspec.yaml`:
```bash
flutter pub add firebase_core firebase_messaging http
```

## 3. Triển Khai Code Trong Flutter (`main.dart`)

Dưới đây là đoạn code chuẩn để khởi tạo FCM và **gửi Token về Torii Server**.

```dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
// import 'firebase_options.dart'; // Import này sẽ có khi bạn chạy flutterfire configure

// 1. Xử lý thông báo khi App chạy ngầm (Background/Terminated)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Đã nhận tin nhắn dưới background: ${message.messageId}");
}

// 2. Hàm đăng ký Device Token với Torii Server
Future<void> registerDeviceToken(String token, String jwtToken) async {
  // Thay url này bằng tên miền API thật của bạn
  const String apiUrl = "https://api.torii.sbs/api/notifications/register-token";
  
  try {
    final response = await http.post(
      Uri.parse(apiUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken', // Cần Token đăng nhập của user
      },
      body: jsonEncode({
        "token": token,
        "platform": Platform.isAndroid ? "android" : "ios",
        "deviceName": "Mobile app", 
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      print("Token đã được đăng ký thành công trên Torii Server");
    } else {
      print("Lỗi đăng ký Token: ${response.body}");
    }
  } catch (e) {
    print("Không thể kết nối tới Torii Server: $e");
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Khởi tạo Firebase
  await Firebase.initializeApp();

  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(const MyApp());
}

// Gợi ý: Gọi setupFCM sau khi user đã Đăng nhập thành công
Future<void> setupFCM(String userJwt) async {
  final fcm = FirebaseMessaging.instance;

  // Yêu cầu quyền (Quan trọng cho iOS)
  await fcm.requestPermission();

  // Lấy Token hiện tại
  String? token = await fcm.getToken();
  if (token != null) {
    print("FCM Token: $token");
    await registerDeviceToken(token, userJwt);
  }

  // Lắng nghe khi Token thay đổi (refresh)
  fcm.onTokenRefresh.listen((newToken) {
    registerDeviceToken(newToken, userJwt);
  });

  // Xử lý thông báo khi đang mở app (Foreground)
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('Nhận được thông báo: ${message.notification?.title}');
  });
}
```

## 4. Cấu Hình Nền Tảng (Native)

### Android
Thêm icon mặc định cho thông báo vào `android/app/src/main/AndroidManifest.xml` (trong thẻ `<application>`):
```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@mipmap/ic_launcher" />
```

### iOS
Mở thư mục `ios/` bằng Xcode:
- Tab **Signing & Capabilities**: Thêm **Push Notifications**.
- Thêm **Background Modes**: Tick chọn **Remote notifications**.

## 5. Kiểm Tra (Testing)

1.  Chạy ứng dụng Flutter, kiểm tra Log và copy **FCM Token**.
2.  Vào [Firebase Messaging Console](https://console.firebase.google.com/project/flutterapp-8448e/messaging).
3.  Tạo thông báo mới, dán Token vào và nhấn **Send test message**.

---
> [!IMPORTANT]
> Server Torii đã được cấu hình với Service Account key tại:
> `apps/server/config/flutterapp-8448e-firebase-adminsdk-fbsvc-465d4ddb89.json`.
