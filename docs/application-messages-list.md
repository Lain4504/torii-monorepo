# Application Messages List

**Project:** Torii Nihongo Learning Platform  
**Project Code:** SP26SE005  
**Version:** 1.0  
**Date:** January 2026

---

## 📋 Table of Contents

1. [Authentication Messages](#1-authentication-messages)
2. [User Management Messages](#2-user-management-messages)
3. [Course Management Messages](#3-course-management-messages)
4. [Enrollment & Payment Messages](#4-enrollment--payment-messages)
5. [Learning & Assessment Messages](#5-learning--assessment-messages)
6. [Flashcard Messages](#6-flashcard-messages)
7. [Live Class Messages](#7-live-class-messages)
8. [Content Management Messages](#8-content-management-messages)
9. [File Upload Messages](#9-file-upload-messages)
10. [System Messages](#10-system-messages)
11. [Validation Messages](#11-validation-messages)
12. [Email Templates](#12-email-templates)

---

## Message Code Format

**Format:** `{MODULE}_{TYPE}_{NUMBER}`

- **MODULE**: AUTH, USER, COURSE, ENROLL, PAY, QUIZ, FLASH, LIVE, CONTENT, FILE, SYS
- **TYPE**: SUCCESS, ERROR, INFO, WARNING
- **NUMBER**: Sequential number (001, 002, ...)

**Example:** `AUTH_ERROR_001` = "Invalid credentials"

---

## 1. Authentication Messages

### 1.1 Registration Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| AUTH_SUCCESS_001 | Success | Registration successful. Please check your email for verification. | Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản. | 登録が完了しました。確認メールをご確認ください。 |
| AUTH_SUCCESS_002 | Success | Verification email sent successfully. | Email xác thực đã được gửi thành công. | 確認メールを送信しました。 |
| AUTH_ERROR_001 | Error | Email already exists. | Email đã tồn tại trong hệ thống. | このメールアドレスは既に登録されています。 |
| AUTH_ERROR_002 | Error | Invalid email format. | Định dạng email không hợp lệ. | メールアドレスの形式が正しくありません。 |
| AUTH_ERROR_003 | Error | Password must be at least 8 characters. | Mật khẩu phải có ít nhất 8 ký tự. | パスワードは8文字以上である必要があります。 |
| AUTH_ERROR_004 | Error | Display name is required. | Tên hiển thị là bắt buộc. | 表示名は必須です。 |

### 1.2 Login Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| AUTH_SUCCESS_010 | Success | Login successful. | Đăng nhập thành công. | ログインしました。 |
| AUTH_SUCCESS_011 | Success | Two-factor authentication required. | Yêu cầu xác thực hai yếu tố. | 二段階認証が必要です。 |
| AUTH_ERROR_010 | Error | Invalid credentials. | Thông tin đăng nhập không chính xác. | 認証情報が正しくありません。 |
| AUTH_ERROR_011 | Error | Email not verified. Please check your email. | Email chưa được xác thực. Vui lòng kiểm tra email. | メールアドレスが確認されていません。 |
| AUTH_ERROR_012 | Error | Account is disabled or deleted. | Tài khoản đã bị vô hiệu hóa hoặc xóa. | アカウントが無効化または削除されています。 |
| AUTH_ERROR_013 | Error | Account is temporarily banned. | Tài khoản tạm thời bị cấm. | アカウントが一時的に停止されています。 |
| AUTH_ERROR_014 | Error | Access denied: Admin portals are restricted. | Truy cập bị từ chối: Cổng quản trị bị hạn chế. | アクセス拒否：管理ポータルは制限されています。 |

### 1.3 Two-Factor Authentication Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| AUTH_SUCCESS_020 | Success | 2FA enabled successfully. | Xác thực 2 yếu tố đã được kích hoạt. | 二段階認証を有効にしました。 |
| AUTH_SUCCESS_021 | Success | 2FA verification successful. | Xác thực 2FA thành công. | 二段階認証に成功しました。 |
| AUTH_SUCCESS_022 | Success | Backup codes generated. | Mã dự phòng đã được tạo. | バックアップコードを生成しました。 |
| AUTH_ERROR_020 | Error | Invalid or expired temporary token. | Token tạm thời không hợp lệ hoặc đã hết hạn. | 一時トークンが無効または期限切れです。 |
| AUTH_ERROR_021 | Error | Invalid 2FA code. | Mã 2FA không chính xác. | 二段階認証コードが正しくありません。 |
| AUTH_ERROR_022 | Error | 2FA is locked due to too many failed attempts. | 2FA bị khóa do quá nhiều lần thử sai. | 失敗回数が多すぎるため、二段階認証がロックされました。 |
| AUTH_ERROR_023 | Error | Temporary token expired or already used. | Token tạm thời đã hết hạn hoặc đã được sử dụng. | 一時トークンの期限切れまたは使用済みです。 |

### 1.4 Email Verification Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| AUTH_SUCCESS_030 | Success | Email verified successfully. | Email đã được xác thực thành công. | メールアドレスを確認しました。 |
| AUTH_SUCCESS_031 | Success | Verification code sent. | Mã xác thực đã được gửi. | 確認コードを送信しました。 |
| AUTH_ERROR_030 | Error | Invalid or expired verification token. | Token xác thực không hợp lệ hoặc đã hết hạn. | 確認トークンが無効または期限切れです。 |
| AUTH_ERROR_031 | Error | Invalid or expired verification code. | Mã xác thực không hợp lệ hoặc đã hết hạn. | 確認コードが無効または期限切れです。 |
| AUTH_ERROR_032 | Error | Email already verified. | Email đã được xác thực rồi. | メールアドレスは既に確認済みです。 |
| AUTH_ERROR_033 | Error | Too many requests. Please try again in {minutes} minutes. | Quá nhiều yêu cầu. Vui lòng thử lại sau {minutes} phút. | リクエストが多すぎます。{minutes}分後に再試行してください。 |

### 1.5 Password Reset Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| AUTH_SUCCESS_040 | Success | Password reset email sent. | Email đặt lại mật khẩu đã được gửi. | パスワードリセットメールを送信しました。 |
| AUTH_SUCCESS_041 | Success | Password reset successful. | Đặt lại mật khẩu thành công. | パスワードをリセットしました。 |
| AUTH_ERROR_040 | Error | Invalid or expired reset token. | Token đặt lại không hợp lệ hoặc đã hết hạn. | リセットトークンが無効または期限切れです。 |
| AUTH_ERROR_041 | Error | This account uses OAuth login. Password reset is not available. | Tài khoản này sử dụng đăng nhập OAuth. Không thể đặt lại mật khẩu. | このアカウントはOAuthログインを使用しています。 |
| AUTH_ERROR_042 | Error | New password cannot be the same as old password. | Mật khẩu mới không được trùng với mật khẩu cũ. | 新しいパスワードは古いパスワードと同じにできません。 |

### 1.6 Logout Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| AUTH_SUCCESS_050 | Success | Logout successful. | Đăng xuất thành công. | ログアウトしました。 |
| AUTH_INFO_050 | Info | You have been logged out due to inactivity. | Bạn đã bị đăng xuất do không hoạt động. | 非アクティブのためログアウトされました。 |

---

## 2. User Management Messages

### 2.1 Profile Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| USER_SUCCESS_001 | Success | Profile updated successfully. | Cập nhật hồ sơ thành công. | プロフィールを更新しました。 |
| USER_SUCCESS_002 | Success | Avatar uploaded successfully. | Tải ảnh đại diện thành công. | アバターをアップロードしました。 |
| USER_ERROR_001 | Error | User not found. | Không tìm thấy người dùng. | ユーザーが見つかりません。 |
| USER_ERROR_002 | Error | Email already in use. | Email đã được sử dụng. | メールアドレスは既に使用されています。 |
| USER_ERROR_003 | Error | Invalid user ID format. | Định dạng ID người dùng không hợp lệ. | ユーザーIDの形式が正しくありません。 |

### 2.2 Role & Permission Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| USER_SUCCESS_010 | Success | Role updated successfully. | Cập nhật vai trò thành công. | 役割を更新しました。 |
| USER_SUCCESS_011 | Success | Permissions granted. | Quyền đã được cấp. | 権限を付与しました。 |
| USER_ERROR_010 | Error | Insufficient permissions. | Không đủ quyền hạn. | 権限が不足しています。 |
| USER_ERROR_011 | Error | Only admins can modify roles. | Chỉ quản trị viên mới có thể thay đổi vai trò. | 管理者のみが役割を変更できます。 |

---

## 3. Course Management Messages

### 3.1 Course CRUD Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| COURSE_SUCCESS_001 | Success | Course created successfully. | Tạo khóa học thành công. | コースを作成しました。 |
| COURSE_SUCCESS_002 | Success | Course updated successfully. | Cập nhật khóa học thành công. | コースを更新しました。 |
| COURSE_SUCCESS_003 | Success | Course deleted successfully. | Xóa khóa học thành công. | コースを削除しました。 |
| COURSE_SUCCESS_004 | Success | Course published successfully. | Xuất bản khóa học thành công. | コースを公開しました。 |
| COURSE_SUCCESS_005 | Success | Course unpublished successfully. | Hủy xuất bản khóa học thành công. | コースの公開を取り消しました。 |
| COURSE_ERROR_001 | Error | Course not found. | Không tìm thấy khóa học. | コースが見つかりません。 |
| COURSE_ERROR_002 | Error | Course title is required. | Tiêu đề khóa học là bắt buộc. | コースタイトルは必須です。 |
| COURSE_ERROR_003 | Error | Only admins and lecturers can create courses. | Chỉ quản trị viên và giảng viên mới có thể tạo khóa học. | 管理者と講師のみがコースを作成できます。 |
| COURSE_ERROR_004 | Error | Only admins can delete courses. | Chỉ quản trị viên mới có thể xóa khóa học. | 管理者のみがコースを削除できます。 |
| COURSE_ERROR_005 | Error | Failed to create course: {error} | Tạo khóa học thất bại: {error} | コースの作成に失敗しました: {error} |

### 3.2 Module & Lesson Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| COURSE_SUCCESS_010 | Success | Module created successfully. | Tạo chương thành công. | モジュールを作成しました。 |
| COURSE_SUCCESS_011 | Success | Lesson created successfully. | Tạo bài học thành công. | レッスンを作成しました。 |
| COURSE_SUCCESS_012 | Success | Module order updated. | Cập nhật thứ tự chương thành công. | モジュールの順序を更新しました。 |
| COURSE_SUCCESS_013 | Success | Lesson order updated. | Cập nhật thứ tự bài học thành công. | レッスンの順序を更新しました。 |
| COURSE_ERROR_010 | Error | Module not found. | Không tìm thấy chương. | モジュールが見つかりません。 |
| COURSE_ERROR_011 | Error | Lesson not found. | Không tìm thấy bài học. | レッスンが見つかりません。 |
| COURSE_ERROR_012 | Error | Failed to retrieve modules. | Lấy danh sách chương thất bại. | モジュールの取得に失敗しました。 |

---

## 4. Enrollment & Payment Messages

### 4.1 Enrollment Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| ENROLL_SUCCESS_001 | Success | Enrollment created successfully. | Đăng ký khóa học thành công. | 受講登録が完了しました。 |
| ENROLL_SUCCESS_002 | Success | Progress updated successfully. | Cập nhật tiến độ thành công. | 進捗を更新しました。 |
| ENROLL_SUCCESS_003 | Success | Congratulations! Course completed. | Chúc mừng! Bạn đã hoàn thành khóa học. | おめでとうございます！コースを修了しました。 |
| ENROLL_ERROR_001 | Error | CourseId is required. | CourseId là bắt buộc. | コースIDは必須です。 |
| ENROLL_ERROR_002 | Error | Course not found. | Không tìm thấy khóa học. | コースが見つかりません。 |
| ENROLL_ERROR_003 | Error | Already enrolled in this course. | Bạn đã đăng ký khóa học này rồi. | このコースは既に受講登録済みです。 |
| ENROLL_ERROR_004 | Error | Enrollment not found. | Không tìm thấy đăng ký. | 受講登録が見つかりません。 |
| ENROLL_ERROR_005 | Error | Completion percentage must be between 0 and 100. | Tỷ lệ hoàn thành phải từ 0 đến 100. | 完了率は0から100の間である必要があります。 |

### 4.2 Payment Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| PAY_SUCCESS_001 | Success | Payment created successfully. | Tạo thanh toán thành công. | 支払いを作成しました。 |
| PAY_SUCCESS_002 | Success | Payment confirmed successfully. | Xác nhận thanh toán thành công. | 支払いを確認しました。 |
| PAY_SUCCESS_003 | Success | Payment completed. | Thanh toán hoàn tất. | 支払いが完了しました。 |
| PAY_SUCCESS_004 | Success | Refund processed successfully. | Hoàn tiền thành công. | 返金処理が完了しました。 |
| PAY_ERROR_001 | Error | Free courses do not require payment. | Khóa học miễn phí không cần thanh toán. | 無料コースは支払い不要です。 |
| PAY_ERROR_002 | Error | CourseId is required for course_purchase payment type. | CourseId là bắt buộc cho loại thanh toán mua khóa học. | course_purchase支払いタイプにはコースIDが必要です。 |
| PAY_ERROR_003 | Error | Payment already completed. | Thanh toán đã hoàn tất rồi. | 支払いは既に完了しています。 |
| PAY_ERROR_004 | Error | Payment cannot be confirmed in current status. | Không thể xác nhận thanh toán ở trạng thái hiện tại. | 現在のステータスでは支払いを確認できません。 |
| PAY_ERROR_005 | Error | Payment not found. | Không tìm thấy thanh toán. | 支払いが見つかりません。 |
| PAY_ERROR_006 | Error | Invalid payment amount. | Số tiền thanh toán không hợp lệ. | 支払い金額が無効です。 |

---

## 5. Learning & Assessment Messages

### 5.1 Quiz Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| QUIZ_SUCCESS_001 | Success | Quiz created successfully. | Tạo bài kiểm tra thành công. | クイズを作成しました。 |
| QUIZ_SUCCESS_002 | Success | Quiz started successfully. | Bắt đầu bài kiểm tra thành công. | クイズを開始しました。 |
| QUIZ_SUCCESS_003 | Success | Quiz submitted successfully. | Nộp bài kiểm tra thành công. | クイズを提出しました。 |
| QUIZ_SUCCESS_004 | Success | Answer saved. | Câu trả lời đã được lưu. | 回答を保存しました。 |
| QUIZ_INFO_001 | Info | Time remaining: {minutes} minutes. | Thời gian còn lại: {minutes} phút. | 残り時間: {minutes}分 |
| QUIZ_WARNING_001 | Warning | You have {attempts} attempts remaining. | Bạn còn {attempts} lần thử. | 残り試行回数: {attempts}回 |
| QUIZ_ERROR_001 | Error | Quiz not found. | Không tìm thấy bài kiểm tra. | クイズが見つかりません。 |
| QUIZ_ERROR_002 | Error | Maximum attempts reached. | Đã hết số lần thử. | 最大試行回数に達しました。 |
| QUIZ_ERROR_003 | Error | Time limit exceeded. | Vượt quá thời gian cho phép. | 制限時間を超過しました。 |

### 5.2 Question Bank Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| QUIZ_SUCCESS_010 | Success | Question created successfully. | Tạo câu hỏi thành công. | 問題を作成しました。 |
| QUIZ_SUCCESS_011 | Success | Questions created successfully. | Tạo câu hỏi hàng loạt thành công. | 問題を一括作成しました。 |
| QUIZ_SUCCESS_012 | Success | Question updated successfully. | Cập nhật câu hỏi thành công. | 問題を更新しました。 |
| QUIZ_ERROR_010 | Error | Multiple choice questions must have at least 2 options. | Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn. | 選択問題には少なくとも2つの選択肢が必要です。 |
| QUIZ_ERROR_011 | Error | Correct answer is required for non-essay questions. | Câu trả lời đúng là bắt buộc cho câu hỏi không phải tự luận. | 記述式以外の問題には正解が必要です。 |
| QUIZ_ERROR_012 | Error | Cannot delete question that is in use. Archive it instead. | Không thể xóa câu hỏi đang được sử dụng. Hãy lưu trữ thay thế. | 使用中の問題は削除できません。アーカイブしてください。 |
| QUIZ_ERROR_013 | Error | Cannot create more than 100 questions at once. | Không thể tạo hơn 100 câu hỏi cùng lúc. | 一度に100問以上作成できません。 |
| QUIZ_ERROR_014 | Error | No questions provided. | Không có câu hỏi nào được cung cấp. | 問題が提供されていません。 |

---

## 6. Flashcard Messages

### 6.1 Deck Management Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| FLASH_SUCCESS_001 | Success | Deck created successfully. | Tạo bộ thẻ thành công. | デッキを作成しました。 |
| FLASH_SUCCESS_002 | Success | Deck updated successfully. | Cập nhật bộ thẻ thành công. | デッキを更新しました。 |
| FLASH_SUCCESS_003 | Success | Deck deleted successfully. | Xóa bộ thẻ thành công. | デッキを削除しました。 |
| FLASH_ERROR_001 | Error | Deck not found. | Không tìm thấy bộ thẻ. | デッキが見つかりません。 |
| FLASH_ERROR_002 | Error | Deck name is required. | Tên bộ thẻ là bắt buộc. | デッキ名は必須です。 |

### 6.2 Card Management Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| FLASH_SUCCESS_010 | Success | Card created successfully. | Tạo thẻ thành công. | カードを作成しました。 |
| FLASH_SUCCESS_011 | Success | Card updated successfully. | Cập nhật thẻ thành công. | カードを更新しました。 |
| FLASH_SUCCESS_012 | Success | Card deleted successfully. | Xóa thẻ thành công. | カードを削除しました。 |
| FLASH_ERROR_010 | Error | Card not found. | Không tìm thấy thẻ. | カードが見つかりません。 |
| FLASH_ERROR_011 | Error | Front text and back text are required. | Mặt trước và mặt sau là bắt buộc. | 表面と裏面のテキストは必須です。 |

### 6.3 Review Session Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| FLASH_SUCCESS_020 | Success | Review session started. | Bắt đầu phiên ôn tập. | 復習セッションを開始しました。 |
| FLASH_SUCCESS_021 | Success | Review completed. Great job! | Hoàn thành ôn tập. Làm tốt lắm! | 復習完了。お疲れ様でした！ |
| FLASH_SUCCESS_022 | Success | Card reviewed successfully. | Ôn tập thẻ thành công. | カードを復習しました。 |
| FLASH_INFO_020 | Info | {count} cards due for review today. | {count} thẻ cần ôn tập hôm nay. | 今日復習すべきカード: {count}枚 |
| FLASH_INFO_021 | Info | Daily limit reached. Come back tomorrow! | Đã đạt giới hạn hàng ngày. Quay lại vào ngày mai! | 本日の上限に達しました。また明日！ |

---

## 7. Live Class Messages

### 7.1 Room Management Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| LIVE_SUCCESS_001 | Success | Room created successfully. | Tạo phòng học thành công. | ルームを作成しました。 |
| LIVE_SUCCESS_002 | Success | Joined room successfully. | Tham gia phòng học thành công. | ルームに参加しました。 |
| LIVE_SUCCESS_003 | Success | Left room successfully. | Rời phòng học thành công. | ルームから退出しました。 |
| LIVE_SUCCESS_004 | Success | Recording started. | Bắt đầu ghi hình. | 録画を開始しました。 |
| LIVE_SUCCESS_005 | Success | Recording stopped. | Dừng ghi hình. | 録画を停止しました。 |
| LIVE_ERROR_001 | Error | Room not found. | Không tìm thấy phòng học. | ルームが見つかりません。 |
| LIVE_ERROR_002 | Error | Room is full. | Phòng học đã đầy. | ルームが満員です。 |
| LIVE_ERROR_003 | Error | Not enrolled in this class. | Chưa đăng ký lớp học này. | このクラスに登録されていません。 |
| LIVE_ERROR_004 | Error | Class has not started yet. | Lớp học chưa bắt đầu. | クラスはまだ開始されていません。 |
| LIVE_ERROR_005 | Error | Class has ended. | Lớp học đã kết thúc. | クラスは終了しました。 |

### 7.2 Participant Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| LIVE_INFO_001 | Info | {name} joined the class. | {name} đã tham gia lớp học. | {name}がクラスに参加しました。 |
| LIVE_INFO_002 | Info | {name} left the class. | {name} đã rời khỏi lớp học. | {name}がクラスから退出しました。 |
| LIVE_INFO_003 | Info | {name} raised hand. | {name} đã giơ tay. | {name}が挙手しました。 |
| LIVE_INFO_004 | Info | You have been muted by the host. | Bạn đã bị tắt tiếng bởi giảng viên. | ホストによってミュートされました。 |

---

## 8. Content Management Messages

### 8.1 Blog Post Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| CONTENT_SUCCESS_001 | Success | Post created successfully. | Tạo bài viết thành công. | 投稿を作成しました。 |
| CONTENT_SUCCESS_002 | Success | Post updated successfully. | Cập nhật bài viết thành công. | 投稿を更新しました。 |
| CONTENT_SUCCESS_003 | Success | Post published successfully. | Xuất bản bài viết thành công. | 投稿を公開しました。 |
| CONTENT_SUCCESS_004 | Success | Post deleted successfully. | Xóa bài viết thành công. | 投稿を削除しました。 |
| CONTENT_ERROR_001 | Error | Post not found. | Không tìm thấy bài viết. | 投稿が見つかりません。 |
| CONTENT_ERROR_002 | Error | Author ID is required. | ID tác giả là bắt buộc. | 著者IDは必須です。 |
| CONTENT_ERROR_003 | Error | Post with slug "{slug}" already exists. | Bài viết với slug "{slug}" đã tồn tại. | スラッグ"{slug}"の投稿は既に存在します。 |

### 8.2 Comment Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| CONTENT_SUCCESS_010 | Success | Comment posted successfully. | Đăng bình luận thành công. | コメントを投稿しました。 |
| CONTENT_SUCCESS_011 | Success | Comment updated successfully. | Cập nhật bình luận thành công. | コメントを更新しました。 |
| CONTENT_SUCCESS_012 | Success | Comment deleted successfully. | Xóa bình luận thành công. | コメントを削除しました。 |
| CONTENT_ERROR_010 | Error | Comment not found. | Không tìm thấy bình luận. | コメントが見つかりません。 |
| CONTENT_ERROR_011 | Error | Comment content is required. | Nội dung bình luận là bắt buộc. | コメント内容は必須です。 |

---

## 9. File Upload Messages

### 9.1 Upload Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| FILE_SUCCESS_001 | Success | File uploaded successfully. | Tải tệp lên thành công. | ファイルをアップロードしました。 |
| FILE_SUCCESS_002 | Success | Files uploaded successfully. | Tải nhiều tệp lên thành công. | ファイルを一括アップロードしました。 |
| FILE_SUCCESS_003 | Success | File deleted successfully. | Xóa tệp thành công. | ファイルを削除しました。 |
| FILE_ERROR_001 | Error | No file data provided. | Không có dữ liệu tệp. | ファイルデータが提供されていません。 |
| FILE_ERROR_002 | Error | File not found in storage. Upload might have failed. | Không tìm thấy tệp trong kho lưu trữ. Tải lên có thể đã thất bại. | ストレージにファイルが見つかりません。 |
| FILE_ERROR_003 | Error | File size exceeds maximum limit ({size}MB). | Kích thước tệp vượt quá giới hạn ({size}MB). | ファイルサイズが上限({size}MB)を超えています。 |
| FILE_ERROR_004 | Error | Invalid file type. Allowed types: {types} | Loại tệp không hợp lệ. Loại cho phép: {types} | 無効なファイルタイプ。許可されたタイプ: {types} |
| FILE_ERROR_005 | Error | File upload failed. | Tải tệp lên thất bại. | ファイルのアップロードに失敗しました。 |

---

## 10. System Messages

### 10.1 General System Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| SYS_SUCCESS_001 | Success | Operation completed successfully. | Thao tác hoàn tất thành công. | 操作が正常に完了しました。 |
| SYS_ERROR_001 | Error | An unexpected error occurred. | Đã xảy ra lỗi không mong muốn. | 予期しないエラーが発生しました。 |
| SYS_ERROR_002 | Error | Service temporarily unavailable. | Dịch vụ tạm thời không khả dụng. | サービスが一時的に利用できません。 |
| SYS_ERROR_003 | Error | Request timeout. | Yêu cầu hết thời gian chờ. | リクエストがタイムアウトしました。 |
| SYS_ERROR_004 | Error | Database connection error. | Lỗi kết nối cơ sở dữ liệu. | データベース接続エラー。 |
| SYS_ERROR_005 | Error | Internal server error. | Lỗi máy chủ nội bộ. | 内部サーバーエラー。 |

### 10.2 Rate Limiting Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| SYS_ERROR_010 | Error | Too many requests. Please try again in {minutes} minutes. | Quá nhiều yêu cầu. Vui lòng thử lại sau {minutes} phút. | リクエストが多すぎます。{minutes}分後に再試行してください。 |
| SYS_ERROR_011 | Error | Rate limit exceeded. | Vượt quá giới hạn tốc độ. | レート制限を超過しました。 |

### 10.3 Maintenance Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| SYS_INFO_001 | Info | System maintenance scheduled at {time}. | Bảo trì hệ thống được lên lịch vào {time}. | システムメンテナンスが{time}に予定されています。 |
| SYS_WARNING_001 | Warning | System will be under maintenance in {minutes} minutes. | Hệ thống sẽ bảo trì sau {minutes} phút. | {minutes}分後にメンテナンスが開始されます。 |

---

## 11. Validation Messages

### 11.1 Field Validation Messages

| Code | Type | Message (EN) | Message (VI) | Message (JP) |
|------|------|--------------|--------------|--------------|
| VALID_ERROR_001 | Error | {field} is required. | {field} là bắt buộc. | {field}は必須です。 |
| VALID_ERROR_002 | Error | {field} must be a valid email. | {field} phải là email hợp lệ. | {field}は有効なメールアドレスである必要があります。 |
| VALID_ERROR_003 | Error | {field} must be at least {min} characters. | {field} phải có ít nhất {min} ký tự. | {field}は{min}文字以上である必要があります。 |
| VALID_ERROR_004 | Error | {field} must not exceed {max} characters. | {field} không được vượt quá {max} ký tự. | {field}は{max}文字以下である必要があります。 |
| VALID_ERROR_005 | Error | {field} must be a number. | {field} phải là số. | {field}は数値である必要があります。 |
| VALID_ERROR_006 | Error | {field} must be between {min} and {max}. | {field} phải từ {min} đến {max}. | {field}は{min}から{max}の間である必要があります。 |
| VALID_ERROR_007 | Error | {field} must be a valid UUID. | {field} phải là UUID hợp lệ. | {field}は有効なUUIDである必要があります。 |
| VALID_ERROR_008 | Error | {field} must be a valid date. | {field} phải là ngày hợp lệ. | {field}は有効な日付である必要があります。 |
| VALID_ERROR_009 | Error | {field} must be a valid URL. | {field} phải là URL hợp lệ. | {field}は有効なURLである必要があります。 |
| VALID_ERROR_010 | Error | {field} contains invalid characters. | {field} chứa ký tự không hợp lệ. | {field}に無効な文字が含まれています。 |

---

## 12. Email Templates

### 12.1 Welcome Email

**Subject (EN):** Welcome to Torii Nihongo!  
**Subject (VI):** Chào mừng đến với Torii Nihongo!  
**Subject (JP):** Torii Nihongoへようこそ！

**Body:**
```
Hi {displayName},

Welcome to Torii Nihongo Learning Platform! We're excited to have you join our community.

To get started, please verify your email address by clicking the link below:
{verificationUrl}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
Torii Nihongo Team
```

### 12.2 Password Reset Email

**Subject (EN):** Reset Your Password  
**Subject (VI):** Đặt lại mật khẩu  
**Subject (JP):** パスワードのリセット

**Body:**
```
Hi {displayName},

We received a request to reset your password. Click the link below to create a new password:
{resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Torii Nihongo Team
```

### 12.3 Enrollment Confirmation Email

**Subject (EN):** Enrollment Confirmed - {courseTitle}  
**Subject (VI):** Xác nhận đăng ký - {courseTitle}  
**Subject (JP):** 受講登録完了 - {courseTitle}

**Body:**
```
Hi {displayName},

Congratulations! You have successfully enrolled in "{courseTitle}".

Start learning now: {courseUrl}

Course Details:
- JLPT Level: {jlptLevel}
- Duration: {durationWeeks} weeks
- Total Lessons: {totalLessons}

Happy learning!

Best regards,
Torii Nihongo Team
```

### 12.4 Course Completion Email

**Subject (EN):** Congratulations! Course Completed - {courseTitle}  
**Subject (VI):** Chúc mừng! Hoàn thành khóa học - {courseTitle}  
**Subject (JP):** おめでとうございます！コース修了 - {courseTitle}

**Body:**
```
Hi {displayName},

Congratulations on completing "{courseTitle}"!

Your certificate is ready: {certificateUrl}

Course Statistics:
- Completion Date: {completedAt}
- Final Score: {finalScore}%
- Time Spent: {totalHours} hours

Keep up the great work!

Best regards,
Torii Nihongo Team
```

---

## 📊 Message Statistics

| Category | Total Messages |
|----------|----------------|
| Authentication | 35 |
| User Management | 8 |
| Course Management | 20 |
| Enrollment & Payment | 18 |
| Learning & Assessment | 25 |
| Flashcards | 15 |
| Live Classes | 15 |
| Content Management | 12 |
| File Upload | 8 |
| System Messages | 15 |
| Validation | 10 |
| Email Templates | 4 |
| **TOTAL** | **185** |

---

## 🌐 i18n Integration

### Implementation Example (React i18next)

```typescript
import { useTranslation } from 'react-i18next';

function LoginForm() {
  const { t } = useTranslation();
  
  // Usage
  const errorMessage = t('AUTH_ERROR_010'); // "Invalid credentials"
  const successMessage = t('AUTH_SUCCESS_010'); // "Login successful"
  
  return (
    <div>
      {error && <Alert>{t(error.code)}</Alert>}
    </div>
  );
}
```

### Backend Implementation (NestJS)

```typescript
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(private readonly i18n: I18nService) {}
  
  async login(dto: LoginDTO) {
    if (!isValid) {
      throw new UnauthorizedException(
        this.i18n.t('AUTH_ERROR_010', { lang: dto.lang })
      );
    }
  }
}
```

---

## 🔍 Usage Guidelines

1. **Always use message codes** instead of hardcoded strings
2. **Include placeholders** for dynamic values: `{field}`, `{count}`, `{minutes}`
3. **Maintain consistency** across all three languages
4. **Update this document** when adding new messages
5. **Use appropriate message types**: SUCCESS, ERROR, INFO, WARNING
6. **Follow naming convention**: `{MODULE}_{TYPE}_{NUMBER}`

---

**Last Updated:** 2026-01-11  
**Version:** 1.0  
**Status:** ✅ Complete
