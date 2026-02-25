# Đề xuất cấu trúc thư mục cho Microservices

Dưới đây là cấu trúc thư mục được đề xuất để chuẩn hóa và tối ưu hóa các microservice trong `apps/server`.

## Nguyên tắc chung

- **Chia theo Domain (Tên miền):** Mỗi module chính đại diện cho một domain nghiệp vụ (ví dụ: `users`, `courses`, `orders`).
- **Phân tách rõ ràng các lớp (Layers):**
    - `application`: Chứa business logic chính (services).
    - `domain`: Chứa các entities, DTOs, enums, và interfaces (hợp đồng).
    - `infrastructure`: Chứa các thành phần liên quan đến bên ngoài như repositories, kết nối database.
    - `presentation`: Chứa các controllers, handlers (giao tiếp với bên ngoài như HTTP, gRPC, message queues).
- **Nhất quán:** Áp dụng cấu trúc này cho tất cả các microservice.

## Cấu trúc thư mục chuẩn cho một Microservice

Đây là cấu trúc ví dụ cho `identity-service`. Bạn có thể áp dụng tương tự cho các service khác.

```
apps/server/identity-service/
├── src/
│   ├── modules/
│   │   └── users/
│   │       ├── application/
│   │       │   ├── users.service.ts
│   │       │   └── users.service.interface.ts
│   │       ├── domain/
│   │       │   ├── dto/
│   │       │   │   ├── create-user.dto.ts
│   │       │   │   └── update-user.dto.ts
│   │       │   ├── entities/
│   │       │   │   └── user.entity.ts
│   │       │   ├── enums/
│   │       │   │   └── user-role.enum.ts
│   │       │   └── mappers/
│   │       │       └── user.mapper.ts
│   │       ├── infrastructure/
│   │       │   ├── users.repository.ts
│   │       │   └── users.repository.interface.ts
│   │       ├── presentation/
│   │       │   ├── users.controller.ts  // For Gateway
│   │       │   └── users.handler.ts     // For microservice communication
│   │       └── users.module.ts
│   ├── shared/                   // Các module, services dùng chung trong service
│   │   └── lib/
│   │       └── utils.ts
│   ├── identity-service.module.ts
│   └── main.ts
├── test/
│   ├── users.service.spec.ts
│   └── e2e/
│       └── users.e2e-spec.ts
├── .eslintrc.js
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## Các bước Refactor đề xuất

1.  **Đổi tên thư mục:**
    - `apps/server/modules/identity` -> `apps/server/identity-service`
    - `apps/server/modules/learning` -> `apps/server/learning-service`
    - ... (tương tự cho các service khác)

2.  **Tái cấu trúc bên trong mỗi service:**
    - Di chuyển các file vào đúng các thư mục `application`, `domain`, `infrastructure`, `presentation` như trong cấu trúc mẫu.
    - Ví dụ với `users.service.ts`:
        - Hiện tại: `apps/server/modules/identity/src/modules/users/users.service.ts`
        - Chuyển đến: `apps/server/identity-service/src/modules/users/application/users.service.ts`
    - Ví dụ với `users.repository.ts`:
        - Hiện tại: `apps/server/modules/identity/src/modules/users/users.repository.ts`
        - Chuyển đến: `apps/server/identity-service/src/modules/users/infrastructure/users.repository.ts`
    - Tạo các file interface (`.interface.ts`) cho services và repositories để tuân thủ nguyên tắc Dependency Inversion.

3.  **Cập nhật `paths` trong `tsconfig.json`:** Sau khi đổi tên, cần cập nhật lại các alias path để đảm bảo import hoạt động chính xác.

4.  **Kiểm tra và Lint:** Chạy `lint` và `test` để đảm bảo mọi thứ vẫn hoạt động sau khi refactor.
