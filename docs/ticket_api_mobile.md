# Ticket Feature API Documentation

This document outlines the API endpoints and data structures for the Ticket feature in the Torii application. It is designed to assist the mobile team in integrating support and refund functionality.

## Base URL
`/api/tickets`

## Authentication
All endpoints require authentication (Bearer Token).
- **Learners**: Can create tickets and view ONLY their own tickets.
- **Support/Admin**: Can view and manage all tickets.

---

## 1. Create a Ticket
Submit a new support request, error report, or refund request.

- **Endpoint**: `POST /api/tickets`
- **Role**: Learner

### Request Body (`CreateTicketDTO`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | Enum | Yes | One of: `SUPPORT`, `REFUND`, `ERROR_REPORT` |
| `subject` | String | Yes | Title of the request (max 255 chars) |
| `description` | String | Yes | Detailed explanation of the issue |
| `metadata` | Object | No | Additional data. Required for `REFUND`. |

#### Refund Specifics
If `type` is `REFUND`, `metadata` **must** include:
```json
{
  "courseId": "uuid-of-course"
}
```

### Example Request
```json
// Support Ticket
{
  "type": "SUPPORT",
  "subject": "Cannot access video",
  "description": "Video in Lesson 5 is just a black screen."
}

// Refund Ticket
{
  "type": "REFUND",
  "subject": "Refund for JLPT N3",
  "description": "I bought this by mistake.",
  "metadata": {
    "courseId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Responses
- `201 Created`: Ticket submitted successfully.

---

## 2. Get All Tickets
Retrieve a paginated list of tickets.

- **Endpoint**: `GET /api/tickets`
- **Role**: Learner (Own tickets only), Admin (All tickets)

### Query Parameters
| Param | Type | Description |
| :--- | :--- | :--- |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 10) |
| `search` | String | Search by subject or description |
| `status` | Enum | Filter by status: `PENDING`, `PROCESSING`, `APPROVED`, `REJECTED` |
| `type` | Enum | Filter by type: `SUPPORT`, `REFUND`, `ERROR_REPORT` |

### Example Response
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "SUPPORT",
      "status": "APPROVED",
      "subject": "Login issues",
      "description": "...",
      "response": "We have fixed your account.",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 3. Get Ticket Detail
Get full details of a specific ticket.

- **Endpoint**: `GET /api/tickets/:id`
- **Role**: Learner (Owner), Admin

### Example Response
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "REFUND",
  "status": "PENDING",
  "subject": "Refund request",
  "description": "I want my money back",
  "response": null,
  "metadata": {
    "courseId": "uuid"
  },
  "createdAt": "...",
  "updatedAt": "...",
  "user": {
    "id": "uuid",
    "displayName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "..."
  },
  "handler": null
}
```

---

## 4. Update Ticket Status (Admin/Support Only)
Process a ticket by approving, rejecting, or marking it as processing.

- **Endpoint**: `PATCH /api/tickets/:id/status`
- **Role**: Admin, Support Staff

### Request Body (`UpdateTicketStatusDTO`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | Enum | Yes | `PROCESSING`, `APPROVED`, `REJECTED` |
| `response` | String | No | Message to the user (reason for rejection, etc.) |

### Side Effects
- **Approved Refund**: Automatically deletes the user's enrollment in the course.
- **Notifications**: Sends a notification to the user about the status change.

---

## Data Models

### Enums
**TicketType**
- `SUPPORT`: General technical support
- `REFUND`: Request for money back (requires courseId)
- `ERROR_REPORT`: Bug reporting

**TicketStatus**
- `PENDING`: Newly created
- `PROCESSING`: Staff is working on it
- `APPROVED`: Request granted / solved
- `REJECTED`: Request denied

### Ticket Schema
```typescript
interface Ticket {
  id: string;
  userId: string;
  handlerId?: string;
  type: TicketType;
  status: TicketStatus;
  subject: string;
  description: string;
  metadata?: Record<string, any>; // { courseId: string } for Refunds
  response?: string;
  createdAt: string;
  updatedAt: string;
}
```
