# Build Fixes - 2026-02-05

## 📋 Tổng Quan

Session này tập trung vào việc sửa các lỗi TypeScript build cho `web-admin` và `web-learner` applications. Tất cả các thay đổi đều là bug fixes, không có breaking changes.

### Kết Quả
- ✅ **web-admin**: Build thành công (1.42s)
- ✅ **web-learner**: Build thành công (43 routes generated)

---

## 🔧 Chi Tiết Các Sửa Đổi

### 1. Web Admin - Post Management

#### **File:** `apps/web-admin/src/components/posts/view-post-sheet.tsx`

**Vấn đề:**
```
Error: Property 'seoTitle' does not exist on type PostResponseDTO
Error: Property 'seoDescription' does not exist on type PostResponseDTO
```

**Nguyên nhân:**
- Component đang truy cập `post.seoTitle` và `post.seoDescription`
- Các field này không tồn tại trong Prisma schema `Post` model
- Cũng không có trong `PostResponseDTO` schema

**Giải pháp:**
- Xóa toàn bộ SEO Metadata section (lines 204-233)
- Nếu cần SEO fields trong tương lai, phải:
  1. Thêm vào Prisma schema
  2. Chạy migration
  3. Update `postSchema` trong `packages/schemas`
  4. Thêm lại UI section

**Impact:**
- ❌ Không còn hiển thị SEO Title/Description trong view post
- ✅ Không ảnh hưởng đến chức năng khác
- ✅ Backward compatible

---

### 2. Web Learner - Navigation Config

#### **File:** `apps/web-learner/config/navigation.ts`

**Vấn đề:**
```
Error: the name `MessageSquare` is defined multiple times
```

**Nguyên nhân:**
- Import `MessageSquare` từ `lucide-react` bị duplicate (line 14 và 16)

**Giải pháp:**
```diff
import {
    Home,
    BookOpen,
    Award,
    Clock,
    FileText,
    TrendingUp,
    Trophy,
    User,
    CreditCard,
    Settings,
    LifeBuoy,
    BrainCircuit,
    MessageSquare,
    Bot,
-   MessageSquare,  // ❌ Removed duplicate
    Users,
} from 'lucide-react'
```

**Impact:**
- ✅ Không ảnh hưởng đến functionality
- ✅ Pure syntax fix

---

### 3. Web Learner - Comment System

#### **File:** `apps/web-learner/components/post/comment-section.tsx`

**Vấn đề:**
```
Error: Property 'postId' does not exist in type CommentQueryDTO
Error: Property 'qaId' does not exist in type CommentQueryDTO
```

**Nguyên nhân:**
- API endpoint đã được refactor để dùng generic `entityId` + `targetType`
- Component vẫn dùng cách cũ: `postId` và `qaId`

**Schema Mới:**
```typescript
// packages/schemas/src/dtos/comment.dto.ts
export const commentQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    entityId: z.string().uuid().optional(),        // ✅ NEW
    targetType: z.nativeEnum(CommentTargetType).optional(), // ✅ NEW
    parentId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export enum CommentTargetType {
    BLOG = 'BLOG',
    QA = 'QA',
    LESSON = 'LESSON',
}
```

**Giải pháp:**

1. **Import CommentTargetType:**
```typescript
import { CommentTargetType } from '@workspace/schemas'
```

2. **Update Fetch Comments:**
```typescript
// ❌ CŨ
const response = await postCommentApi.findAll({ 
    page: 1, 
    limit: 100, 
    postId, 
    qaId 
})

// ✅ MỚI
const entityId = postId || qaId
const targetType = postId ? CommentTargetType.BLOG : CommentTargetType.QA
if (!entityId) return

const response = await postCommentApi.findAll({ 
    page: 1, 
    limit: 100, 
    entityId, 
    targetType 
})
```

