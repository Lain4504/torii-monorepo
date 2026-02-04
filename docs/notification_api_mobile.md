# Notification Feature API Documentation

This document outlines the API endpoints and data models for the Notification feature in the Torii application, designed for mobile integration.

## Base URL
`/api/notifications`

## Authentication
All endpoints require authentication (Bearer Token).
Users can only access their own notifications.

---

## 1. Get All Notifications
Retrieve a paginated list of notifications for the current user.

- **Endpoint**: `GET /api/notifications`
- **Role**: Learner

### Query Parameters
| Param | Type | Description |
| :--- | :--- | :--- |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 10) |
| `isRead` | Boolean | Filter by read status (`true` or `false`). Omit to get all. |

### Example Response
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Welcome to Torii!",
      "message": "Start your first lesson today.",
      "notificationType": "system",
      "metadata": {},
      "isRead": false,
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 2. Get Unread Count
Get the total number of unread notifications for the badge/icon.

- **Endpoint**: `GET /api/notifications/unread-count`
- **Role**: Learner

### Example Response
```json
{
  "count": 3
}
```

---

## 3. Mark as Read
Mark a specific notification as read.

- **Endpoint**: `PATCH /api/notifications/:id/read`
- **Role**: Learner

### Response
Returns the updated notification or success status.

---

## 4. Mark All as Read
Mark all notifications for the user as read.

- **Endpoint**: `PATCH /api/notifications/read-all`
- **Role**: Learner

---

## 5. Delete Notification
Delete a notification.

- **Endpoint**: `DELETE /api/notifications/:id`
- **Role**: Learner

---

## Data Models

### Notification Type Enum
The `notificationType` field can be one of the following:

- `system`: General system messages
- `course`: Course-related updates
- `live_class`: Reminders for live sessions
- `payment`: Payment success/failure
- `achievement`: Gamification rewards
- `reminder`: Study reminders
- `comment_reply`: Someone replied to a comment
- `order_success`: Order confirmation
- `order_status_update`: Order shipping/processing update

### Metadata
The `metadata` (or `data`) field contains dynamic JSON relevant to the type.
Example for `payment`:
```json
{
  "orderId": "uuid",
  "amount": 500000
}
```
Example for `course`:
```json
{
  "courseId": "uuid",
  "lessonId": "uuid"
}
```
