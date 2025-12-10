# Booka API Documentation

Base URL: `http://localhost:3001/api`

## Table of Contents
1. [Authentication](#authentication)
2. [Admins Module](#admins-module)
3. [Users Module](#users-module)
4. [Agents Module](#agents-module)
5. [Universities Module](#universities-module)
6. [Books Module](#books-module)
7. [Orders Module](#orders-module)
8. [Configs Module](#configs-module)
9. [Waitlist Module](#waitlist-module)

---

## Authentication

All authenticated endpoints require a valid JWT token passed via HTTP-only cookies:
- **Admin routes**: `adminAccessToken` cookie
- **User routes**: `userAccessToken` cookie
- **Agent routes**: `agentAccessToken` cookie

### Response Format

All successful responses follow this structure:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

---

## Admins Module

Base path: `/api/admins`

### 1. Create Admin (Super Admin Only)

**POST** `/create`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "08012345678",
  "role": "manager" // "manager" | "super" | "operator"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "admin": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "manager",
      "universityId": null
    },
    "temporaryPassword": "generated-password"
  }
}
```

---

### 2. Login Admin

**POST** `/login`

**Auth Required**: None

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": "uuid",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "manager",
      "universityId": "uuid"
    }
  }
}
```

**Note**: Sets `adminAccessToken` and `adminRefreshToken` cookies

---

### 3. Refresh Admin Token

**POST** `/refresh-token`

**Auth Required**: Refresh token cookie

**Response**: Returns new access token in cookie

---

### 4. Logout Admin

**GET** `/logout`

**Auth Required**: None (clears cookies)

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 5. Reset Admin Password

**POST** `/reset-password`

**Auth Required**: Any Admin

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

### 6. Get Personal Admin Info

**GET** `/get-personal-info`

**Auth Required**: Any Admin

**Response**:
```json
{
  "success": true,
  "message": "Admin info retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Admin Name",
    "email": "admin@example.com",
    "phoneNumber": "08012345678",
    "role": "manager",
    "universityId": "uuid",
    "commissions": 15000
  }
}
```

---

### 7. Update Personal Admin Info

**PUT** `/update-personal-info`

**Auth Required**: Any Admin

**Request Body**:
```json
{
  "name": "Updated Name",
  "phoneNumber": "08098765432"
}
```

---

### 8. Get All Admins (Super Admin Only)

**GET** `/get-all-admins`

**Auth Required**: Super Admin

**Response**: Returns array of all admins

---

### 9. Get Admin By ID (Super Admin Only)

**GET** `/get-admin/:id`

**Auth Required**: Super Admin

---

### 10. Delete Admin (Super Admin Only)

**DELETE** `/delete-admin/:id`

**Auth Required**: Super Admin

---

## Users Module

Base path: `/api/users`

### 1. User Signup

**POST** `/signup-user`

**Auth Required**: None

**Request Body**:
```json
{
  "name": "Student Name",
  "email": "student@university.edu",
  "phoneNumber": "08012345678",
  "password": "password123",
  "department": "Computer Science",
  "level": 300,
  "universityId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Student Name",
      "email": "student@university.edu",
      "universityId": "uuid"
    }
  }
}
```

---

### 2. User Login

**POST** `/login-user`

**Auth Required**: None

**Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response**: Sets `userAccessToken` and `userRefreshToken` cookies

---

### 3. User Logout

**GET** `/logout-user`

**Auth Required**: None (clears cookies)

---

### 4. Refresh User Token

**POST** `/refresh-user-token`

**Auth Required**: Refresh token cookie

---

### 5. Get Personal User Info

**GET** `/get-personal-user-info`

**Auth Required**: User

**Response**:
```json
{
  "success": true,
  "message": "User info retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Student Name",
    "email": "student@university.edu",
    "phoneNumber": "08012345678",
    "department": "Computer Science",
    "level": 300,
    "universityId": "uuid"
  }
}
```

---

### 6. Update Personal User Info

**PUT** `/update-personal-user-info`

**Auth Required**: User

**Request Body**:
```json
{
  "name": "Updated Name",
  "phoneNumber": "08098765432",
  "department": "Software Engineering",
  "level": 400
}
```

---

### 7. Change User Password

**POST** `/change-user-password`

**Auth Required**: User

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Agents Module

Base path: `/api/agents`

### 1. Agent Signup

**POST** `/signup-agent`

**Auth Required**: None

**Request Body**:
```json
{
  "name": "Agent Name",
  "email": "agent@example.com",
  "phoneNumber": "08012345678",
  "password": "password123",
  "universityId": "uuid",
  "studentIdUrl": "https://cloudinary.com/student-id.jpg",
  "ninSlipUrl": "https://cloudinary.com/nin-slip.jpg",
  "idempotencyKey": "unique-key-string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Agent signup successful. Awaiting approval",
  "data": {
    "agent": {
      "id": "uuid",
      "name": "Agent Name",
      "email": "agent@example.com",
      "status": "pending"
    }
  }
}
```

**Note**: Agent status will be "pending" until approved by super admin

---

### 2. Agent Login

**POST** `/login-agent`

**Auth Required**: None

**Request Body**:
```json
{
  "email": "agent@example.com",
  "password": "password123"
}
```

**Response**: Sets `agentAccessToken` and `agentRefreshToken` cookies

**Note**: Only agents with "approved" status can login

---

### 3. Agent Logout

**POST** `/logout-agent`

**Auth Required**: Agent

---

### 4. Refresh Agent Token

**POST** `/refresh-agent-token`

**Auth Required**: Refresh token cookie

---

### 5. Get Agent Profile

**GET** `/get-agent-profile`

**Auth Required**: Agent

**Response**:
```json
{
  "success": true,
  "message": "Agent profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Agent Name",
    "email": "agent@example.com",
    "phoneNumber": "08012345678",
    "universityId": "uuid",
    "university": {
      "id": "uuid",
      "name": "University Name",
      "slug": "university-slug"
    },
    "status": "approved",
    "assignedZones": ["Zone A", "Zone B"],
    "totalCommissions": 25000,
    "pendingOrdersCount": 5,
    "createdAt": "2025-12-01T00:00:00.000Z",
    "updatedAt": "2025-12-06T00:00:00.000Z"
  }
}
```

---

### 6. Scan QR Code (Agent Only)

**POST** `/scan-qr-code`

**Auth Required**: Agent

**Request Body**:
```json
{
  "qrCode": "BOOKA_ORDER_uuid_randomhex"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order confirmed successfully",
  "data": {
    "order": { /* order details */ }
  }
}
```

**Note**: Marks order as completed and distributes commissions to agent and manager

---

### 7. Get University Agents (Manager Admin Only)

**GET** `/university-agents`

**Auth Required**: Manager Admin

**Query Parameters**:
- `status` (optional): "pending" | "approved" | "rejected"
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Items per page

**Response**:
```json
{
  "success": true,
  "message": "University agents retrieved successfully",
  "data": {
    "agents": [
      {
        "id": "uuid",
        "name": "Agent Name",
        "email": "agent@example.com",
        "phoneNumber": "08012345678",
        "universityId": "uuid",
        "university": {
          "id": "uuid",
          "name": "University Name",
          "slug": "university-slug"
        },
        "status": "approved",
        "assignedZones": ["Zone A"],
        "totalCommissions": 25000,
        "pendingOrdersCount": 3,
        "createdAt": "2025-12-01T00:00:00.000Z",
        "updatedAt": "2025-12-06T00:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 8. Get Agent By ID (Any Admin)

**GET** `/agent/:agentId`

**Auth Required**: Any Admin

**Note**: Regular admins can only view agents from their university. Super admins can view any agent.

**Response**:
```json
{
  "success": true,
  "message": "Agent retrieved successfully",
  "data": {
    "agent": {
      "id": "uuid",
      "name": "Agent Name",
      "email": "agent@example.com",
      "phoneNumber": "08012345678",
      "universityId": "uuid",
      "university": {
        "id": "uuid",
        "name": "University Name",
        "slug": "university-slug"
      },
      "status": "approved",
      "studentIdUrl": "https://cloudinary.com/student-id.jpg",
      "assignedZones": ["Zone A", "Zone B"],
      "totalCommissions": 25000,
      "pendingOrdersCount": 5,
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-06T00:00:00.000Z"
    }
  }
}
```

---

### 9. Approve Agent (Super Admin Only)

**POST** `/approve-agent`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "agentId": "uuid",
  "status": "approved" // "approved" | "rejected"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Agent approved successfully",
  "data": {
    "agent": { /* agent details */ }
  }
}
```

**Note**: Sends approval/rejection email to agent

---

### 10. Assign Zones to Agent (Super Admin Only)

**POST** `/assign-zones`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "agentId": "uuid",
  "zones": ["Zone A", "Zone B", "Zone C"]
}
```

---

### 11. Get All Agents (Super Admin Only)

**GET** `/get-all-agents`

**Auth Required**: Super Admin

**Query Parameters**:
- `status` (optional): "pending" | "approved" | "rejected"
- `universityId` (optional): Filter by university
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Items per page

**Response**: Same structure as "Get University Agents"

---

## Universities Module

Base path: `/api/universities`

### 1. Upload University Logo (Super Admin Only)

**POST** `/upload-university-logo`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "image": "base64-encoded-image-string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": {
    "url": "https://cloudinary.com/logo.jpg",
    "fileId": "cloudinary-file-id"
  }
}
```

---

### 2. Delete University Logo (Super Admin Only)

**DELETE** `/delete-university-logo`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "fileId": "cloudinary-file-id"
}
```

---

### 3. Create University (Super Admin Only)

**POST** `/create-university`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "name": "University of Lagos",
  "state": "Lagos",
  "city": "Lagos",
  "slug": "unilag",
  "logoUrl": "https://cloudinary.com/logo.jpg",
  "logoFileId": "cloudinary-file-id",
  "maxAgents": 50
}
```

**Response**:
```json
{
  "success": true,
  "message": "University created successfully",
  "data": {
    "id": "uuid",
    "name": "University of Lagos",
    "state": "Lagos",
    "city": "Lagos",
    "slug": "unilag",
    "logoUrl": "https://cloudinary.com/logo.jpg",
    "maxAgents": 50,
    "signedUpAgentsCount": 0
  }
}
```

---

### 4. Get All Universities

**GET** `/get-universities`

**Auth Required**: None

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `state` (optional): Filter by state

**Response**:
```json
{
  "success": true,
  "message": "Universities retrieved successfully",
  "data": {
    "universities": [
      {
        "id": "uuid",
        "name": "University of Lagos",
        "state": "Lagos",
        "city": "Lagos",
        "slug": "unilag",
        "logoUrl": "https://cloudinary.com/logo.jpg",
        "maxAgents": 50,
        "signedUpAgentsCount": 23
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 5. Get University By ID

**GET** `/get-university/:id`

**Auth Required**: None

---

### 6. Edit University (Super Admin Only)

**PUT** `/edit-university/:id`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "name": "Updated Name",
  "state": "Lagos",
  "city": "Lagos",
  "logoUrl": "https://cloudinary.com/new-logo.jpg",
  "logoFileId": "new-file-id",
  "maxAgents": 75
}
```

---

### 7. Delete University (Super Admin Only)

**DELETE** `/delete-university/:id`

**Auth Required**: Super Admin

---

### 8. Assign Admin to University (Super Admin Only)

**PUT** `/assign-admin`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "adminId": "uuid",
  "universityId": "uuid"
}
```

---

### 9. Change University Admin (Super Admin Only)

**PUT** `/change-university-admin`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "universityId": "uuid",
  "newAdminId": "uuid"
}
```

---

### 10. Remove University Admin (Super Admin Only)

**PUT** `/remove-university-admin`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "universityId": "uuid"
}
```

---

### 11. Get University Admin (Super Admin Only)

**GET** `/get-university-admin/:universityId`

**Auth Required**: Super Admin

---

## Books Module

Base path: `/api/books`

### 1. Upload Book Image (Manager Admin Only)

**POST** `/upload-book-image`

**Auth Required**: Manager Admin

**Request Body**:
```json
{
  "image": "base64-encoded-image-string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Book image uploaded successfully",
  "data": {
    "url": "https://cloudinary.com/book.jpg",
    "fileId": "cloudinary-file-id"
  }
}
```

---

### 2. Delete Book Image (Manager Admin Only)

**DELETE** `/delete-book-image`

**Auth Required**: Manager Admin

**Request Body**:
```json
{
  "fileId": "cloudinary-file-id"
}
```

---

### 3. Create Book (Manager Admin Only)

**POST** `/create-book`

**Auth Required**: Manager Admin

**Request Body**:
```json
{
  "title": "Introduction to Algorithms",
  "author": "Thomas H. Cormen",
  "edition": "3rd Edition",
  "price": 15000,
  "quantity": 50,
  "lowAlert": 10,
  "imageUrl": "https://cloudinary.com/book.jpg",
  "imageFileId": "cloudinary-file-id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": "uuid",
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "edition": "3rd Edition",
    "price": 15000,
    "quantity": 50,
    "lowAlert": 10,
    "imageUrl": "https://cloudinary.com/book.jpg",
    "status": "draft",
    "universityId": "uuid",
    "adminId": "uuid"
  }
}
```

**Note**: Books are created with status "draft" by default

---

### 4. Update Book (Manager Admin Only)

**PUT** `/update-book/:id`

**Auth Required**: Manager Admin

**Request Body**: Same as Create Book (all fields optional)

---

### 5. Delete Book (Manager Admin Only)

**DELETE** `/delete-book/:id`

**Auth Required**: Manager Admin

---

### 6. Get Books for Admin (Manager Admin Only)

**GET** `/get-books-admin`

**Auth Required**: Manager Admin

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `status` (optional): "draft" | "published"
- `search` (optional): Search by title or author

**Response**:
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": {
    "books": [
      {
        "id": "uuid",
        "title": "Introduction to Algorithms",
        "author": "Thomas H. Cormen",
        "edition": "3rd Edition",
        "price": 15000,
        "quantity": 50,
        "lowAlert": 10,
        "imageUrl": "https://cloudinary.com/book.jpg",
        "status": "published",
        "universityId": "uuid",
        "adminId": "uuid"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

---

### 7. Get Book by ID (Admin)

**GET** `/get-book-admin/:id`

**Auth Required**: Manager Admin

---

### 8. Get Books for User

**GET** `/get-books-user`

**Auth Required**: User

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `search` (optional): Search by title or author

**Response**: Returns only published books for the user's university

---

### 9. Get Book by ID (User)

**GET** `/get-book-user/:id`

**Auth Required**: User

---

### 10. Get Draft Books (Operator Admin Only)

**GET** `/get-draft-books`

**Auth Required**: Operator Admin

**Response**: Returns all draft books across all universities

---

### 11. Publish Book (Operator Admin Only)

**PUT** `/publish-book/:id`

**Auth Required**: Operator Admin

**Response**: Changes book status from "draft" to "published"

---

## Orders Module

Base path: `/api/orders`

### Order Status Flow
1. **pending** - Initial state after order creation
2. **purchased** - After payment verification
3. **confirmed** - After agent assignment
4. **ready** - Books are ready for pickup/delivery
5. **completed** - Order fulfilled (QR code scanned)
6. **cancelled** - Order cancelled

### 1. Create Order (User)

**POST** `/create-order`

**Auth Required**: User

**Request Body**:
```json
{
  "items": [
    {
      "bookId": "uuid",
      "quantity": 2
    },
    {
      "bookId": "uuid",
      "quantity": 1
    }
  ],
  "fulfillmentType": "delivery", // "delivery" | "pickup"
  "fulfillmentDate": "2025-12-10T00:00:00.000Z",
  "fulfillmentTime": "10:00 AM",
  "deliveryAddress": "123 Main St, Lagos", // required if fulfillmentType is "delivery"
  "pickupLocation": "Campus Bookstore", // required if fulfillmentType is "pickup"
  "idempotencyKey": "uuid-v4-string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "universityId": "uuid",
    "booksTotal": 45000,
    "serviceFee": 1200,
    "agentCommission": 360,
    "managerCommission": 90,
    "totalPrice": 46200,
    "status": "pending",
    "paymentStatus": "pending",
    "paymentReference": "BOOKA_userid_timestamp_key",
    "fulfillmentType": "delivery",
    "fulfillmentDate": "2025-12-10T00:00:00.000Z",
    "fulfillmentTime": "10:00 AM",
    "deliveryAddress": "123 Main St, Lagos",
    "authorizationUrl": "https://checkout.paystack.com/xxxxx",
    "items": [
      {
        "id": "uuid",
        "bookId": "uuid",
        "bookTitle": "Introduction to Algorithms",
        "bookPrice": 15000,
        "quantity": 2,
        "subtotal": 30000
      }
    ]
  }
}
```

**Notes**:
- Service fee is fetched from config table (per book)
- Commissions are calculated based on fulfillment type:
  - **Pickup**: Agent gets 80₦/book, Manager gets 30₦/book
  - **Delivery**: Agent gets 120₦/book, Manager gets 30₦/book
- Idempotency prevents duplicate orders
- User should be redirected to `authorizationUrl` for payment

---

### 2. Verify Payment (User)

**POST** `/verify-payment`

**Auth Required**: User

**Request Body**:
```json
{
  "reference": "BOOKA_userid_timestamp_key"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "order": {
      "id": "uuid",
      "status": "purchased",
      "paymentStatus": "successful",
      "qrCode": "BOOKA_ORDER_uuid_randomhex",
      "paidAt": "2025-12-06T10:30:00.000Z",
      "items": [ /* order items */ ]
    }
  }
}
```

**Notes**:
- Verifies payment with Paystack
- Reduces book inventory
- Generates QR code for order confirmation
- Updates order status to "purchased"

---

### 3. Get User Orders

**GET** `/my-orders`

**Auth Required**: User

**Query Parameters**:
- `status` (optional): Filter by order status
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "booksTotal": 45000,
        "serviceFee": 1200,
        "totalPrice": 46200,
        "status": "purchased",
        "paymentStatus": "successful",
        "fulfillmentType": "delivery",
        "fulfillmentDate": "2025-12-10T00:00:00.000Z",
        "createdAt": "2025-12-06T10:00:00.000Z",
        "items": [ /* order items */ ]
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 4. Get Order By ID (User)

**GET** `/order/:id`

**Auth Required**: User

**Response**: Returns order details if it belongs to the authenticated user

---

### 5. Assign Agent to Order (Manager Admin)

**POST** `/assign-agent`

**Auth Required**: Manager Admin

**Request Body**:
```json
{
  "orderId": "uuid",
  "agentId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Agent assigned successfully",
  "data": {
    "order": {
      "id": "uuid",
      "agentId": "uuid",
      "status": "confirmed",
      /* other order fields */
    }
  }
}
```

**Notes**:
- Agent must belong to the same university as the order
- Order status changes to "confirmed"
- Agent's `pendingOrdersCount` is incremented by 1

---

### 6. Update Order Status (Manager Admin or Agent)

**PATCH** `/update-status` (Admin) or `/agent-update-status` (Agent)

**Auth Required**: Manager Admin or Agent

**Request Body**:
```json
{
  "orderId": "uuid",
  "status": "ready" // "pending" | "confirmed" | "purchased" | "ready" | "completed" | "cancelled"
}
```

---

### 7. Get Orders for Admin

**GET** `/admin-orders`

**Auth Required**: Manager Admin

**Query Parameters**:
- `status` (optional): Filter by order status
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "user": {
          "name": "Student Name",
          "email": "student@university.edu"
        },
        "booksTotal": 45000,
        "serviceFee": 1200,
        "totalPrice": 46200,
        "status": "confirmed",
        "paymentStatus": "successful",
        "fulfillmentType": "delivery",
        "agentId": "uuid",
        "createdAt": "2025-12-06T10:00:00.000Z",
        "items": [ /* order items */ ]
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 8. Scan QR Code (Agent Only)

**POST** `/scan-qr` (in orders module) or `/scan-qr-code` (in agents module)

**Auth Required**: Agent

**Request Body**:
```json
{
  "qrCode": "BOOKA_ORDER_uuid_randomhex"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order confirmed successfully",
  "data": {
    "order": {
      "id": "uuid",
      "status": "completed",
      "qrCodeScannedAt": "2025-12-06T14:30:00.000Z",
      /* other order fields */
    }
  }
}
```

**Notes**:
- Marks order as "completed"
- Distributes commissions to agent and manager
- Agent's `pendingOrdersCount` is decremented by 1
- Agent's `totalCommissions` is increased by `agentCommission` amount
- Manager's `commissions` is increased by `managerCommission` amount

---

### 9. Get Orders for Agent

**GET** `/agent-orders`

**Auth Required**: Agent

**Query Parameters**:
- `status` (optional): Filter by order status
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "user": {
          "name": "Student Name",
          "email": "student@university.edu",
          "phoneNumber": "08012345678"
        },
        "booksTotal": 45000,
        "serviceFee": 1200,
        "agentCommission": 360,
        "totalPrice": 46200,
        "status": "confirmed",
        "fulfillmentType": "delivery",
        "fulfillmentDate": "2025-12-10T00:00:00.000Z",
        "fulfillmentTime": "10:00 AM",
        "deliveryAddress": "123 Main St, Lagos",
        "qrCode": "BOOKA_ORDER_uuid_randomhex",
        "createdAt": "2025-12-06T10:00:00.000Z",
        "items": [ /* order items */ ]
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

---

## Configs Module

Base path: `/api/configs`

### Available Config Keys

| Key | Default Value | Description |
|-----|---------------|-------------|
| `service_fee_pickup` | 200 | Service fee in naira per book for pickup orders |
| `service_fee_delivery` | 400 | Service fee in naira per book for delivery orders |
| `commission_pickup_agent` | 80 | Commission in naira per book for agent on pickup orders |
| `commission_pickup_manager` | 30 | Commission in naira per book for manager on pickup orders |
| `commission_delivery_agent` | 120 | Commission in naira per book for agent on delivery orders |
| `commission_delivery_manager` | 30 | Commission in naira per book for manager on delivery orders |
| `admin_app_url` | https://admin.booka.app | URL for the admin dashboard/app |
| `agent_app_url` | https://test.app.com | URL for downloading the Booka agent mobile app |

### 1. Get All Configs (Any Admin)

**GET** `/get-all-configs`

**Auth Required**: Any Admin

**Response**:
```json
{
  "success": true,
  "message": "Configs retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "key": "service_fee_pickup",
      "value": "200",
      "description": "Service fee charged per book for pickup orders",
      "updatedBy": "admin-uuid",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Config By Key (Any Admin)

**GET** `/get-config/:key`

**Auth Required**: Any Admin

**Example**: `/get-config/service_fee_pickup`

---

### 3. Update Config (Super Admin Only)

**PUT** `/update-config`

**Auth Required**: Super Admin

**Request Body**:
```json
{
  "key": "service_fee_delivery",
  "value": "450",
  "description": "Service fee charged per book for delivery orders"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Config updated successfully",
  "data": {
    "id": "uuid",
    "key": "service_fee_delivery",
    "value": "450",
    "description": "Service fee charged per book for delivery orders",
    "updatedBy": "admin-uuid",
    "updatedAt": "2025-12-06T15:00:00.000Z"
  }
}
```

**Note**: Creates new config if key doesn't exist (upsert)

---

### 4. Initialize Default Configs (Super Admin Only)

**POST** `/initialize-config`

**Auth Required**: Super Admin

**Response**: Creates all default configs if they don't exist

**Note**: Run this once during initial setup

---

## Waitlist Module

Base path: `/api/waitlists`

### 1. Join Waitlist

**POST** `/join`

**Auth Required**: None

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "08012345678",
  "university": "University of Lagos",
  "entity": "student" // "student" | "bookSeller" | "admin"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully joined the waitlist",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "08012345678",
    "university": "University of Lagos",
    "entity": "student",
    "createdAt": "2025-12-06T10:00:00.000Z"
  }
}
```

---

### 2. Get Waitlist Entry

**GET** `/:id`

**Auth Required**: None

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

---

## Common Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "issues": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Token expired or invalid"
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "You don't have permission to access this resource"
}
```