3. **Update Create Comment:**
```typescript
// ❌ CŨ
const newComment = await postCommentApi.create({
    postId: postId || undefined,
    qaId: qaId || undefined,
    userId: user.id,
    content: content.trim(),
    parentId: parentId || undefined
})

// ✅ MỚI
const entityId = postId || qaId
const targetType = postId ? CommentTargetType.BLOG : CommentTargetType.QA
if (!entityId) {
    toast.error('Không thể xác định bài viết')
    return
}

const newComment = await postCommentApi.create({
    entityId,
    targetType,
    userId: user.id,
    content: content.trim(),
    parentId: parentId || undefined
})
```

**Impact:**
- ✅ Comment system hoạt động đúng với cả Blog và QA posts
- ✅ API calls match với backend schema
- ⚠️ Cần test kỹ cả 2 flows: Blog comments và QA comments

---

### 4. Web Learner - QA Post Card

#### **File:** `apps/web-learner/components/qa/qa-post-card.tsx`

**Vấn đề:**
```
Error: Property 'isFollowingAuthor' does not exist on type QAResponseDTO
```

**Nguyên nhân:**
- Component đang dùng `post.isFollowingAuthor`
- Field này không tồn tại trong `QAResponseDTO` schema

**Schema Hiện Tại:**
```typescript
// packages/schemas/src/dtos/qa.dto.ts
export const qaResponseDTOSchema = qaSchema.extend({
    author: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().nullable().optional(),
    }).optional(),
    likes: z.number().optional().default(0),
    comments: z.number().optional().default(0),
    isLiked: z.boolean().optional().default(false),
    // ❌ KHÔNG CÓ isFollowingAuthor
});
```

**Giải pháp:**
- Xóa toàn bộ Follow button (lines 184-196)
- Feature này chưa được backend support

```diff
<div className="flex items-center gap-4 pt-3 border-t border-border/40">
    <Button variant="ghost" size="sm" ...>
        <Heart ... />
        <span>Yêu thích ({post.likes || 0})</span>
    </Button>
    <Button variant="ghost" size="sm" ...>
        <MessageCircle ... />
        <span>Bình luận ({post.comments || 0})</span>
    </Button>
-   <Button variant="ghost" size="sm" ...>  {/* ❌ Removed */}
-       {post.isFollowingAuthor ? <UserCheck /> : <UserPlus />}
-       <span>{post.isFollowingAuthor ? 'Đang theo dõi' : 'Theo dõi'}</span>
-   </Button>
</div>
```

**Impact:**
- ❌ User không thể follow author từ QA post card
- ✅ Có thể implement lại khi backend support
- ✅ Không ảnh hưởng đến chức năng Like và Comment

---

## 🔄 Các Flow Chính

### Flow 1: View Post Details (Admin)

```
1. Admin → Posts Management
2. Click "View" button
3. ViewPostSheet opens
4. Display:
   ✅ Title, Author, Content, Status, Tags, Cover Image
   ❌ SEO Title/Description (removed)
```

**Edge Cases:**
- Post thiếu excerpt → Section bị ẩn
- Post thiếu cover image → Section bị ẩn
- Post thiếu tags → Section bị ẩn
- Status: draft/published/archived → Badge màu khác nhau

---

### Flow 2: Blog Post Comments (Learner)

```
1. User → Blog Post Detail Page
2. CommentSection loads với postId
3. API call: { entityId: postId, targetType: 'BLOG' }
4. Display comments tree
5. User actions:
   - Create root comment
   - Reply to comment
   - Like/unlike comment
   - Edit own comment
   - Delete own comment
```

**API Mapping:**
```javascript
// Fetch
GET /comments?entityId={postId}&targetType=BLOG&page=1&limit=100

// Create
POST /comments
{
  "entityId": "uuid-of-post",
  "targetType": "BLOG",
  "userId": "uuid-of-user",
  "content": "comment text",
  "parentId": "uuid-of-parent-comment" // optional
}
```

**Edge Cases:**
- User chưa đăng nhập → Toast error, disable input
- Empty content → Toast error
- Network error → Toast error + revert optimistic update
- No comments → Show empty state

