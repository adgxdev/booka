import express, { Router } from "express";
import { createAdmin, loginAdmin, resetAdminPassword, refreshAdminToken, logoutAdmin } from "./admin.controller";
import { isAnyAdminAuthenticated, isSuperAuthenticated } from "../../packages/middleware/isAuthenticated";

const router:Router = express.Router();

router.post("/create-admin", isSuperAuthenticated, createAdmin);
router.post("/login-admin", loginAdmin)
router.post("/reset-admin-password", isAnyAdminAuthenticated, resetAdminPassword)
router.post("/refresh-token", refreshAdminToken)
router.get("/logout-admin", logoutAdmin)

export default router;