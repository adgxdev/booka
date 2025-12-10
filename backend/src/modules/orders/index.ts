import { Router } from "express";
import {
    createOrder,
    verifyPayment,
    getUserOrders,
    getOrderById,
    assignAgent,
    updateOrderStatus,
    scanQRCode,
    getOrdersForAdmin,
    getOrdersForAgent,
    rescheduleOrder,
    getAvailableTimeSlots,
    initializeReschedulePayment,
    expireOrderSlots,
    sendOrderReminders,
    getTodayOrdersForAdmin,
    getOrdersByAgent,
    generateDailyReports,
    generateWeeklyReports,
    generateMonthlyReports
} from "./order.controller";
import { isUserAuthenticated, isAnyAdminAuthenticated, isAgentAuthenticated, isManagerAuthenticated } from "../../middlewares/isAuthenticated";

const router = Router();

// Public route for getting available time slots
router.get("/available-time-slots", getAvailableTimeSlots);

// Cron job manual trigger endpoints for testing
router.post("/expire-slots", expireOrderSlots);
router.post("/send-reminders", sendOrderReminders);
router.post("/generate-daily-reports", generateDailyReports);
router.post("/generate-weekly-reports", generateWeeklyReports);
router.post("/generate-monthly-reports", generateMonthlyReports);

router.post("/create-order", isUserAuthenticated, createOrder);
router.post("/verify-payment", isUserAuthenticated, verifyPayment);
router.get("/my-orders", isUserAuthenticated, getUserOrders);
router.get("/order/:id", isUserAuthenticated, getOrderById);
router.post("/initialize-reschedule-payment", isUserAuthenticated, initializeReschedulePayment);
router.post("/reschedule-order", isUserAuthenticated, rescheduleOrder);


router.post("/assign-agent", isManagerAuthenticated, assignAgent);
router.patch("/update-status", isManagerAuthenticated, updateOrderStatus);
router.get("/admin-orders", isManagerAuthenticated, getOrdersForAdmin);
router.get("/admin-orders/agent/:agentId", isManagerAuthenticated, getOrdersByAgent);


router.post("/scan-qr", isAgentAuthenticated, scanQRCode);
router.patch("/agent-update-status", isAgentAuthenticated, updateOrderStatus);
router.get("/get-agent-orders", isAgentAuthenticated, getOrdersForAgent);
router.get("/get-admin-today-orders", isManagerAuthenticated, getTodayOrdersForAdmin);

export default router;
