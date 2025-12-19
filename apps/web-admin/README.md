# Web Admin Console

Dự án quản trị cho hệ thống Torii Nihongo.

## 🚀 Tính năng
- Quản lý người dùng.
- Quản lý khóa học & bài học.
- Giám sát lớp học trực tuyến.

## 🛠 Công nghệ sử dụng
- **React (Vite)**
- **TanStack Query (React Query)**
- **TailwindCSS**
- **Orval**: Tự động tạo API client từ Swagger.

## 🛰 API Consumption (Auto-generated)
Dự án không viết tay code gọi API. Thay vào đó, chúng ta sử dụng các hooks được gen tự động từ `packages/data-access`.

### Cách cập nhật API Client
1. Đảm bảo Backend (Gateway) đang chạy tại port 8080.
2. Chạy lệnh tại thư mục root:
```bash
pnpm --filter @workspace/data-access gen:api
```

### Cách sử dụng trong component
```tsx
import { useUsersControllerFindAll } from '@workspace/data-access';

export function MyComponent() {
  const { data, isLoading } = useUsersControllerFindAll({ page: 1, limit: 10 });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {data?.data.map(user => <li key={user.id}>{user.email}</li>)}
    </ul>
  );
}
```

## 🏁 Phát triển local
```bash
pnpm dev
```
