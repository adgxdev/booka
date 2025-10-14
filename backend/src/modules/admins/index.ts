import express, { Router } from "express";
import { createAdmin, loginAdmin, resetAdminPassword, refreshAdminToken } from "./admin.controller";
import { isAnyAdminAuthenticated, isSuperAuthenticated } from "../../packages/middleware/isAuthenticated";

const router:Router = express.Router();

router.post("/create-admin", isSuperAuthenticated, createAdmin);
router.post("/login-admin", loginAdmin)
router.post("/reset-password", isAnyAdminAuthenticated, resetAdminPassword)
router.post("/refresh-token", refreshAdminToken)

export default router;