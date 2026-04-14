# Mobile Integration Guide: Course Purchase & Gifting

This document outlines the API flow for integrating course purchases and gifting into the Torii mobile application, following the established web-learner patterns.

## 1. Flow Overview

The purchase flow consists of three main steps:
1. **Recipient Validation** (Mandatory for Gifting): Verify the recipient exists and is eligible to receive the gift.
2. **Order Preview**: Calculate final prices, apply coupons, and validate inventory/enrollment status.
3. **Checkout**: Create the order and retrieve the payment URL.

---

## 2. API Reference

### A. Check Gift Recipient
Verify if a recipient exists and can receive a specific course.

- **Endpoint**: `GET /api/academy/enrollments/check-gift-recipient`
- **Authentication**: Required (JWT)
- **Query Parameters**:
  - `recipientEmail`: Email address of the recipient.
  - `courseId`: UUID of the `Cohort` (for LIVE) or `VODPackage`.

**Sample Response (`Success`)**:
```json
{
  "success": true,
  "data": {
    "isRegistered": true,
    "isEnrolled": false,
    "recipientName": "Nguyễn Văn A"
  }
}
```

> [!IMPORTANT]
> - `isRegistered: false` means the email does not exist in Torii. You should block payment.
> - `isEnrolled: true` means the recipient already owns the course. You should block payment.

---

### B. Order Preview
Get the final price after discounts and validate all items.

- **Endpoint**: `POST /api/academy/orders/preview`
- **Payload**:
```json
{
  "cohortIds": ["uuid-cohort-1"], // For LIVE classes
  "liveClassIds": ["uuid-class-1"], // Selected class ID for the cohort
  "liveClassIdByCohort": { "uuid-cohort-1": "uuid-class-1" },
  "vodPackageIds": [], // empty if buying LIVE
  "couponCode": "GIAM20", // optional
  "isGift": true,
  "recipientEmail": "recipient@example.com" // required if isGift: true
}
```

**Response**:
Returns `subTotal`, `discountTotal`, and `grandTotal`. Throws error if recipient is invalid or items are unavailable.

---

### C. Checkout
Create the order and get the payment link.

- **Endpoint**: `POST /api/academy/orders/checkout`
- **Payload**:
```json
{
  "paymentMethod": "PAYOS", // or "COIN"
  "isGift": true,
  "recipientEmail": "recipient@example.com",
  "giftMessage": "Chúc bạn học tốt!", // optional
  "cohortIds": [...],
  "liveClassIdByCohort": { ... }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderCode": "ORD-20260414-XXXX",
    "paymentUrl": "https://pay.payos.vn/web/..."
  }
}
```

---

## 3. Best Practices for Mobile

1. **Email Debouncing**: Implement a 500-600ms debounce on the `recipientEmail` field before calling the `check-gift-recipient` API.
2. **Handle Redirection**: After receiving `paymentUrl`, open it in a system browser or a Webview.
3. **Deep Linking**: Ensure your app handles the `cancelUrl` and `returnUrl` correctly to return the user to the app after payment.
