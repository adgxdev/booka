import express, { Router } from "express";
import { createAdmin, loginAdmin, resetAdminPassword, refreshAdminToken, logoutAdmin, updatePersonalAdminInfo } from "./admin.controller";
import { isAnyAdminAuthenticated, isSuperAuthenticated } from "../../packages/middleware/isAuthenticated";

const router:Router = express.Router();

router.post("/create-admin", isSuperAuthenticated, createAdmin);
router.post("/login-admin", loginAdmin)
router.post("/reset-admin-password", isAnyAdminAuthenticated, resetAdminPassword)
router.post("/refresh-admin-token", refreshAdminToken)
router.get("/logout-admin", logoutAdmin)
router.put("/update-personal-admin-info", isAnyAdminAuthenticated, updatePersonalAdminInfo)

export default router;