---

### Flow 3: QA Post Comments (Learner)

```
1. User → QA Post Detail Page
2. CommentSection loads với qaId
3. API call: { entityId: qaId, targetType: 'QA' }
4. Display comments tree
5. Same user actions as Blog comments
```

**API Mapping:**
```javascript
// Fetch
GET /comments?entityId={qaId}&targetType=QA&page=1&limit=100

// Create
POST /comments
{
  "entityId": "uuid-of-qa",
  "targetType": "QA",
  "userId": "uuid-of-user",
  "content": "comment text",
  "parentId": "uuid-of-parent-comment" // optional
}
```

---

### Flow 4: QA Post Card Interactions (Learner)

```
1. User → Q&A Page
2. Display list of QA posts
3. Each post shows QAPostCard
4. Available actions:
   ✅ Like post
   ✅ Comment (navigate to detail)
   ✅ Edit (owner only)
   ✅ Delete (owner only)
   ✅ Report (non-owner)
   ❌ Follow author (removed)
```

**User Actions:**

**Like:**
```
Click "Yêu thích" → Toggle like → Update count → Call API
```

**Comment:**
```
Click "Bình luận" → Navigate to /dashboard/qa/[postId]
```

**Edit (Owner):**
```
Click "..." → "Chỉnh sửa" → Open QAEditPostDialog → Save → Update
```

**Delete (Owner):**
```
Click "..." → "Xóa bài viết" → Confirm dialog → Delete → Refresh list
```

**Report (Non-owner):**
```
Click "..." → "Báo cáo" → Toast: "Tính năng đang được phát triển"
```

---

## 🧪 Testing Checklist

### Manual Testing

#### **1. Admin - Post Management**
- [ ] View post với đầy đủ thông tin
- [ ] View post thiếu excerpt
- [ ] View post thiếu cover image
- [ ] View post thiếu tags
- [ ] Verify các status: draft, published, archived
- [ ] **Verify KHÔNG có SEO section**

#### **2. Learner - Blog Comments**
- [ ] Load comments thành công
- [ ] Create root comment
- [ ] Reply to comment
- [ ] Like comment
- [ ] Unlike comment
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] Test khi chưa đăng nhập
- [ ] Test với empty content
- [ ] Test network error handling

#### **3. Learner - QA Comments**
- [ ] Tất cả test cases giống Blog Comments
- [ ] **Verify targetType = 'QA' trong API call**
- [ ] Verify comments hiển thị đúng

#### **4. Learner - QA Post Card**
- [ ] Like post
- [ ] Unlike post
- [ ] Click comment → navigate đúng page
- [ ] Edit post (owner)
- [ ] Delete post (owner)
- [ ] Report post (non-owner)
- [ ] **Verify KHÔNG có follow button**

### API Testing

#### **Comment API Calls**

**Blog Comments:**
```bash
# Fetch
curl -X GET "http://localhost:3000/api/comments?entityId=<post-uuid>&targetType=BLOG&page=1&limit=100"

# Create
curl -X POST "http://localhost:3000/api/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "<post-uuid>",
    "targetType": "BLOG",
    "userId": "<user-uuid>",
    "content": "Test comment"
  }'
```

**QA Comments:**
```bash
# Fetch
curl -X GET "http://localhost:3000/api/comments?entityId=<qa-uuid>&targetType=QA&page=1&limit=100"

# Create
curl -X POST "http://localhost:3000/api/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "<qa-uuid>",
    "targetType": "QA",
    "userId": "<user-uuid>",
    "content": "Test comment"
  }'
```

---

## 📊 Impact Analysis

### Breaking Changes
❌ **KHÔNG CÓ** - Tất cả là bug fixes

### Backward Compatibility
✅ **HOÀN TOÀN TƯƠNG THÍCH**

### Database Changes
❌ **KHÔNG CÓ** - Không có migration

### API Changes
✅ **CÓ** - Comment API parameters
- Old: `postId`, `qaId`
- New: `entityId`, `targetType`
- **Note:** Đây là fix để match với backend schema đã có sẵn

