# Reporting System Implementation Summary

## Overview
A comprehensive reporting system for managers to track order performance, agent productivity, financial metrics, and popular books. Reports are automatically generated at scheduled times (configurable) and can be viewed via API endpoints.

## Report Types

### 1. Daily Reports
- **Generated**: Every day at configured time (default: 23:00)
- **Data Range**: Previous day (midnight to midnight)
- **Storage**: `DailyReport` table with unique constraint on (universityId, reportDate)

### 2. Weekly Reports  
- **Generated**: Every Saturday at configured time (default: 23:00)
- **Data Range**: Monday to Sunday of previous week
- **Storage**: `WeeklyReport` table with unique constraint on (universityId, weekStartDate)

### 3. Monthly Reports
- **Generated**: Every 28th day of month at configured time (default: 23:00)
- **Data Range**: 1st to 28th of previous month
- **Storage**: `MonthlyReport` table with unique constraint on (universityId, reportMonth)

## Report Metrics

All report types include the same comprehensive metrics:

### Order Metrics
- `totalOrdersScheduled`: Total orders in period
- `completedPickups`: Completed pickup orders
- `completedDeliveries`: Completed delivery orders
- `missedSlots`: Orders with expired slots that weren't completed
- `reschedules`: Orders that were rescheduled (rescheduledCount > 0)

### Financial Metrics
- `totalOrderValue`: Sum of all booksTotal
- `totalServiceFees`: Sum of all serviceFee
- `totalRescheduleFees`: Sum of all reschedulingFee

### Agent Performance (JSON array)
Array of objects with:
```json
{
  "agentId": "uuid",
  "agentName": "Agent Name",
  "commissions": 1500.00,
  "successfulDeliveries": 12,
  "successfulPickups": 8
}
```

### Top 10 Books (JSON array)
Array of top 10 books sorted by order count:
```json
{
  "bookId": "uuid",
  "bookTitle": "Book Title",
  "orderCount": 45
}
```

## Database Schema

### Book Model Addition
```prisma
model Book {
  // ... existing fields
  orderCount Int @default(0) // Tracks total orders for this book
}
```

### DailyReport Model
```prisma
model DailyReport {
  id                    String   @id @default(uuid())
  universityId          String
  reportDate            DateTime @db.Date
  
  // Order metrics
  totalOrdersScheduled  Int
  completedPickups      Int
  completedDeliveries   Int
  missedSlots           Int
  reschedules           Int
  
  // Financial metrics
  totalOrderValue       Float
  totalServiceFees      Float
  totalRescheduleFees   Float
  
  // JSON data
  agentPerformance      Json
  topBooks              Json
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  university            University @relation(fields: [universityId], references: [id])
  
  @@unique([universityId, reportDate])
  @@index([reportDate])
}
```

### WeeklyReport Model
```prisma
model WeeklyReport {
  id                    String   @id @default(uuid())
  universityId          String
  weekStartDate         DateTime @db.Date
  weekEndDate           DateTime @db.Date
  
  // Same metrics as DailyReport
  // ...
  
  @@unique([universityId, weekStartDate])
  @@index([weekStartDate])
}
```

### MonthlyReport Model
```prisma
model MonthlyReport {
  id                    String   @id @default(uuid())
  universityId          String
  reportMonth           DateTime @db.Date // First day of month
  
  // Same metrics as DailyReport
  // ...
  
  @@unique([universityId, reportMonth])
  @@index([reportMonth])
}
```

## Configuration Keys

Added to config system (default values):

```typescript
{
  key: "daily_report_time",
  value: "23:00",
  description: "Time to generate daily reports (format: HH:mm, 24-hour)"
}

{
  key: "weekly_report_time",
  value: "23:00",
  description: "Time to generate weekly reports on Saturdays (format: HH:mm, 24-hour)"
}

{
  key: "monthly_report_time",
  value: "23:00",
  description: "Time to generate monthly reports on 28th (format: HH:mm, 24-hour)"
}
```

## Cron Jobs

All report jobs run every 10 minutes and check if conditions are met:

