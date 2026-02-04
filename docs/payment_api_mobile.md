# Payment Feature API Documentation

This document outlines the API endpoints and flows for the Payment feature in the Torii application, designed for mobile integration.

## Base URL
`/api/orders`

## Authentication
All user endpoints require authentication (Bearer Token).

---

## 1. Create Order (Checkout)
Initiate a purchase process (e.g., buying a course).

- **Endpoint**: `POST /api/orders`
- **Role**: Learner

### Request Body (`OrderCreateDTO`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | UUID | Yes* | Required for `COURSE_PURCHASE`. |
| `paymentMethod` | Enum | Yes | `CREDIT_CARD`, `BANK_TRANSFER`, `MOMO`, `ZALOPAY`, `VNPAY`, `SEPAY`, `MOCK` |
| `paymentGateway` | Enum | No | `STRIPE`, `PAYPAL`, `VNPAY`, `MOMO`, `SEPAY`, `MOCK` |
| `orderType` | Enum | No | Default: `COURSE_PURCHASE` |
| `couponCode` | String | No | Apply a discount coupon |
| `returnUrl` | URL | No | URL to redirect after successful payment (PayOS/Gateway) |
| `cancelUrl` | URL | No | URL to redirect after cancelled payment |

### Example Request
```json
{
  "courseId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentMethod": "SEPAY",
  "paymentGateway": "SEPAY",
  "couponCode": "WELCOME20",
  "returnUrl": "https://torii.edu.vn/checkout/success",
  "cancelUrl": "https://torii.edu.vn/checkout/cancel"
}
```

### Response (`OrderResponseDTO`)
Returns the created order. If using a gateway like PayOS/SePay, look for `checkoutUrl` in the response or metadata.
```json
{
  "order": {
    "id": "uuid",
    "amount": 500000,
    "status": "PENDING",
    "metadata": {
      "checkoutUrl": "https://sepay.vn/checkout/..."
    }
  }
}
```

---

## 2. Get All Orders
Retrieve a history of user's orders.

- **Endpoint**: `GET /api/orders`
- **Role**: Learner

### Query Parameters
| Param | Type | Description |
| :--- | :--- | :--- |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 10) |
| `status` | Enum | `PENDING`, `COMPLETED`, `FAILED`, `CANCELLED` |

---

## 3. Get Order Details
Get specific details of an order.

- **Endpoint**: `GET /api/orders/:id`
- **Role**: Learner

---

## 4. Payment Webhook (Backend)
This endpoint is used by the payment gateway (e.g., PayOS, SePay) to notify the system of payment success. **Mobile apps does not call this directly**, but should know it exists.

- **Endpoint**: `POST /payos/webhook`
- **Access**: Public (Verified by signature/token in logic)

---

## 5. Get Transactions
View the log of actual payment transactions (receipts).

- **Endpoint**: `GET /api/orders/transactions`
- **Role**: Learner

### Query Parameters
| Param | Type | Description |
| :--- | :--- | :--- |
| `orderId` | UUID | Filter by specific order |

---

## Mobile Payment Flow

1.  **User Selects Course**: Mobile app identifies `courseId`.
2.  **User Initiates Checkout**: App calls `POST /api/orders` with `courseId`, `returnUrl` (deeplink to app).
3.  **Redirect to Gateway**: App opens the `checkoutUrl` (from response) in a WebView or Browser.
4.  **Payment Processing**: User pays on the Gateway (Banking app/Card).
5.  **Completion**:
    *   **Success**: Gateway redirects to `returnUrl` (App Deeplink). App calls `GET /api/orders/:id` to confirm status is `COMPLETED` (or polls until it is).
    *   **Cancel**: Gateway redirects to `cancelUrl`.
6.  **Access**: Once `COMPLETED`, the system automatically creates an `Enrollment`. The user can now access course content.