### UI Changes

**Removed Features:**
1. ❌ SEO Title/Description display (Admin - View Post)
2. ❌ Follow Author button (Learner - QA Post Card)

**Reason:** Backend chưa support

**Future Implementation:**
- SEO fields: Cần thêm vào Prisma schema + migration
- Follow feature: Cần backend API endpoint

---

## 🚀 Deployment Notes

### Build Commands
```bash
# Web Admin
cd apps/web-admin
pnpm run build
# ✅ Expected: Build success in ~1-2s

# Web Learner
cd apps/web-learner
pnpm run build
# ✅ Expected: Build success, 43 routes generated
```

### Environment Variables
❌ **KHÔNG CẦN THAY ĐỔI**

### Database Migrations
❌ **KHÔNG CẦN CHẠY**

### Post-Deployment Verification
1. ✅ Admin: View post details (verify no SEO section)
2. ✅ Learner: Create blog comment (verify API call)
3. ✅ Learner: Create QA comment (verify API call)
4. ✅ Learner: QA post interactions (verify no follow button)

---

## 📝 Future Enhancements

### 1. SEO Fields Support

**Backend:**
```prisma
// apps/server/prisma/schema.prisma
model Post {
  // ... existing fields
  seoTitle       String?  @map("seo_title") @db.VarChar(255)
  seoDescription String?  @map("seo_description") @db.VarChar(500)
}
```

**Schema:**
```typescript
// packages/schemas/src/models/post.model.ts
export const postSchema = z.object({
  // ... existing fields
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
});
```

**UI:**
- Re-add SEO section in `view-post-sheet.tsx`
- Add SEO fields in create/edit forms

### 2. Follow Author Feature

**Backend:**
```prisma
model UserFollow {
  id          String   @id @default(uuid())
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now())
  
  follower  User @relation("Followers", fields: [followerId], references: [id])
  following User @relation("Following", fields: [followingId], references: [id])
  
  @@unique([followerId, followingId])
  @@map("user_follows")
}
```

**API Endpoints:**
```typescript
POST /api/users/:userId/follow
DELETE /api/users/:userId/unfollow
GET /api/users/:userId/followers
GET /api/users/:userId/following
```

**Schema:**
```typescript
export const qaResponseDTOSchema = qaSchema.extend({
  // ... existing fields
  isFollowingAuthor: z.boolean().optional().default(false),
});
```

**UI:**
- Re-add Follow button in `qa-post-card.tsx`
- Add follow management in user profile

---

## 🔗 Related Files

### Modified Files
```
apps/web-admin/src/components/posts/view-post-sheet.tsx
apps/web-learner/config/navigation.ts
apps/web-learner/components/post/comment-section.tsx
apps/web-learner/components/qa/qa-post-card.tsx
```

### Related Schema Files
```
packages/schemas/src/models/post.model.ts
packages/schemas/src/models/comment.model.ts
packages/schemas/src/models/qa.model.ts
packages/schemas/src/dtos/post.dto.ts
packages/schemas/src/dtos/comment.dto.ts
packages/schemas/src/dtos/qa.dto.ts
```

### Related API Files
```
apps/web-learner/apis/services/post-comment-api.ts
apps/web-learner/apis/services/qa-api.ts
```

---

## 📞 Support

Nếu gặp vấn đề sau khi deploy:

1. **Build fails:**
   - Check TypeScript version
   - Run `pnpm install` to ensure dependencies
   - Clear `.next` cache: `rm -rf .next`

2. **Comment API errors:**
   - Verify backend is using new schema
   - Check API endpoint: `/api/comments`
   - Verify `entityId` and `targetType` parameters

3. **Missing features:**
   - SEO fields: Expected, will implement later
   - Follow button: Expected, will implement later

---

**Generated:** 2026-02-05  
**Author:** AI Assistant  
**Session:** Build Fixes  
**Status:** ✅ Completed
