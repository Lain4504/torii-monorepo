# Gamification Heatmap & Full Implementation Spec

Spec ngắn gọn cho: (1) **Activity Heatmap** giống GitHub (đậm nhạt theo ngày), (2) **Gamification hoàn chỉnh** (Streak, Points, Coupon, Achievement), (3) **UI** dùng component Heatmap từ 8starlabs.

---

## 1. Heatmap – Schema & Logic

### 1.1. Sửa `DailyActivity` – thêm cột `count`

**Mục đích**: Màu đậm nhạt theo **số lượng hoạt động** trong ngày (giống GitHub contribution).

| Thay đổi | Chi tiết |
|----------|----------|
| Thêm cột | `count Int @default(1) @map("count")` |
| Logic | Mỗi lần `trackActivity` → upsert: nếu có record → `count += 1`, nếu chưa → tạo mới với `count = 1` |

**Prisma**:

```prisma
model DailyActivity {
  // ... existing fields
  count Int @default(1)  // Số lần activity trong ngày (cho heatmap)
  @@unique([userId, date, activityType])
}
```

**Chú ý LOGIN**: Giữ rule "chỉ cộng points 1 lần/ngày". `DailyActivity` vẫn upsert: LOGIN lần đầu → create `count: 1`, lần sau trong cùng ngày → `count: increment 1` (chỉ dùng cho heatmap, không thêm points).

### 1.2. API Heatmap

**Endpoint**: `GET /api/gamification/activity-heatmap`

**Query**:
- `startDate` (optional): YYYY-MM-DD, mặc định 1 năm trước
- `endDate` (optional): YYYY-MM-DD, mặc định hôm nay

**Response**:

```json
{
  "data": [
    { "date": "2025-01-15", "value": 5 },
    { "date": "2025-01-16", "value": 12 },
    ...
  ]
}
```

**Query SQL**:

```sql
SELECT date, SUM(count) as total
FROM daily_activities
WHERE user_id = :userId
  AND date BETWEEN :startDate AND :endDate
GROUP BY date
ORDER BY date
```

**DTO**: `HeatmapValue[]` với `{ date: string; value: number }` — khớp format component 8starlabs.

---

## 2. Component Heatmap (8starlabs)

### 2.1. Cài đặt

```bash
cd apps/web-learner  # hoặc app cần hiển thị heatmap
pnpm dlx shadcn@latest add https://ui.8starlabs.com/r/heatmap.json
```

### 2.2. Props component

| Prop | Type | Ý nghĩa |
|------|------|---------|
| `data` | `{ date: string; value: number }[]` | Từ API heatmap |
| `startDate` | `Date` | Ngày bắt đầu khoảng hiển thị |
| `endDate` | `Date` | Ngày kết thúc |
| `colorMode` | `"discrete" \| "interpolate"` | Màu rời rạc (GitHub) hoặc gradient |
| `displayStyle` | `"squares" \| "bubbles"` | Ô vuông (mặc định) hoặc tròn |
| `cellSize` | number | Kích thước ô (default 20) |
| `gap` | number | Khoảng cách (default 4) |

**Ví dụ**:

```tsx
import Heatmap from "@/components/ui/heatmap";

<Heatmap
  data={heatmapData}
  startDate={subDays(new Date(), 365)}
  endDate={new Date()}
  colorMode="discrete"
  displayStyle="squares"
  valueDisplayFunction={(v) => `${v} hoạt động`}
/>
```

Component đã có tooltip, màu đậm nhạt theo `value`, format `YYYY-MM-DD`. Chỉ cần truyền đúng `data` từ API.

---

## 3. Backend Changes Checklist

| Bước | File / Module | Thay đổi |
|------|---------------|----------|
| 1 | `schema.prisma` | Thêm `count Int @default(1)` vào `DailyActivity` |
| 2 | Migration | `prisma migrate dev --name add_daily_activity_count` |
| 3 | `GamificationService.trackActivity` | Upsert: `update: { count: { increment: 1 }, meta }` thay vì chỉ `meta` |
| 4 | Academy / Gateway | Thêm handler `gamification.getActivityHeatmap` + route `GET /api/gamification/activity-heatmap` |
| 5 | DTO | Thêm `HeatmapValueDTO` (`date`, `value`) |

---

## 4. Frontend Changes Checklist

| Bước | Việc làm |
|------|----------|
| 1 | `pnpm dlx shadcn@latest add https://ui.8starlabs.com/r/heatmap.json` |
| 2 | Thêm `getActivityHeatmap(startDate?, endDate?)` vào `gamification-api.ts` |
| 3 | Hook `useActivityHeatmap(startDate?, endDate?)` gọi API |
| 4 | Trang Dashboard / Profile: render `<Heatmap data={...} startDate={...} endDate={...} />` |
| 5 | (Optional) CSS: biến `--heatmap-zero` cho ô trống (đã có trong component) |

---

## 5. Gamification Full Stack – Tổng hợp

Triển khai gamification hoàn chỉnh dựa trên:

| Module | Spec | Trạng thái |
|--------|------|------------|
| **Streak, Points, Coupon** | [ACADEMY_GAMIFICATION_SPEC.md](./ACADEMY_GAMIFICATION_SPEC.md) | Đã có |
| **Achievement** | [ACADEMY_ACHIEVEMENT_SPEC.md](./ACADEMY_ACHIEVEMENT_SPEC.md) | Spec sẵn |
| **Activity Heatmap** | Spec này | Mới |

**Flow tổng thể**:
1. User học bài / login / thi / review → `trackActivity` → cộng Points/XP + ghi `DailyActivity` (kèm count).
2. Heatmap: query `DailyActivity` theo userId, group by date, sum(count) → trả về `{ date, value }[]`.
3. Achievement: evaluate sau `trackActivity` → unlock khi đủ điều kiện.
4. Coupon: user đổi Points qua Rewards Store.

---

## 6. API Summary (Learner)

| Endpoint | Mô tả |
|----------|-------|
| `GET /api/gamification/profile` | Profile (points, streak, level) |
| `GET /api/gamification/streak` | Chi tiết streak |
| `GET /api/gamification/activity-heatmap?startDate=&endDate=` | Data heatmap `{ date, value }[]` |
| `GET /api/gamification/achievements` | Danh sách achievement (kèm progress) |
| `GET /api/gamification/rewards` | Quà có thể đổi |
| `POST /api/gamification/redeem` | Đổi points lấy coupon |
| `GET /api/gamification/history` | Lịch sử points |
