import { Router } from "express";
import {
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    listDailyReports,
    listWeeklyReports,
    listMonthlyReports,
    getSuperAdminDailyReport,
    getSuperAdminWeeklyReport,
    getSuperAdminMonthlyReport,
    listSuperAdminDailyReports,
    listSuperAdminWeeklyReports,
    listSuperAdminMonthlyReports
} from "./reports.controller";
import { isManagerAuthenticated, isSuperAuthenticated } from "../../middlewares/isAuthenticated";

const router = Router();

// Manager routes - their own university only
router.get("/daily", isManagerAuthenticated, getDailyReport);
router.get("/daily/list", isManagerAuthenticated, listDailyReports);

router.get("/weekly", isManagerAuthenticated, getWeeklyReport);
router.get("/weekly/list", isManagerAuthenticated, listWeeklyReports);

router.get("/monthly", isManagerAuthenticated, getMonthlyReport);
router.get("/monthly/list", isManagerAuthenticated, listMonthlyReports);

// SuperAdmin routes - any university by ID (universityId in body)
router.post("/super/daily", isSuperAuthenticated, getSuperAdminDailyReport);
router.post("/super/daily/list", isSuperAuthenticated, listSuperAdminDailyReports);

router.post("/super/weekly", isSuperAuthenticated, getSuperAdminWeeklyReport);
router.post("/super/weekly/list", isSuperAuthenticated, listSuperAdminWeeklyReports);

router.post("/super/monthly", isSuperAuthenticated, getSuperAdminMonthlyReport);
router.post("/super/monthly/list", isSuperAuthenticated, listSuperAdminMonthlyReports);

export default router;
