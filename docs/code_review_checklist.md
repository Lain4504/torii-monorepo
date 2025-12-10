# ✔️ CODE REVIEW CHECKLIST

## 1. Functionality
- [ ] Code chạy đúng theo yêu cầu
- [ ] Không gây bug với feature hiện tại
- [ ] Logic rõ ràng, không thừa
- [ ] Không hard-code giá trị quan trọng

---

## 2. Code Quality
- [ ] Không có duplicate code
- [ ] Cấu trúc hàm nhỏ, rõ ràng
- [ ] Đặt tên biến/hàm/class đúng nghĩa
- [ ] Không có unused imports / variables
- [ ] Không có console.log / print / debug
- [ ] Code đã được format theo standard

---

## 3. Architecture & Structure
- [ ] Tuân thủ kiến trúc của project (MVC, Clean Architecture, Layered…)
- [ ] Không vi phạm dependency rules
- [ ] Code được đặt đúng folder/module
- [ ] Không logic business trong controller
- [ ] Service và Repository tách biệt rõ ràng

---

## 4. Security
- [ ] Input được validate
- [ ] Không lộ key/password trong code
- [ ] Không trả về thông tin nhạy cảm
- [ ] API phân quyền đúng (role-based / token-based)

---

## 5. Performance
- [ ] Không query thừa / loop nặng
- [ ] Dùng pagination khi cần
- [ ] Không load toàn bộ dữ liệu không cần thiết
- [ ] Cache hợp lý nếu là case nặng

---

## 6. Testing
- [ ] Đã có unit test / integration test
- [ ] Test chạy pass
- [ ] Test case cover scenario chính

---

## 7. Documentation
- [ ] Comment rõ với logic phức tạp
- [ ] API docs updated (nếu có API)
- [ ] PR description đầy đủ

---

## 8. UI/UX (nếu có Frontend)
- [ ] UI hiển thị đúng design
- [ ] Không lỗi layout responsive
- [ ] Loading & error states rõ ràng
- [ ] Text, spacing, alignment chuẩn

---

# Reviewer Final Decision
- [ ] ✔️ Approve
- [ ] ❌ Request Changes  