---

## Notes for Frontend Developers

### Cookie Management
- All authentication tokens are stored in HTTP-only cookies
- Cookies are automatically sent with requests (use `credentials: 'include'` in fetch)
- No need to manually manage tokens in localStorage

### Idempotency
- Order creation and agent signup use idempotency keys to prevent duplicates
- Generate a unique UUID v4 for each request
- If the same key is sent twice, the original response is returned

### Pagination
- Most list endpoints support pagination with `page` and `limit` query parameters
- Default: page=1, limit=20
- Maximum limit: 100 items per page

### Image Uploads
- Images should be base64-encoded strings
- Supported formats: JPEG, PNG, WebP
- Maximum size: 10MB (enforced by Cloudinary)

### Payment Flow
1. User creates order → receives `authorizationUrl`
2. Redirect user to Paystack checkout page
3. After payment, Paystack redirects back to your app
4. Call verify payment endpoint with the reference
5. Display QR code to user for order pickup/delivery

### QR Code Display
- The QR code string is returned after payment verification
- Use a QR code library (e.g., `qrcode.react`, `react-qr-code`) to display it
- User shows this QR code to the agent for order confirmation

### Commission Rates
- All commission values are configurable via the Configs module
- Commissions are calculated per book, not as percentages
- Default values:
  - Pickup: Agent 80₦/book, Manager 30₦/book
  - Delivery: Agent 120₦/book, Manager 30₦/book

---

## Testing Endpoints

Use this admin account for testing (created during development):
```
Email: super@booka.com
Password: super123
Role: super
```

**Note**: Change these credentials in production!

---

## Support

For questions or issues, contact the backend team or refer to the codebase documentation.

**Last Updated**: December 6, 2025