### Daily Reports
```typescript
cron.schedule('*/10 * * * *', async () => {
  const config = await prisma.config.findUnique({ where: { key: 'daily_report_time' }});
  const reportTime = config?.value || '23:00';
  const [hour, minute] = reportTime.split(':').map(Number);
  
  // Run if current time matches config (within 10 minute window)
  if (currentHour === hour && currentMinute >= minute && currentMinute < minute + 10) {
    await generateDailyReportsJob();
  }
});
```

### Weekly Reports
```typescript
cron.schedule('*/10 * * * *', async () => {
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek !== 6) return; // Only Saturday
  
  // Check time and run if matches
});
```

### Monthly Reports
```typescript
cron.schedule('*/10 * * * *', async () => {
  const dayOfMonth = new Date().getDate();
  if (dayOfMonth !== 28) return; // Only 28th
  
  // Check time and run if matches
});
```

## API Endpoints

### Manager - View Reports

#### Get Specific Daily Report
```http
GET /api/reports/daily?date=2024-01-15
Authorization: Bearer <manager_token>
```

Response:
```json
{
  "status": "success",
  "message": "Daily report retrieved successfully",
  "data": {
    "date": "2024-01-15",
    "metrics": {
      "totalOrdersScheduled": 45,
      "completedPickups": 12,
      "completedDeliveries": 28,
      "missedSlots": 3,
      "reschedules": 2
    },
    "financials": {
      "totalOrderValue": 125000.00,
      "totalServiceFees": 6250.00,
      "totalRescheduleFees": 200.00
    },
    "agentPerformance": [...],
    "topBooks": [...]
  }
}
```

#### List All Daily Reports
```http
GET /api/reports/daily/list?page=1&limit=20
Authorization: Bearer <manager_token>
```

Response includes summary list with pagination.

#### Weekly Reports
```http
GET /api/reports/weekly?week=2024-01-08  # Monday of the week
GET /api/reports/weekly/list?page=1&limit=20
```

#### Monthly Reports
```http
GET /api/reports/monthly?month=2024-01  # YYYY-MM format
GET /api/reports/monthly/list?page=1&limit=20
```

### Manager - View Agent Orders
```http
GET /api/orders/admin-orders/agent/:agentId?status=completed&page=1&limit=20
Authorization: Bearer <manager_token>
```

Response includes all orders assigned to specific agent with pagination.

### Manual Report Generation (Testing)
```http
POST /api/orders/generate-daily-reports
POST /api/orders/generate-weekly-reports
POST /api/orders/generate-monthly-reports
```

These endpoints allow manual triggering of report generation for testing purposes.

## Report Generation Logic

### Data Collection
1. Query all orders for university in date range
2. Filter by fulfillmentDate to match report period
3. Include related data: items, books, agent info

### Metrics Calculation
```typescript
// Order counts
totalOrdersScheduled = orders.length
completedPickups = orders.filter(o => o.fulfillmentType === 'pickup' && o.status === 'completed').length
completedDeliveries = orders.filter(o => o.fulfillmentType === 'delivery' && o.status === 'completed').length
missedSlots = orders.filter(o => o.slotExpired && o.status !== 'completed').length
reschedules = orders.filter(o => o.rescheduledCount > 0).length

// Financial totals
totalOrderValue = sum(orders.map(o => o.booksTotal))
totalServiceFees = sum(orders.map(o => o.serviceFee))
totalRescheduleFees = sum(orders.map(o => o.reschedulingFee))
```

### Agent Performance Aggregation
```typescript
// Group by agentId
for (order of orders) {
  if (order.status === 'completed') {
    agentStats[order.agentId].commissions += order.agentCommission
    if (order.fulfillmentType === 'delivery') {
      agentStats[order.agentId].successfulDeliveries++
    } else {
      agentStats[order.agentId].successfulPickups++
    }
  }
}
```

### Top Books Ranking
```typescript
// Group by bookId, sum quantities
for (order of orders) {
  for (item of order.items) {
    bookStats[item.bookId].orderCount += item.quantity
  }
}
// Sort descending, take top 10
topBooks = bookStats.sort((a, b) => b.orderCount - a.orderCount).slice(0, 10)
```

