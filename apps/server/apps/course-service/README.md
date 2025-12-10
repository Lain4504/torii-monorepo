# Course Service structure (feature-first)

- `src/modules/<feature>/` — tất cả phần của 1 feature: controller/resolver, service, entity/model, dto, mapper (nếu cần), test.
- `src/common/` — helper, middleware, pipe... chỉ dùng nội bộ service này.
- Thêm feature mới chỉ cần tạo thư mục mới dưới `src/modules/`.

Hiện đã có feature `course`; các feature khác (package, lesson...) có thể tạo tương tự khi cần.

