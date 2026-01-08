# API Response Format Standardization

## Standard Response Format

Tất cả API responses nên follow format này để đảm bảo consistency:

### Success Response
```typescript
{
  success: true,
  data: any,           // Actual response data
  message?: string     // Optional success message
}
```

### Error Response
```typescript
{
  success: false,
  message: string,      // User-friendly error message
  errors?: any[]       // Optional detailed errors (for validation)
}
```

## Implementation

### Helper Functions

Đã tạo helper functions trong `@server/shared`:

```typescript
import { successResponse, errorResponse } from '@server/shared';

// Success response
return successResponse(data, 'Optional message');

// Error response
return errorResponse('Error message', optionalErrorsArray);
```

### Example Usage

```typescript
// Before
return {
    success: true,
    data: { user },
    message: 'User created successfully'
};

// After
return successResponse(
    { user },
    'User created successfully'
);
```

```typescript
// Before
return {
    success: false,
    message: 'Invalid credentials'
};

// After
return errorResponse('Invalid credentials');
```

## Exception Handling

Identity module có **Global Exception Filter** (`IdentityHttpExceptionFilter`) để:
- Convert tất cả NestJS exceptions (BadRequestException, UnauthorizedException, etc.) sang standard format
- Handle validation errors và format chúng thành `errors` array
- Đảm bảo mọi response từ Identity module đều theo standard format

### Example

```typescript
// Controller throws exception
throw new BadRequestException('Email is required');

// Filter converts to:
{
  success: false,
  message: 'Email is required'
}

// Validation errors:
throw new BadRequestException({
  message: ['Email is invalid', 'Password too short']
});

// Filter converts to:
{
  success: false,
  message: 'Validation failed',
  errors: ['Email is invalid', 'Password too short']
}
```

## Migration Status

### ✅ Completed
- **Identity Module** - Tất cả endpoints đã dùng standard format
- **Identity Module** - Global exception filter để handle NestJS exceptions

### 🔄 Pending
- Learning Module
- Other modules

## Client API Handling

Client API (`api-client.ts`) chỉ handle standard format:
- **Standard Format Only**: Chỉ xử lý `{ success: false, message: string, errors?: any[] }`
- **Simplified**: Logic đơn giản, tập trung vào standard format
- **No Legacy Support**: Không hỗ trợ các format cũ (NestJS exceptions, etc.)

## Next Steps

1. Migrate Learning Module controllers sang standard format
2. Migrate other modules dần dần
3. Tất cả APIs phải dùng standard format để client có thể handle đúng