### Duplicate Prevention
- Unique constraints prevent duplicate reports
- Jobs check for existing report before creating
- If report exists for date/week/month, skip generation

## Book Order Count Tracking

When an order is completed (QR code scanned):
```typescript
// In scanQRCode controller
await tx.order.update({ 
  where: { id: orderId }, 
  data: { status: 'completed' } 
});

// Update book orderCount for each item
for (const item of order.items) {
  await tx.book.update({
    where: { id: item.bookId },
    data: { orderCount: { increment: item.quantity } }
  });
}
```

## Files Created/Modified

### New Files
- `src/jobs/generateDailyReports.job.ts` - Daily report generation
- `src/jobs/generateWeeklyReports.job.ts` - Weekly report generation
- `src/jobs/generateMonthlyReports.job.ts` - Monthly report generation
- `src/modules/reports/reports.controller.ts` - Report viewing controllers
- `src/modules/reports/index.ts` - Report routes

### Modified Files
- `prisma/schema.prisma` - Added Book.orderCount, DailyReport, WeeklyReport, MonthlyReport models
- `src/jobs/index.ts` - Integrated report generation cron jobs
- `src/modules/orders/order.controller.ts`:
  - Added `getOrdersByAgent` - Manager view agent orders
  - Added `generateDailyReports`, `generateWeeklyReports`, `generateMonthlyReports` - Manual triggers
  - Updated `scanQRCode` - Increment book.orderCount on completion
- `src/modules/orders/index.ts` - Added routes for agent orders and manual report triggers
- `src/modules/configs/config.controller.ts` - Added report time configurations
- `src/app.ts` - Registered reports router

## Usage Examples

### Viewing Today's Report
```javascript
// Manager checks yesterday's performance
const response = await fetch('/api/reports/daily?date=2024-01-14', {
  headers: { Authorization: `Bearer ${managerToken}` }
});

const report = await response.json();
console.log(`Yesterday: ${report.data.metrics.completedDeliveries} deliveries`);
console.log(`Top Agent: ${report.data.agentPerformance[0].agentName}`);
console.log(`Most Popular: ${report.data.topBooks[0].bookTitle}`);
```

### Viewing Agent Performance
```javascript
// Manager checks specific agent's orders
const response = await fetch('/api/orders/admin-orders/agent/agent-uuid-123', {
  headers: { Authorization: `Bearer ${managerToken}` }
});

const orders = await response.json();
console.log(`Agent has ${orders.data.total} total orders`);
```

### Manual Report Generation (Testing)
```bash
# Trigger daily report generation manually
curl -X POST http://localhost:3001/api/orders/generate-daily-reports

# Trigger weekly report generation
curl -X POST http://localhost:3001/api/orders/generate-weekly-reports

# Trigger monthly report generation
curl -X POST http://localhost:3001/api/orders/generate-monthly-reports
```

## Testing Checklist

- [ ] Run `npx prisma db push` to apply schema changes
- [ ] Initialize report time configs: POST /api/configs/initialize
- [ ] Create test orders for yesterday's date
- [ ] Manually trigger daily report: POST /api/orders/generate-daily-reports
- [ ] View generated report: GET /api/reports/daily?date=YYYY-MM-DD
- [ ] Verify agent performance JSON is correct
- [ ] Verify top books ranking is correct
- [ ] Test weekly report generation (Saturday)
- [ ] Test monthly report generation (28th)
- [ ] Test agent-specific order view
- [ ] Verify book orderCount increments on order completion
- [ ] Verify duplicate prevention (run generation twice)
- [ ] Test pagination on report lists
- [ ] Verify cron jobs respect configured times

## Notes

- Reports are generated for the **previous** period (yesterday, last week, last month)
- All timestamps use university's timezone (configurable via server timezone)
- Agent performance only includes completed orders
- Top books ranking uses total quantity ordered, not number of orders
- Book orderCount field tracks lifetime orders (never resets)
- Unique constraints prevent duplicate reports
- Cron jobs log to system audit logs
- Report times are configurable via Config table
- All report endpoints require manager authentication
